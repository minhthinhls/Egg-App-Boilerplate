/* eslint valid-jsdoc: "off", complexity: "off", no-unused-vars: "off", @typescript-eslint/naming-convention: "off" */

/** @ts-nocheck - Turn this on to ignore this file !*/

"use strict";

/** Import Application Placeholder from Egg:Modules !*/
import "egg";
/** Import Egg-Modules as Typed Namespace !*/
import "egg-crypto";
/** Import Egg-Modules as Typed Namespace !*/
import "egg-jwt";
/** Import Egg-Modules as Typed Namespace !*/
import "egg-passport";
/** Import Egg-Modules as Typed Namespace !*/
import "egg-sequelize";
/** Import Egg-Modules as Typed Namespace !*/
import "egg-socket.io";
/** Import Egg-Modules as Typed Namespace !*/
import "egg-validate";
/* eslint-disable-next-line no-unused-vars */
import {permit} from "@/middleware/parameter_reducer";
/* eslint-disable-next-line no-unused-vars */
import type {Context, IHelper} from "egg";
/* eslint-disable-next-line no-unused-vars */
import type {IModel} from "./Model";
/* eslint-disable-next-line no-unused-vars */
import type {IMongoose} from "./Mongoose";
/* eslint-disable-next-line no-unused-vars */
import type {IService} from "./Service";
/* eslint-disable-next-line no-unused-vars */
import type {Hashes} from "crypto-js";
/* eslint-disable-next-line no-unused-vars */
import type {PlainObject} from "@/extend/types";
/* eslint-disable-next-line no-unused-vars */
import type {Intersection, IValidateFields} from "@/extend/types";
/* eslint-disable-next-line no-unused-vars */
import type {IApplicationContext, IBody} from "@/extend/context";
/* eslint-disable-next-line no-unused-vars */
import * as Helper from "@/extend/helper";
/* eslint-disable-next-line no-unused-vars */
import * as sequelize from "sequelize/types";

/** Import Models Attributes Defined Types !*/
import type {IAttributes as IUserAttributes} from "@/model/user";

export declare interface IResponseData extends IBody {
    /* [[Interface Attributes Placeholder]] */
}

declare module "egg" {
    export interface Context extends IApplicationContext {
        Op: typeof sequelize.Op;
        params: Required<{
            /* [[Mandatory Attributes Placeholder]] */
            permit: typeof permit;
        }> & PlainObject & Partial<{
            /* [[Optional Attributes Placeholder]] */
        }>;
        helper: IHelper & Intersection<Required<{
            Cron: typeof Helper.Cron;
            mongoose: typeof Helper.mongoose;
        }>, typeof Helper>;
        model: sequelize.Sequelize & {
            Sequelize: typeof sequelize;
        } & IModel;
        mongoose: IMongoose;
        service: IService;
        crypto: Hashes;
        validate: (rules: IValidateFields, data?: any) => void;

        /**
         ** - Account authorized after login via egg-passport.
         ** @type {IUserAttributes | undefined}
         **////<reference types="egg-passport"/>
        user: Helper.RecursiveRequired<IUserAttributes>;
        login<T extends IUserAttributes>(user: T): Promise<void>;
        login<T extends IUserAttributes, O extends {session: boolean} = {session: true}>(user: T, options: O): Promise<void>;
    }
}

export declare interface IContext<Response extends IResponseData = IResponseData> extends IApplicationContext, Context<Response> {
    Op: typeof sequelize.Op;
    params: Required<{
        /* [[Mandatory Attributes Placeholder]] */
        permit: typeof permit;
    }> & PlainObject & Partial<{
        /* [[Optional Attributes Placeholder]] */
    }>;
    helper: IHelper & Intersection<Required<{
        Cron: typeof Helper.Cron;
        mongoose: typeof Helper.mongoose;
    }>, typeof Helper>;
    model: sequelize.Sequelize & {
        Sequelize: typeof sequelize;
    } & IModel;
    mongoose: IMongoose;
    service: IService;
    crypto: Hashes;
    validate: (rules: IValidateFields, data?: any) => void;

    /**
     ** - Account authorized after login via egg-passport.
     ** @type {IUserAttributes | undefined}
     **////<reference types="egg-passport"/>
    user: Helper.RecursiveRequired<IUserAttributes>;
    login<T extends IUserAttributes>(user: T): Promise<void>;
    login<T extends IUserAttributes, O extends {session: boolean} = {session: true}>(user: T, options: O): Promise<void>;
}
