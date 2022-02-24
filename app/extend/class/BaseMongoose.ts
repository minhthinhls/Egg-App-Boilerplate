/* eslint valid-jsdoc: "off", complexity: "off", no-unused-vars: "off", @typescript-eslint/naming-convention: "off" */

/** @ts-nocheck - Turn this on to ignore this file !*/

"use strict";

/**
 ** @see {@link https://mongoosejs.com/docs/typescript.html}
 ** @see {@link https://mongoosejs.com/docs/typescript/schemas.html}
 ** @see {@link https://thecodebarbarian.com/working-with-mongoose-in-typescript.html}
 ** @see {@link https://stackoverflow.com/questions/34482136/mongoose-the-typescript-way/}
 **/

/** Import ES6 Default Dependencies !*/
import * as mongoose from "mongoose";

/** Import Installed NPM Dependencies !*/
import * as camelCase from "camelcase";

/** Import ENUMS & CONSTANTS !*/
import {COLLECTIONS} from "@/db/mongoose";

/** Import Pre-Defined Types Helper !*/
import type {Types, Document, Model} from "mongoose";

/** Import Pre-Defined Types Helper !*/
import type {Schema, SchemaOptions} from "mongoose";

/** Import Pre-Defined Types Helper !*/
import type {SchemaDefinition, SchemaDefinitionType} from "mongoose";

/** Import Pre-Defined Types Helper !*/
import type {IApplication} from "@/extend/types";

/** For Model Attributes Declaration Merging !*/
export declare interface IDocument extends mongoose.Document {
    /* [[Optional Attributes Placeholder]] */
}

/** For Dynamic Mongoose Model Attributes Defined via Declaration Merging !*/
declare module "mongoose" {
    export interface Model<T, TQueryHelpers = {}, TMethodsAndOverrides = {}, TVirtuals = {}> {
        get(sub: string): Model<T, TQueryHelpers, TMethodsAndOverrides, TVirtuals>;
    }
}

/**
 ** @description ModelCreator for Mongoose Instance.
 ** @template D
 ** @example
 ** // Basic query population for Mongoose Models.
 ** > const records = await ctx.mongoose.Model.find({}).populate({...});
 ** @example
 ** // Consider using this populate method since Model Name has been Upper-Cased.
 ** > populate({path: 'field', model: ctx.app.mongoose.Model, select: '_id sub_field'});
 ** > populate({path: 'field', model: ctx.mongoose.Model, select: ['_id', 'sub_field']});
 ** @example
 ** // To enable the default mongoose population.
 ** > populate('user', 'username password email phone');
 ** // Please remove special options ``camelCase({pascalCase: true})`` from Model Name.
 ** > const __Model__ = Model<D>(`${name}`, Schema, `${name}`);
 ** ---------------------------------------------------------------------------------
 ** @param {string} name
 ** @param {function(types: typeof mongoose.Types, collections: typeof COLLECTIONS): SchemaDefinition<SchemaDefinitionType<D>>} definitionCallbackFn
 ** @param {function(app: IApplication, schema: Schema<D, Model<D>>): void} associateCallbackFn
 ** @param {SchemaOptions} [options]
 ** @returns {function(app: IApplication): Model<D>}
 **/
export default <D extends Document = Document>(
    name: string,
    definitionCallbackFn: (types: typeof Types, collections: typeof COLLECTIONS) => SchemaDefinition<SchemaDefinitionType<D>>,
    associateCallbackFn: (app: IApplication, schema: Schema<D, Model<D>>) => void,
    options?: SchemaOptions,
) => (app: IApplication): Model<D> => {
    const Model = app.mongoose.model;
    const Schema = new app.mongoose.Schema<D, Model<D>>({...definitionCallbackFn(mongoose.Types, COLLECTIONS)}, {...options});

    /** Optional Setting for created Mongoose Schema !*/
    associateCallbackFn(app, Schema);

    /**
     ** @example
     ** // Basic query population for Mongoose Models.
     ** > const records = await ctx.mongoose.Model.find({}).populate({...});
     ** @example
     ** // Consider using this populate method since Model Name has been Upper-Cased.
     ** > populate({path: 'field', model: ctx.app.mongoose.Model, select: '_id sub_field'});
     ** > populate({path: 'field', model: ctx.mongoose.Model, select: ['_id', 'sub_field']});
     ** @example
     ** // To enable the default mongoose population.
     ** > populate('user', 'username password email phone');
     ** // Please remove special options ``camelCase({pascalCase: true})`` from Model Name.
     ** > const __Model__ = Model<D>(`${name}`, Schema, `${name}`);
     **/
    const __Model__ = Model<D>(`${camelCase(`${name}`, {pascalCase: true})}`, Schema, `${name}`);
    /**
     ** @example
     ** > const model = ctx.app.mongoose.Data.get('01_30_2022');
     ** > const records = model.find({});
     **/
    Object.assign(__Model__, {
        get(sub: string) {
            const table = [name, sub].join("_");
            return Model<D>(`${camelCase(`${table}`, {pascalCase: true})}`, Schema, `${table}`);
        },
    });
    return __Model__;
};
