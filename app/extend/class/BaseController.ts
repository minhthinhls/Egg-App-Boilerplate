/* eslint valid-jsdoc: "off", complexity: "off", no-unused-vars: "off", @typescript-eslint/naming-convention: "off" */

/** @ts-nocheck - Turn this on to ignore this file !*/

"use strict";

/**!*****************************!*
 ** PUT THIS ON MAIN ENTRY FILES !
 ** WRITE RESOLVED PATH IN BOTH FILES
 ** [PACKAGE.JSON] AND [TSCONFIG.JSON]
 **!*****************************!*/
require("module-alias/register");

/* eslint-disable-next-line no-unused-vars */
import {BaseContextClass} from "egg-core";

/* eslint-disable-next-line no-unused-vars */
import type {EggLogger} from "egg-logger";
/* eslint-disable-next-line no-unused-vars */
import type {PlainObject} from "@/extend/types";
/* eslint-disable-next-line no-unused-vars */
import type {IValidateFields} from "@/extend/types";
/* eslint-disable-next-line no-unused-vars */
import type {ArrowFunc, Nullable} from "@/extend/helper";
/* eslint-disable-next-line no-unused-vars */
import type {IApplication, IContext, IEggAppConfig, IService} from "@/extend/types";

/**
 ** - Inheritance Controller from Koa Context Class.
 ** Providing Basic Methods for Application Controller.
 ** @class {BaseController}
 ** @returns {BaseController}
 **/
class BaseController extends BaseContextClass<IContext, IApplication, IEggAppConfig, IService> {

    constructor(ctx: IContext) {
        super(ctx);
    }

    /** Request Context !*/
    public ctx: IContext;

    /** Application Instance !*/
    public app: IApplication;

    /** Application Config Object !*/
    public config: IEggAppConfig;

    /** Service Class !*/
    public service: IService;

    protected static safePropertyInject(_this: BaseController, propName: string, injectInstance: any) {
        if (_this[propName] !== null && _this[propName] !== undefined) {
            throw new ReferenceError("This property already existed, please consider either debugging or refactor property name!");
        }
        return (_this[propName] = injectInstance) || void 0;
    }

    /** Override Logger in Egg BaseContextClass !*/
    protected logger: EggLogger = {} as EggLogger;

    protected response(body: IContext["print"]): void {
        const {ctx} = this;
        ctx.print = body;
        return void 0;
    }

    protected validate(extraFields?: IValidateFields): void {
        const {ctx} = this;
        ctx.validate({
            pageNo: {type: 'int?', convertType: 'int', default: 0},
            pageSize: {type: 'int?', convertType: 'int', default: 10},
            startDate: {type: 'date?', default: new Date()},
            endDate: {type: 'date?', default: new Date()},
            ...extraFields,
        }, {...ctx.params as PlainObject});
        return void 0;
    }

    /**
     ** Custom Higher Order Function to execute Service with appropriate Try-Catch block !
     ** - Instead "throw" of exception will be caught locally.
     ** @param {ArrowFunc | Function} callback
     ** @param {string} [errorResponse]
     ** @throws {Error}
     **/
    protected async catch<TFunction extends ArrowFunc | Function, TErrorOptions extends Partial<{
        /** Turn on this flag [DEFAULT == FALSE] to response Error Instance back-to CLIENT SIDE !*/
        expose: boolean;
        /** Turn on this flag [DEFAULT == FALSE] to re-throw Error Instance into outer Lexical Scope !*/
        rethrow: boolean | Error;
    }>>(callback: TFunction, errorResponse: TErrorOptions & IContext["print"]): Promise<Nullable> {
        try {
            return this.response(await callback());
        } catch (error: Error | any) {
            if (errorResponse?.rethrow) {
                if (typeof errorResponse.rethrow === "boolean") {
                    return this.ctx.throw(error, {expose: true});
                }
                return this.ctx.throw(errorResponse.rethrow, {expose: true});
            }
            /** Only Logging Non User Level Error !*/
            if (!(error instanceof VisibleError)) {
                this.ctx.logger.error(error);
            }
            /** Caught Error Code from Response Status Code !*/
            const statusCode = error.statusCode || error.status || error.code;
            const {removeNullableKeyFrom, omit} = this.ctx.helper;
            return this.response({
                ...removeNullableKeyFrom({
                    /** By default response will be HTTP Error 500 !*/
                    errorCode: typeof errorResponse === "object" && errorResponse.errorCode || statusCode || 500,
                    errorMsg: errorResponse?.expose ? error : null,
                    expose: errorResponse?.expose || false,
                    ...(typeof errorResponse === "object" ? omit(errorResponse, ['expose']) : {}),
                }),
            });
        }
    }

    /**
     ** Custom function to throw Error without IDE Warning !
     ** - "throw" of exception caught locally
     ** @param {ErrorConstructor} ErrorClass
     ** @param {string} [errorMessage]
     ** @throws {Error}
     **/
    protected ThrowErrorInstance = (ErrorClass: ErrorConstructor, errorMessage = ""): void => {
        throw new ErrorClass(errorMessage);
    };
}

export default BaseController;
