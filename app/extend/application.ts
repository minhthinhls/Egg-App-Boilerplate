/* eslint valid-jsdoc: "off", complexity: "off" */

/** @ts-nocheck - Turn this on to ignore this file !*/

"use strict";

/** Import Application Placeholder from Egg:Modules !*/
import "egg";

/** Import constants !*/
import {USER_LOGIN_STATUS/*, ERROR_CODE*/} from "@/constants";
/** Import ES6 Default Dependencies !*/
import {/*isPlainObject*/} from "lodash";
/** Import ES6 Default Dependencies !*/
import {/*UAParser*/} from "ua-parser-js";
/** Import ES6 Default Dependencies !*/
import validator from "validator";

/** Import ES6 Custom [Utils && Helper] Dependencies !*/
import type {RecursivePartial/*, Primitives*/} from "@/extend/helper";
/** Import ES6 Custom [Utils && Helper] Dependencies !*/
import type {IApplication, IContext/*, PlainObject*/} from "@/extend/types";
/** Import Models Attributes Defined Types !*/
import type {IAttributes as IUserAttributes} from "@/model/user";

declare module "@/extend/types" {
    export interface IApplication {
        enablePassport(this: IApplication): Promise<void>;
    }
}

declare module "egg-passport" {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    export interface EggPassport {
        /** Verification Process !*/
        verify<TUser = any, TID = any>(fn: (ctx: IContext, id: TID) => Promise<TUser>): void;

        /** Serialization Process !*/
        serializeUser<TUser = any, TID = any>(fn: (ctx: IContext, user: TUser) => TID): void;

        serializeUser<TID = any>(id: TID, req: IContext['request'], done: (err: any, id?: TID) => void): void;

        /** De-serialization Process !*/
        deserializeUser<TID = any>(fn: (ctx: IContext, id: TID) => void): void;

        deserializeUser<TUser = any, TID = any>(fn: (ctx: IContext, id: TID) => Promise<TUser>): void;

        deserializeUser<TID = any>(ctx: IContext['request'], id: TID): void;

        deserializeUser<TUser = any, TID = any>(ctx: IContext['request'], id: TID): Promise<TUser>;

        /**
         ** @description Will trigger every callback inside ``${this.passport.deserializeUser(callbacks);}``
         ** @example
         ** > this.passport.deserializeUser((ctx) => ({...user}));
         ** @param {IContext} ctx
         ** @param {IUserAttributes} user - Default User when Array<Handler> are EMPTY !
         **/
        _handleDeserializeUser<TUser extends IUserAttributes = IUserAttributes>(
            ctx: IContext,
            user?: TUser,
        ): Promise<TUser>; ///<reference types="egg-passport/lib/passport"/>
    }
}

export default class __Application__ {

    /**
     ** - Register Egg Passport Middleware to the very first Application Workflow.
     ** - Handler will execute before Request Jump into Customized Application Middlewares.
     ** @this {IApplication}
     ** @protected
     **/
    protected async enablePassport(this: IApplication) {
        const getUserLoginInfo = (ctx: IContext) => {
            const ips = (ctx.header['x-forwarded-for']
                || ctx.header['X-Forwarded-For']
                || ctx.header['x-real-ip']
                || ctx.realIP) as string;
            /** Pick the right most IP if exist, otherwise use ``localhost`` as default to temporary avoid Sequelize Type Error !*/
            const [ip = '127.0.0.1'] = ips.split(',').filter(ip => Boolean(ip)).slice(-1);

            const userAgent = (ctx.header['user-agent'] || ctx.header['User-Agent']) as string;
            return {ip, userAgent};
        };
        /** Verify User Authorization via this Localized Function !*/
        const localHandler = async (ctx: IContext, auth: {username: string, password: string}) => {
            const {username, password} = auth;
            const {ip} = getUserLoginInfo(ctx);
            if (!username || !password || !validator.isMD5(password)) {
                /** Invalid username or password */
                throw new ClientError("Tên đăng nhập hoặc mật khẩu không hợp lệ", 422);
            }

            const user = await ctx.service.user.findUserByLocal({
                username
            });

            if (!user) {
                /** Wrong username or password */
                throw new ClientError("Sai tên người dùng hoặc mật khẩu", 401);
            }

            if (user.status === 'CLOSED') {
                /** Account has been closed. Please contact our support team */
                throw new ClientError("Tài khoản đã bị đóng. Liên hệ đội hỗ trợ để được giúp đỡ", 406);
            }

            if (user.password !== password) {
                await ctx.service.user.loginFailedHandler({username});
                /** Wrong username or password */
                throw new ClientError("Sai tên người dùng hoặc mật khẩu", 401);
            }

            /** @deprecated ~!*/
            if (!user.emailVerified) {
                throw new ClientError("Tài khoản của bạn chưa được xác minh", 401);
            }

            if (user.status === 'CLOSED') {
                /** Account has been closed. Please contact our support team */
                throw new ClientError("Tài khoản đã bị đóng. Liên hệ đội hỗ trợ để được giúp đỡ", 406);
            }

            /** If user has previous failed login, clear all failed cache !*/
            if (user.loginFailed) {
                await ctx.service.user.unlockUser({username});
            }

            /** Update token to db !*/
            const token = Buffer.from(`${username}:${password}`).toString('base64');
            const isActivePassword2 = user.password2 === password;

            await ctx.service.user.updateUser(user.id, {token, isActivePassword2, ip});

            /** Sign JWT Token !*/
            const signature = this.jwt.sign({
                ...ctx.helper.pick({...user}, [
                    'id',
                    'username',
                    'status',
                    'level',
                    'role',
                ]),
            }, `0x97`, {
                expiresIn: "2h",
            });

            /** Get User Redis Client from ``${config/config.default.js}`` !*/
            const userClient = this.redis.get('user');
            const authClient = this.redis.get('auth');
            /** Set User and corresponding JWT Token from Redis Database !*/
            await userClient.set(user.username, signature, "Ex", /** 2 hours */ 2 * 60 * 60);
            await authClient.set(signature, user.username, "Ex", /** 2 hours */ 2 * 60 * 60);

            /** Assign token value to user info !*/
            return ctx.print = {
                userInfo: ctx.helper.omit({
                    ...user,
                    token: signature,
                    ip: ip,
                }, ['password', 'password2']),
            };
        };

        /**
         ** @example - Verify callback will be invoked when trigger Passport Authenticate Method.
         ** > app.passport.authenticate(`strategy`, {}: AuthenticateOptions);
         ** @note - This callback implicit call ``ctx.login({...user});`` and hence load `user` instance into ``ctx.user;``
         ** Thus we would not need to explicit calling ``ctx.login({...user});`` on any other middlewares
         **/
        this.passport.verify(async (ctx: IContext, user) => {
            const {ip, userAgent} = getUserLoginInfo(ctx);
            try {
                const {userInfo} = await localHandler(ctx, user);
                /** Provide tracking logger for multiple logging status !*/
                await ctx.service.user.writeLoginLog({
                    userId: userInfo.id,
                    ip: ip,
                    userAgent: userAgent,
                    loginStatus: USER_LOGIN_STATUS.SUCCESS
                });
                /** Implicit call > ``ctx.login({...userInfo});`` */
                return userInfo;
            } catch (error) {
                const userInfo = await ctx.model.User.findOne({
                    where: {
                        username: user.username,
                    },
                });
                if (userInfo) {
                    await ctx.service.user.writeLoginLog({
                        userId: userInfo.id,
                        ip: ip,
                        userAgent: userAgent,
                        loginStatus: USER_LOGIN_STATUS.FAILED
                    });
                }
                /** Caught handled errors !*/
                if (error instanceof ClientError) {
                    return ctx.print = {
                        errorCode: error.status,
                        errorMsg: error,
                    };
                }
                return this.logger.error(error);
            }
        });

        /** Serialize the user information and store it in the session. Generally, it needs to be streamlined and only save individual fields !*/
        this.passport.serializeUser<IUserAttributes, Promise<string>>(async (ctx: IContext, user) => {
            /** User here will have the value of ``ctx.login({..user});`` or ``passport.verify(() => ({...user}));`` */

            /** Get User Redis Client from ``${config/config.default.js}`` !*/
            const userClient = this.redis.get('user');
            /** Get corresponding JWT Token by specific User from Redis Database !*/
            const serialize = await userClient.get(user.username);
            if (!serialize) {
                return Promise.resolve(``);
            }
            return ctx.helper.ensure(serialize);
        });

        /**
         ** @process After deserialization, take out the user information from the session, and check the database to get the complete information !
         ** @take-note Keep in mind that this deserialize function will not run if CLIENT did not set Credentials from HTTP Request.
         ** @description Hence the following header flag must be set to TRUE: ``Access-Control-Allow-Credentials: true;``
         **////<reference types="egg-passport/lib/passport"/>
        this.passport.deserializeUser<RecursivePartial<IUserAttributes>>(async (ctx: IContext/*, serializeToken*/) => {
            /** JWT Token returned to Client on Verify Callback !*/
            const token = ctx.headers.token || ctx.headers.Authorization;
            /** Get User Redis Client from ``${config/config.default.js}`` !*/
            const authClient = this.redis.get('auth');
            const userClient = this.redis.get('user');
            /** Get corresponding User by specific JWT Token from Redis Database !*/
            const username = await authClient.get(token as string);
            if (!username) {
                /** Deserialize Default User (Empty) !*/
                return void 0;
            }
            /** Get corresponding JWT Token by specific User from Redis Database !*/
            const jwt = await userClient.get(username as string);
            if (jwt !== token) {
                /** Remove Timeout Session Token from RedisDB !*/
                await authClient.del(token as string);
                /** Another user has logged on new Client. Hence kick old session Client out !*/
                return void 0;
            }
            /** Check whether token exist inside RedisDB or not !*/
            return this.jwt.decode(token as string);
        });
    }

}

/** For ES5 Default Import Statement !*/
module.exports = Object.getPrototypeOf(new __Application__());
