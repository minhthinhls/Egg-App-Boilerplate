/** Import Application Placeholder from Egg:Modules !*/
import "egg";
/** Import ENUMS & CONSTANTS !*/
import {/*USER_STATUS*/} from "@/constants";

/* eslint-disable-next-line no-unused-vars */
import type {IBody} from "@/extend/context";
/* eslint-disable-next-line no-unused-vars */
import type {Next, ParameterizedContext} from "koa";
/* eslint-disable-next-line no-unused-vars */
import type {DefaultState, DefaultContext} from "koa";
/** Import Application Interface as Typings from Pre-Defined Types Helper !*/
import type {IContext, Intersection} from "@/extend/types";

declare module "egg" {
    export interface IMiddleware {
        sessionReducer: typeof middlewareFn;
    }
}

/** - Verify that whether the User has already logged in !*/
export const middlewareFn = () => async function (
    ctx: ParameterizedContext<DefaultState, Intersection<IContext, DefaultContext>, IBody>,
    next: Next,
): Promise<void | never> {

    /** JWT Token returned to Client on Verify Callback !*/
    const token = ctx.headers.token || ctx.headers.Authorization;
    /** Get User Redis Client from ``${config/config.default.js}`` !*/
    const authClient = ctx.app.redis.get('auth');
    const userClient = ctx.app.redis.get('user');
    /** Get corresponding User by specific JWT Token from Redis Database !*/
    const username = await authClient.get(token as string);
    if (!username) {
        /** Token is invalid or expired, please login again !*/
        return ctx.throw(401, new ClientError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại"));
    }
    /** Get corresponding JWT Token by specific User from Redis Database !*/
    const jwt = await userClient.get(username as string);
    if (jwt !== token) {
        /** Remove Timeout Session Token from RedisDB !*/
        await authClient.del(token as string);
        /** Another user has logged on new Client. Hence kick old session Client out !*/
        return ctx.throw(401, new ClientError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại"));
    }

    /** User Reference has been merged to Context Instance via Egg-Passport during Authorization process !*/
    if (!ctx.user) {
        /** Token is invalid or expired, please login again !*/
        return ctx.throw(401, new ClientError(`Một thiết bị khác đang đăng nhập tài khoản ${username}`));
    }

    return next();
};

/** For ES6 Default Import Statement !*/
export default middlewareFn;

/** For ES5 Default Import Statement !*/
module.exports = middlewareFn;
