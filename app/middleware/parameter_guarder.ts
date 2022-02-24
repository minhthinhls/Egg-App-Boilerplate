/** Import Application Placeholder from Egg:Modules !*/
import "egg";
/** Import ENUMS & CONSTANTS !*/
import {ROLE} from "@/constants";

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
        parameterGuarder: typeof middlewareFn;
    }
}

/**
 ** - Merge all Properties from [[Request Body]] && [[Request Query / Queries]] into [[Request Params]].
 ** @description
 ** - Some how Client Side has Role of [[MEMBER]] start an attack of Query Parameter Pollution.
 ** + First case: Injecting [uid: string] or [uids: Array<string>] into Request Body or Request Query.
 ** @example
 ** > ctx.params = {uid: string, uids: Array<string>};
 **/
export const middlewareFn = () => async function (
    ctx: ParameterizedContext<DefaultState, Intersection<IContext, DefaultContext>, IBody>,
    next: Next,
): Promise<void | never> {

    /** Step 1: By pass this middleware if User Context has been omitted !*/
    if (!ctx.user) {
        return next(); // Skip whether this is an Empty User Context Request.
    }

    /** Step 2: Checking for QUERY PARAMS POLLUTION from Request Query && Request Body !*/
    const params = Object.keys({...ctx.params});
    for (let i = 0; i < params.length; i++) {
        const key = params[i];
        /** User cannot inject [uid] and [uids] when making request to Server !*/
        if ([ROLE.MEMBER].includes(ctx.user.role.name) && ['uid', 'uids'].includes(key)) {
            /** Skip key name has Array tag !*/
            return ctx.throw(403, new ClientError("Forbidden", 403));
        }
    }

    return next();
};

/** For ES6 Default Import Statement !*/
export default middlewareFn;

/** For ES5 Default Import Statement !*/
module.exports = middlewareFn;
