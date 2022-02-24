/* eslint valid-jsdoc: "off", complexity: "off", no-unused-vars: "off", @typescript-eslint/naming-convention: "off" */

/** @ts-nocheck - Turn this on to ignore this file !*/

"use strict";

/**!*****************************!*
 ** PUT THIS ON MAIN ENTRY FILES !
 ** WRITE RESOLVED PATH IN BOTH FILES
 ** [PACKAGE.JSON] AND [TSCONFIG.JSON]
 **!*****************************!*/
require("module-alias/register");

/** Import Pre-Defined Types Helper !*/
import type {PlainObject} from "@/extend/types";

/**
 ** Declare Merging JSON as Global Augmentation.
 ** @see {@link https://www.merixstudio.com/blog/typescript-declaration-merging/}
 **/
declare global {
    /** @ts-ignore !*/
    interface JSON<T extends PlainObject> {
        parse(
            rawValue: string | PlainObject<string, T>,
            options?: Partial<{
                emitError: boolean;
                /** - In case not throwing Error, ie: [emitError == false],
                 ** @returns Un-parsed string value instead of empty Object <b>{...}</b> !*/
                fallback: boolean;
            }>,
        ): PlainObject<string, T>;
    }
}

/** Import & Store Original JSON Parser !*/
export const __JSON_Parser__: typeof JSON.parse = JSON.parse.bind(this);

/**
 ** - This is used to parse the JSON stringified data with custom logger && fallback to default value !
 ** - Which is good for handling [Undefined || Nullable] or un-formatted JSON Parsed String.
 ** @template T
 ** @param {string | PlainObject<string, T>} rawValue
 ** @param {Object} [options]
 ** @param {boolean} [options.emitError] - Parse failed will throw Error instead of returning empty Object <b>{...}</b> !
 ** @param {boolean} [options.fallback] - This option currently been disabled. <b>DO NOT USE !</b>
 ** @returns {PlainObject<string, T>}
 **/
export const parse = <T extends any>(
    rawValue: string | PlainObject<string, T>,
    options?: Partial<{
        emitError: boolean;
        /** - In case not throwing Error, ie: [emitError == false],
         ** @returns Un-parsed string value instead of empty Object <b>{...}</b> !*/
        fallback: boolean;
    }>,
): PlainObject<string, T> => {
    if (!rawValue && !options?.emitError) {
        return {};
    }
    try {
        return __JSON_Parser__(rawValue as string);
    } catch (error: Error | string | unknown) {
        if (!options?.emitError) {
            return {};
        }
        throw new EvalError("Parsing Data [Fields / Attributes] from MySQL Record Failed =>");
    }
};

/** Override the new Parse Function to JSON Global Instance !*/
JSON.parse = function (rawValue, options?) {
    /** Run default Built-in JSON Parser !*/
    if (options instanceof Function) {
        return __JSON_Parser__(...arguments);
    }
    /** Run new Override JSON Parser !*/
    return parse(rawValue, options);
};

/** Export Default Global Modules !*/
export default {parse};

/** For ES5 Import Statement !*/
module.exports = {parse};
