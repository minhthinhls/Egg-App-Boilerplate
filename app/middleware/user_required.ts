/** Import Application Placeholder from Egg:Modules !*/
import "egg";
/** Import ENUMS & CONSTANTS !*/
import {USER_STATUS} from "@/constants";

/* eslint-disable-next-line no-unused-vars */
import type {IBody} from "@/extend/context";
/* eslint-disable-next-line no-unused-vars */
import type {Next, ParameterizedContext} from "koa";
/* eslint-disable-next-line no-unused-vars */
import type {DefaultState, DefaultContext} from "koa";

declare module "egg" {
    export interface IMiddleware {
        userRequired: typeof middlewareFn;
    }
}

/** - Verify that whether the User has already logged in !*/
export const middlewareFn = () => async function (
    ctx: ParameterizedContext<DefaultState, DefaultContext, IBody>,
    next: Next,
): Promise<void | any> {

    /** User Reference has been merged to Context Instance via Egg-Passport during Authorization process !*/
    if (!ctx.user) {
        /** Token is invalid or expired, please login again !*/
        return ctx.throw(401, new ClientError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại"));
    }

    if (ctx.user.status === USER_STATUS.CLOSED) {
        return ctx.throw(401, new ClientError("Tài khoản đã bị đóng. Vui lòng liên hệ đội hỗ trợ"));
    }

    return next();
};

/** For ES6 Default Import Statement !*/
export default middlewareFn;

/** For ES5 Default Import Statement !*/
module.exports = middlewareFn;
