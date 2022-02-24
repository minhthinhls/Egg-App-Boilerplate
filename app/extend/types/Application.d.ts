/** Import Application Placeholder from Egg:Modules !*/
import "egg";
/** Import Egg-Modules as Typed Namespace !*/
import "egg-socket.io";
/** Import Egg-Modules as Typed Namespace !*/
import "egg-sequelize";
/** Import Egg-Modules as Typed Namespace !*/
import "egg-validate";

/** Import Installed Types from NPM Dependencies !*/
import type * as Roles from "koa-roles";
/** Import Installed Types from NPM Dependencies !*/
import type * as NodeCache from "node-cache";
/** Import Installed Types from NPM Dependencies !*/
import type * as sequelize from "sequelize/types";

/** Import Application Placeholder from Egg:Modules !*/
import type {Application, Singleton} from "egg";
/* eslint-disable-next-line no-unused-vars */
import type {Email} from "egg-mailer/app";
/* eslint-disable-next-line no-unused-vars */
import type {Transporter, SendMailOptions} from "nodemailer";
/* eslint-disable-next-line no-unused-vars */
import type {IController} from "./Controller";
/* eslint-disable-next-line no-unused-vars */
import type {IMongoose} from "./Mongoose";
/* eslint-disable-next-line no-unused-vars */
import type {IModel} from "./Model";
/** Import ES6 Custom [Utils && Helper] Dependencies !*/
import type {Redis} from "ioredis";
/** Import Pre-Defined Types Helper !*/
import type {PlainObject} from "@/extend/types";
/** Import Pre-Defined Types Helper !*/
import type {IValidateFields} from "@/extend/types";

declare interface IValidateCallBackFn<T extends PlainObject = PlainObject> {
    (rule: Partial<IValidateFields>, value: T[keyof T], object: T): string | void;
}

export declare interface ITypeConverter {
    (value: any, object: PlainObject): any;
}

/**
 ** - Case 1: If ${defaultTypeConverter} specified then this will be the default Converter for input Parameter.
 ** - Case 2: If ${IBaseRule.convertType} specified when calling either [app.validator.validate] or [ctx.validate],
 ** then this will override the ${defaultTypeConverter} specified in [IRuleConstructor] - Known as [Case 1] above.
 **/
export declare interface IRuleConstructor {
    /** Please enable [config/config.default.js] -> [validate.convert] to [TRUE] before using ${defaultTypeConverter} parameters !*/
    (type: string, checker: RegExp | IValidateCallBackFn, defaultTypeConverter?: string | ITypeConverter): void;

    /** Please enable [config/config.default.js] -> [validate.convert] to [TRUE] before using ${defaultTypeConverter} parameters !*/
    (type: string, checker: RegExp | IValidateCallBackFn, override?: boolean, defaultTypeConverter?: string | ITypeConverter): void;
}

declare interface IValidateError {
    code: string;
    field?: string;
    message: string;
}

/**
 ** - This send function was override by egg-mailer
 ** @see {Email} - This will override Node-mailer Transporter.
 **/
export declare interface IMailer<T = any> extends Transporter<T> {
    /** Sends an email using the preselected transport object !*/
    send(mailOptions: SendMailOptions, callback: (err: Error | null, info: T) => void): void;

    /** Sends an email using the preselected transport object !*/
    send(mailOptions: SendMailOptions): Promise<T>;
}

export declare interface IApplication extends Application {
    Sequelize: typeof sequelize;
    controller: IController;
    mongoose: IMongoose;
    model: sequelize.Sequelize & IModel;
    mailer: IMailer;
    cache: NodeCache;
    /** @see {@link https://github.com/eggjs/egg/issues/4848/} */
    redis: Singleton<Redis> & Redis;
    role: Roles;
    validator: {
        addRule: IRuleConstructor;
        validate: (rules: IValidateFields, data: any) => Array<IValidateError>;
    };
}

/**
 ** - TypeScript Declaration Merging via exported Declared Modules.
 ** - This is used as Javascript Module Resolution for JetBrains WebStorm IDEs.
 ** @see {@link https://www.typescriptlang.org/docs/handbook/module-resolution.html}
 **/
declare module "@/extend/types" {
    export declare interface IApplication extends Application {
        Sequelize: typeof sequelize;
        controller: IController;
        mongoose: IMongoose;
        model: sequelize.Sequelize & IModel;
        mailer: IMailer;
        cache: NodeCache;
        /** @see {@link https://github.com/eggjs/egg/issues/4848/} */
        redis: Singleton<Redis> & Redis;
        role: Roles;
        validator: {
            addRule: IRuleConstructor;
            validate: (rules: IValidateFields, data: any) => Array<IValidateError>;
        };
    }
}

/**
 ** - TypeScript Declaration Merging via exported Declared Modules.
 ** @see {@link https://www.typescriptlang.org/docs/handbook/module-resolution.html}
 **/
declare module "@/extend/types" {
    /** Export all Aggregating Sub-Modules within this folder via Module:@types !*/
    export * from ".";
}
