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
        /** Put this Hook Middleware before any router middlewares,
         ** that require logout process after finished !*/
        logoutHook: typeof middlewareFn;
    }
}

/** - Verify that whether the User has already logged in !*/
export const middlewareFn = () => async function (
    ctx: ParameterizedContext<DefaultState, Intersection<IContext, DefaultContext>, IBody>,
    next: Next,
): Promise<void | never> {
    /** Wait until later registered middlewares resolved !*/
    await next();
    /** Then logout user from the session, which mean clearing cookie and ``${ctx.user}`` reference !*/
    await ctx.logout();
    /** Finally clearing JWT Token of current logged in User in RedisDB !*/
    const token = ctx.headers.token || ctx.headers.Authorization;
    /** Get User Redis Client from ``${config/config.default.js}`` !*/
    const authClient = ctx.app.redis.get('auth');
    const userClient = ctx.app.redis.get('user');
    /** Get corresponding User by specific JWT Token from Redis Database !*/
    const username = await authClient.get(token as string);
    if (!username) {
        /** This user has already logged out !*/
        return void 0;
    }
    /** Get corresponding JWT Token by specific User from Redis Database !*/
    await authClient.del(token as string);
    await userClient.del(username as string);
};

/** For ES6 Default Import Statement !*/
export default middlewareFn;

/** For ES5 Default Import Statement !*/
module.exports = middlewareFn;
