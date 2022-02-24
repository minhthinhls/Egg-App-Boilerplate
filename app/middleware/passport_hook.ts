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
        passportHook: typeof middlewareFn;
    }
}

/** - Load User into Context Instance if Request has Authorization !*/
export const middlewareFn = () => async function (
    ctx: ParameterizedContext<DefaultState, Intersection<IContext, DefaultContext>, IBody>,
    next: Next,
): Promise<void | never> {

    /** Get User using Deserialize Hook inside ``${app.passport.deserializeUser(() => {...user})}`` !*/
    await ctx.reload();

    return next();
};

/** For ES6 Default Import Statement !*/
export default middlewareFn;

/** For ES5 Default Import Statement !*/
module.exports = middlewareFn;
