'use strict';

/** Import Environment Dependencies !*/
import "$/dotenv.config.js";

/** Import Core Dependencies !*/
import {BaseService} from "@/extend/class";

/** Import ES6 Default Dependencies !*/
import {google} from "googleapis";
/** Import ES6 Default Dependencies !*/
import * as moment from "moment-timezone";
/** Import ES6 Default Dependencies !*/
import * as Handlebars from "handlebars";

/** Import Models Attributes Defined Types !*/
import type {IAttributes, ICreationAttributes} from "$/app/model/user/email_verification/token";
/** Import Deep Nested Models Attributes Defined Types !*/
import type {/*IModelDeepAttributes*/} from "@/extend/types";
/** Import Models Attributes Defined Types !*/
/* eslint-disable-next-line no-unused-vars */// @ts-ignore
import type {IAttributes as IUserAttributes} from "@/model/user";

const __TEMPLATE__ = Handlebars.compile(`
    <html lang="VN">
        <head>
            <title></title>
            <style></style>
        </head>
        <body>
            <p>Chào {{name}},</p>
            <p>Bạn chỉ còn một bước nữa để kích hoạt tài khoản KDO88 của mình.</p>
            <p>Vui lòng nhấn vào vào link dưới đây để tiến hành xác minh địa chỉ email.</p>
            <a href="{{link}}">Xác minh địa chỉ email</a>
        </body>
    </html>
`);

const __OTP_TEMPLATE__ = Handlebars.compile(`
    <html lang="VN">
        <head>
            <title></title>
            <style></style>
        </head>
        <body>
            <p>Chào {{name}},</p>
             <p>Bạn đã gửi yêu cầu thay đổi email.</p>
            <p>Mã OTP để xác minh email mới của bạn là: {{otp}}</p>
        </body>
    </html>
`);

export default class EmailVerificationService extends BaseService<IAttributes, ICreationAttributes> {

    /** TODO: Later on put this secret NONCE into ENV file !*/
    protected __NONCE__: 0x97;

    /**
     ** @constructor
     ** @param {IContext} ctx
     **/
    constructor(ctx: BaseService["ctx"]) {
        super(ctx);
        this.model = ctx.model.User.EmailVerification.Token;
    }

    /**
     ** - Create new OTP and save to redis.
     ** @param {PlainObject} data
     ** @returns {Promise<*>}
     ** @ts-ignore ~!*/
    async createOTP<T extends {
        uid: string;
    }>(data: T) {
        const {app} = this;
        /** Generate OTP */
        const otp = Math.floor(100000 + Math.random() * 900000);
        /** Get User Redis Client from ``${config/config.default.js}`` !*/
        const userClient = app.redis.get('user');
        /** - Store Hashed value into MySQL Schema !*/
        const cachedKey = JSON.stringify({otp: otp.toString(), userId: data.uid});
        await userClient.set(cachedKey, otp, "Ex", /** 30 mins */ 30 * 60);
        return otp;
    }

    /**
     ** - Create new Verification Token & Insert into Database.
     ** @param {PlainObject} data
     ** @returns {Promise<*>}
     ** @ts-ignore ~!*/
    async create<T extends {
        uid: string;
    }>(data: T) {
        const {ctx} = this;

        /** - Find token-record corresponding to this username !*/
        const record = await ctx.model.User.EmailVerification.Token.findOne({
            where: {
                uid: data.uid,
            },
            raw: true,
        });

        if (record) {
            /** Token will be expired after 30 minutes !*/
            if (moment().diff(moment(record.createdAt), "minutes") >= 30) {
                /** Delete that expired token record !*/
                await ctx.model.User.EmailVerification.Token.destroy({
                    where: {
                        uid: data.uid,
                    },
                });
            } else {
                return record;
            }
        }

        /** - Find user corresponding to this id !*/
        const user = await ctx.model.User.findOne({
            where: {
                id: data.uid,
            },
            rejectOnEmpty: true,
        });

        /** - Hashing [Nonce && UserId && Timestamp] !*/
        const hash = ctx.crypto.MD5(data.uid + this.__NONCE__ + Date.now());

        /** - Store Hashed value into MySQL Schema !*/
        return ctx.model.User.EmailVerification.Token.create({
            uid: user.id,
            token: hash.toString(),
        });
    }

    /**
     ** - Send Email via Google OAuth2
     ** @param {PlainObject} data
     ** @returns {Promise<*>}
     **/
    async send<T extends Partial<{
        email: string;
        username: string;
    }>>(data: T) {
        const {app, ctx} = this;
        /**
         ** @see {@link https://www.youtube.com/watch?v=-rcRf7yswfM} - OAuth2 Tutorial for Nodemailer NodeJS
         ** @see {@link https://console.cloud.google.com/apis/credentials/oauthclient/1085156282402-lgc3ashh26ah5duincav3n3op4hf6f6n.apps.googleusercontent.com?organizationId=0&project=node-mailer-api-332208}
         ** @see {@link https://developers.google.com/oauthplayground/?code=4/0AX4XfWjdBNRbsBoCV9hHw3EAaDlYHqIieGkPYs0tFuw8lXy2F6_MF4FffcshRElIyWtSYA&scope=https://mail.google.com/}
         ** @protected
         **/
        const oAuth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URI,
        );
        oAuth2Client.setCredentials({
            refresh_token: process.env.REFRESH_TOKEN
        });

        /** - Find user corresponding to this username !*/
        const user = await ctx.model.User.findOne({
            where: ctx.helper.removeNullableKeyFrom({
                email: data.email,
                username: data.username,
            }),
            raw: true,
        });

        /** - Find user corresponding to this user email !*/
        if (!user) {
            return ctx.throw(404, new ClientError("Email không có trong hệ thống. Vui lòng kiểm tra lại."));
        }
        /** - [Find or Create] token-record corresponding to this user !*/
        const {token} = await this.create({
            uid: user.id,
        });

        const {VCASH_MEMBER_CLIENT_SITE} = process.env;
        if (!VCASH_MEMBER_CLIENT_SITE) {
            throw new ReferenceError("Cannot found property [VCASH_MEMBER_CLIENT_SITE] inside .ENV file");
        }

        return app.mailer.send({
            from: `KDO88.NET: <${process.env.HOST_EMAIL}>`,
            /** TODO: Will delete private email before deploying to production !*/
            to: [user.email],
            subject: "Chào mừng đến với KDO88",
            text: "Chào mừng đến với KDO88",
            html: __TEMPLATE__({
                name: user.username,
                link: `${VCASH_MEMBER_CLIENT_SITE}/email-verification?token=${token}`,
            }),
        });
    }

    /**
     ** - Verify Email Verification Token API.
     ** @param {PlainObject} data
     ** @returns {Promise<*>}
     **/
    async verify<T extends {
        token: string;
    }>(data: T) {
        const {app, ctx} = this;
        const {ISOLATION_LEVELS} = app.Sequelize.Transaction;

        /** - Find token-record corresponding to this user !*/
        const record = await ctx.model.User.EmailVerification.Token.findOne({
            where: {
                token: data.token,
            },
            raw: true,
        });
        if (!record || moment().diff(moment(record.createdAt), "minutes") >= 30) {
            return ctx.throw(400, new ClientError("Token không hợp lệ hoặc đã hết hạn sử dụng."));
        }

        /** - Find user corresponding by record uid !*/
        const user = await ctx.model.User.findOne({
            where: {id: record.uid},
            raw: true,
        });
        if (!user) {
            return ctx.throw(404, new ClientError("User không có trong hệ thống. Vui lòng kiểm tra lại."));
        }

        if (user.emailVerified) {
            return;
        }

        return await ctx.model.transaction({isolationLevel: ISOLATION_LEVELS.READ_COMMITTED}, async (tx) => {
            /** Reset password here !*/
            const [[numRecord]] = await Promise.all([
                ctx.model.User.update({emailVerified: true}, {
                    where: {
                        id: record.uid,
                    },
                    transaction: tx,
                }),
                /** Update success then delete token !*/
                ctx.model.User.EmailVerification.Token.destroy({
                    where: {
                        uid: record.uid,
                    },
                    transaction: tx,
                }),
            ]);
            return Boolean(numRecord);
        });
    }

    /**
     ** - Send OTP to Email via Google OAuth2
     ** @param {PlainObject} data
     ** @returns {Promise<*>}
     **/
    async sendOTP<T extends {
        uid: string;
        email: string;
        password: string;
    }>(data: T) {
        const {app, ctx} = this;
        /** - Find user corresponding to this uid !*/
        const user = await this.service.user.findUserByUid(data.uid, {
            attributes: {
                exclude: [],
            },
        });

        if (!user) {
            throw new ReferenceError("Cannot found the following User according to their Unique ID");
        }

        const curPasswordHashed = ctx.crypto.MD5(data.password.trim()).toString();
        if (user.password !== curPasswordHashed) {
            return ctx.throw(400, new ClientError("Mật khẩu hiện tại không đúng"));
        }

        const oAuth2Client = new google.auth.OAuth2(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URI,
        );
        oAuth2Client.setCredentials({
            refresh_token: process.env.REFRESH_TOKEN
        });

        const otp = await this.createOTP({
            uid: user.id,
        });

        return app.mailer.send({
            from: `EDGAR: <edgar@v3t.io>`,
            /** TODO: Will delete private email before deploying to production !*/
            to: [data.email],
            subject: "KDO88: OTP để cập nhật email",
            text: "KDO88: OTP để cập nhật email",
            html: __OTP_TEMPLATE__({
                name: user.username,
                otp: otp,
            }),
        });
    }

    /**
     ** - Verify email OTP API.
     ** @param {PlainObject} data
     ** @returns {Promise<*>}
     **/
    async verifyOTP<T extends {
        otp: string;
        uid: string;
    }>(data: T) {
        const {app} = this;
        if (!data.otp) {
            return false;
        }
        /** - Find otp corresponding to this user !*/
        const cachedKey = JSON.stringify({otp: data.otp, userId: data.uid});

        const userClient = app.redis.get('user');
        const otp = await userClient.get(cachedKey);

        return !(!otp || otp !== data.otp);
    }

}

/** For ES5 Default Import Statement !*/
module.exports.default = EmailVerificationService;
