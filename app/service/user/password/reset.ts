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
import type {IAttributes, ICreationAttributes} from "@/model/user/password/reset";
/** Import Deep Nested Models Attributes Defined Types !*/
import type {/*IModelDeepAttributes*/} from "@/extend/types";
/** Import Models Attributes Defined Types !*/
import type {/*IAttributes as IUserAttributes*/} from "@/model/user";

/** Sequelize TRANSACTION & LOCKER INTERFACES !*/
import type {/*Transaction, LOCK*/} from "sequelize/types/lib/transaction";
/** Sequelize INCREMENT & DECREMENT OPTION INTERFACES !*/
import type {/*IncrementDecrementOptions, IncrementDecrementOptionsWithBy*/} from "sequelize/types/lib/model";

const __TEMPLATE__ = Handlebars.compile(`
    <html lang="VN">
        <head>
            <title></title>
            <style></style>
        </head>
        <body>
            <p>Chào {{name}},</p>
            <p>Bạn đã gửi yêu cầu đổi mật khẩu.</p>
            <p>Vui lòng nhấn vào link bên dưới để đặt lại mật khẩu.</p>
            <a href="{{link}}">Đặt lại mật khẩu</a>
        </body>
    </html>
`);

export default class ResetPasswordService extends BaseService<IAttributes, ICreationAttributes> {

    /** TODO: Later on put this secret NONCE into ENV file !*/
    protected __NONCE__: 0x97;

    /**
     ** @constructor
     ** @param {IContext} ctx
     **/
    constructor(ctx: BaseService["ctx"]) {
        super(ctx);
        this.model = ctx.model.User.Password.Reset;
    }

    /**
     ** - Create new Reset-Password Token & Insert into Database.
     ** @param {PlainObject} data
     ** @returns {Promise<*>}
     ** @ts-ignore ~!*/
    async create<T extends {
        username: string;
    }>(data: T) {
        const {ctx} = this;

        /** - Find token-record corresponding to this username !*/
        const record = await ctx.model.User.Password.Reset.findOne({
            where: {
                username: data.username,
            },
            raw: true,
        });

        if (record) {
            /** Token will be expired after 30 minutes !*/
            if (moment().diff(moment(record.createdAt), "minutes") >= 30) {
                /** Delete that expired token record !*/
                await ctx.model.User.Password.Reset.destroy({
                    where: {
                        username: data.username,
                    },
                });
            } else {
                return record;
            }
        }

        /** - Find user corresponding to this username !*/
        const user = await ctx.model.User.findOne({
            where: {
                username: data.username,
            },
            rejectOnEmpty: true,
        });

        /** - Hashing [Nonce && Username && Timestamp] !*/
        const hash = ctx.crypto.MD5(data.username + this.__NONCE__ + Date.now());

        /** - Store Hashed value into MySQL Schema !*/
        return ctx.model.User.Password.Reset.create({
            uid: user.id,
            username: data.username,
            token: hash.toString(),
        });
    }

    /**
     ** - Send Email via Google OAuth2
     ** @param {PlainObject} data
     ** @returns {Promise<*>}
     **/
    async email<T extends Partial<{
        email: string;
        phone: string;
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
        /** Actually this step can be ignored since EggJS inherit OAuth2 Instance from Configs !*/
        oAuth2Client.setCredentials({
            refresh_token: process.env.REFRESH_TOKEN
        });

        /** - Find user corresponding to this username !*/
        const user = await ctx.model.User.findOne({
            where: ctx.helper.removeNullableKeyFrom({
                email: data.email,
                phoneNumber: data.phone,
                username: data.username,
            }),
            /** Do not use this for friendly error message */
            // rejectOnEmpty: true,
            raw: true,
        });

        /** - Find user corresponding to this username !*/
        if (!user) {
            return ctx.throw(404, new ClientError("Email không có trong hệ thống. Vui lòng kiểm tra lại."));
        }

        /** - [Find or Create] token-record corresponding to this username !*/
        const {token} = await this.create({
            username: user.username,
        });

        const {VCASH_MEMBER_CLIENT_SITE} = process.env;
        if (!VCASH_MEMBER_CLIENT_SITE) {
            throw new ReferenceError("Cannot found property [VCASH_MEMBER_CLIENT_SITE] inside .ENV file");
        }

        return app.mailer.send({
            from: `KDO88.NET: <${process.env.HOST_EMAIL}>`,
            /** TODO: Will delete private email before deploying to production !*/
            to: [user.email],
            subject: "Lấy lại mật khẩu - KDO88 🔐",
            text: "Lấy lại mật khẩu - KDO88 🔐",
            html: __TEMPLATE__({
                name: user.username,
                link: `${VCASH_MEMBER_CLIENT_SITE}/reset-password?token=${token}`,
            }),
        });
    }

    /**
     ** - Reset User Password API.
     ** @param {PlainObject} data
     ** @returns {Promise<*>}
     **/
    async exec<T extends {
        password: string;
        p_confirm: string;
        token: string;
    }>(data: T) {
        const {app, ctx} = this;
        const {ISOLATION_LEVELS} = app.Sequelize.Transaction;

        if (data.password.trim() !== data.p_confirm.trim()) {
            return ctx.throw(400, new ClientError("Mật khẩu và xác nhận mật khẩu không giống nhau."));
        }

        /** - Find token-record corresponding to this username !*/
        const record = await ctx.model.User.Password.Reset.findOne({
            where: {
                token: data.token,
            },
            raw: true,
        });
        if (!record || moment().diff(moment(record.createdAt), "minutes") >= 30) {
            return ctx.throw(400, new ClientError("Token không hợp lệ hoặc đã hết hạn sử dụng."));
        }

        if (record.token !== data.token) {
            return ctx.throw(400, new ClientError("Token không hợp lệ."));
        }

        return await ctx.model.transaction({isolationLevel: ISOLATION_LEVELS.READ_COMMITTED}, async (tx) => {
            /** Reset password here !*/
            const [[numRecord]] = await Promise.all([
                ctx.model.User.update(ctx.helper.removeNullableKeyFrom({
                    password: ctx.crypto.MD5(data.password.trim()).toString(),
                }), {
                    where: {
                        id: record.uid,
                    },
                    transaction: tx,
                }),
                /** Update success then delete token !*/
                ctx.model.User.Password.Reset.destroy({
                    where: {
                        username: record.username,
                    },
                    transaction: tx,
                }),
            ]);

            /** Get User Redis Client from ``${config/config.default.js}`` !*/
            const userClient = app.redis.get('user');
            await userClient.del(record.username as string);

            return Boolean(numRecord);
        });
    }

}

/** For ES5 Default Import Statement !*/
module.exports.default = ResetPasswordService;
