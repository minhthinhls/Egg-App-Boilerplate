/* eslint valid-jsdoc: "off", complexity: "off", no-unused-vars: "off", @typescript-eslint/naming-convention: "off" */

/** @ts-nocheck - Turn this on to ignore this file !*/

"use strict";

/** Import Application Placeholder from Egg:Modules !*/
import "egg";
/** Import ENUMS & CONSTANTS !*/
import {/*USER_STATUS*/} from "@/constants";

/** Import ES6 Custom [Utils && Helper] Dependencies !*/
import * as Helper from "@/extend/helper";

/* eslint-disable-next-line no-unused-vars */
import type {IBody} from "@/extend/context";
/* eslint-disable-next-line no-unused-vars */
import type {Next, ParameterizedContext} from "koa";
/* eslint-disable-next-line no-unused-vars */
import type {DefaultState, DefaultContext} from "koa";
/** Import Application Interface as Typings from Pre-Defined Types Helper !*/
import type {IContext, Intersection, PlainObject} from "@/extend/types";

declare module "egg" {
    /** @augments {IMiddleware} */
    export interface IMiddleware {
        parameterReducer: typeof middlewareFn;
    }

    /** @augments {Context} */
    export interface Context {
        /** @ts-ignore **/
        params: Required<{
            /* [[Interface Attributes Placeholder]] */
            permit: typeof permit;
        }>;
    }
}

/**
 ** @example
 **
 ** // Either picking parameters as spread arguments.
 ** > return ctx.params.permit('keyA', 'keyB');
 **
 ** // Or picking parameters as Array arguments.
 ** > return ctx.params.permit(['keyA', 'keyB']);
 **
 ** @template T,K
 ** @param {Array<string> | string} key
 ** @param {Array<string>} [keys]
 **/
export const permit = function <T extends PlainObject, K extends keyof T> (
    this: T, key: Array<K> | K, ...keys: Array<K>
): Pick<T, K> {
    const __TYPE_ERROR_MESSAGE__ = '>>> NOT SUPPORTED METHOD ARGUMENTS <<<';
    if (Array.isArray(key)) {
        if (keys[0] !== undefined) {
            throw new TypeError(__TYPE_ERROR_MESSAGE__);
        }
        return Helper.pick(this, [...key]);
    }
    const allKeys = [key, ...keys];
    return Helper.pick(this, [...allKeys]);
};

/**
 ** - Merge all Properties from [[Request Body]] && [[Request Query / Queries]] into [[Request Params]].
 ** @description
 ** - <b>[[_Request_Body_]]</b> has the highest (1st) priority, thus will overriding all collision properties follow behind.
 ** - <b>[[_Request_Query_]]</b> has the second (2nd) highest priority, thus will overriding all collision properties except <b>[[_Request_Body_]]</b>.
 ** - <b>[[_Request_Queries_]]</b> has the third (3rd) highest priority, thus will overriding all collision properties except <b>[[_Request_Query_]]</b>.
 ** @example
 ** > ctx.params = {...ctx.params, ...ctx.queries, ...ctx.query, ...ctx.request.body};
 **/
export const middlewareFn = () => async function (
    ctx: ParameterizedContext<DefaultState, Intersection<IContext, DefaultContext>, IBody>,
    next: Next,
): Promise<void | never> {

    /** Step 1: Initialize Context Parameters when its feasible on [undefined] !*/
    if (!ctx.params) {
        /** @ts-ignore ~!*/
        ctx.params = {};
    }

    /** Step 2: Merge all properties from QUERY -> [KEY: STRING] && QUERIES -> [KEY: ARRAY<STRING>] into Context Params !*/
    const queries = Object.keys(ctx.queries || ctx.request.queries);
    for (let i = 0; i < queries.length; i++) {
        const key = queries[i];
        /** @example - {'filters[]': ['APPROVED', 'REJECTED']} */
        if (key.includes(`[]`)) {
            /** Skip key name has Array tag !*/
            continue;
        }
        const value = ctx.queries[key];
        /**
         ** In case Queries has 1 element, merge params via ``${ctx.query}``
         ** @example
         ** > ctx.query === {pageSize: '50'};
         ** > ctx.queries === {pageSize: ['50']};
         **/
        if (Array.isArray(value) && value.length === 1) {
            /** For Query Parameters resolved as Query String !*/
            if (!ctx.query[key]) {
                /** Be careful that this will not be included in ``${ctx.query}`` but does exist in ``${ctx.queries}`` !*/
                ctx.params[key] = value;
                continue;
            }
            ctx.params[key] = ctx.query[key];
            continue;
        }
        /**
         ** In case Queries has more than 2 elements, merge params via ``${ctx.queries}``
         ** @example
         ** > ctx.query === {'filters[]': 'APPROVED'};
         ** > ctx.queries === {filters: ['APPROVED', 'REJECTED']};
         **/
        ctx.params[key] = ctx.queries[key];
    }

    /** Step 3: Merge all properties from REQUEST BODY -> [KEY: *|ANY] into Context Params !*/
    const keys = Object.keys({...ctx.request.body});
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        ctx.params[key] = ctx.request.body[key];
    }

    /** Step 4: Parsing all stringified properties from REQUEST PARAMS -> "{["KEY": *|ANY]}" into JavaScript Object Format {[KEY: *|ANY]} !*/
    const params = Object.keys({...ctx.params});
    for (let i = 0; i < params.length; i++) {
        /**
         ** In case ``${ctx.params[key]}`` has typed as Stringified JSON, parsing && merge params back into ``${ctx.params}``
         ** @example
         ** > ctx.params.filters === "{'status': ['APPROVED', 'NONE']}";
         ** // Convert Stringified JSON back into Plain JSON Object.
         ** > ctx.params.filters === {status: ['APPROVED', 'NONE']};
         **/
        const key = params[i];
        const value = ctx.params[key];
        if (typeof value === "string" && value[0] === "{") {
            ctx.params[key] = JSON.parse(value);
        }
    }

    /** Step 5: Merge Functional Method ``${permit()}`` into Context Parameter Prototype !*/
    Object.setPrototypeOf(ctx.params, {permit});

    return next();
};

/** For ES6 Default Import Statement !*/
export default middlewareFn;

/** For ES5 Default Import Statement !*/
module.exports = middlewareFn;
