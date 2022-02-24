/* eslint valid-jsdoc: "off", complexity: "off", no-unused-vars: "off", @typescript-eslint/naming-convention: "off" */

/** @ts-nocheck - Turn this on to ignore this file !*/

"use strict";

import {BaseMongoose, IDocument} from "@/extend/class";

export interface IAttributes extends IDocument {
    username: string;
    password: string;
}

export default BaseMongoose<IAttributes>('user', (/*types, collections*/) => ({
    username: {type: String, required: true},
    password: {type: String, required: true},
}), (/*app, schema*/) => {
    return void 0;
});
