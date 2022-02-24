"use strict";

/**!*****************************!*
 ** PUT THIS ON MAIN ENTRY FILES !
 ** WRITE RESOLVED PATH IN BOTH FILES
 ** [PACKAGE.JSON] AND [TSCONFIG.JSON]
 **!*****************************!*/
require("module-alias/register");

/** Import Pre-Defined Types Helper !*/
import type {/*PlainObject*/} from "@/extend/types";

/** Declare Interface for Error Class Constructor !*/
declare interface IErrorConstructor<TError extends Error> {

    /**
     ** @constructor
     ** - ES6 Constructor for Error Instance.
     ** @ts-ignore ~!*/
    new(message?: string, statusCode?: number): TError;

    /**
     ** @prototype
     ** - Set default Type for Error Class prototype.
     ** @ts-ignore ~!*/
    readonly prototype: TError;
}

/**
 ** - Declare Merging Error Class as Global Augmentation.
 ** @see {@link https://www.merixstudio.com/blog/typescript-declaration-merging/}
 ** - Must config ${global} key inside [.eslintrc.js] or ESLint will thrown [undefined variable] Error.
 ** @see {@link https://eslint.org/docs/user-guide/configuring/language-options#specifying-globals}
 **/
declare global {
    /* eslint-disable-next-line no-unused-vars, no-var */
    var VisibleError: IErrorConstructor<VisibleError>;
    /* eslint-disable-next-line no-unused-vars, no-var */
    var NonExposeError: IErrorConstructor<NonExposeError>;
    /* eslint-disable-next-line no-unused-vars, no-var */
    var ClientError: IErrorConstructor<ClientError>;
    /* eslint-disable-next-line no-unused-vars, no-var */
    var SystemError: IErrorConstructor<SystemError>;
}

/** Create Custom Error for Global Instance !*/
class VisibleError extends Error {
    /** @attribute {boolean} - expose */
    public readonly expose: boolean;

    constructor(message?: string) {
        super(message);
        this.expose = true;
    }
}

/** Create Custom Error for Global Instance !*/
class NonExposeError extends Error {
    /** @attribute {boolean} - expose */
    public readonly expose: boolean;

    constructor(message?: string) {
        super(message);
        this.expose = false;
    }
}

/** Create Custom Error for Global Instance !*/
class ClientError extends VisibleError {
    /** @attribute {number} - status */
    public readonly status: number;

    constructor(message?: string, statusCode?: number) {
        super(message);
        this.status = statusCode || 0;
    }
}

/** Create Custom Error for Global Instance !*/
class SystemError extends NonExposeError {
    /** @attribute {number} - status */
    public readonly status: number;

    constructor(message?: string, statusCode?: number) {
        super(message);
        this.status = statusCode || 0;
    }
}

/** Start Merging Customized Error Class into Global Instance !*/
global.VisibleError = VisibleError;
global.NonExposeError = NonExposeError;
global.ClientError = ClientError;
global.SystemError = SystemError;

/** Export Default Global Modules !*/
export default global;

/** For ES5 Import Statement !*/
module.exports = global;
