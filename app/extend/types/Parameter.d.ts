/************************************************************************************************************************
 ************************************ Please READ DOCUMENTS from Github and NPM Sites ***********************************
 ** @see {@link https://github.com/eggjs/egg-validate}<br/>*********************************************************<br/>
 ** @see {@link https://www.npmjs.com/package/parameter}<br/>*******************************************************<br/>
 ** @see {@link https://github.com/node-modules/parameter}<br/>*****************************************************<br/>
 ************************************************************************************************************************/

import type {CustomRules} from "@/extend/validator";

declare type PreDefinedTypes =
    | "id"
    | "int"
    | "integer"
    | "number"
    | "bool"
    | "boolean"
    | "date"
    | "dateTime"
    | "email"
    | "password"
    | "string"
    | "object"
    | "array"
    | CustomRules;

declare type Types =
    | PreDefinedTypes
    | `${PreDefinedTypes}?` // Put <?> post-fix will inject {required: false} into Rule Validator.
    | Omit<Array<string | number>, keyof Array> // Enum types
    | Omit<RegExp, keyof RegExp>;

export declare interface IBaseRule {
    required: boolean;
    type: Types;
    convertType: "int" | "number" | "string" | "boolean";
    default: any;
    /** - Convert empty string(''), NaN, Null to undefined.
     ** - This option can make [rule.required] more powerful, default to false.
     ** - This may change the original input params !*/
    widelyUndefined: boolean;
}

export declare interface IObjectRule extends IBaseRule {
    type: "object";
    rule: IValidateFields;
}

export declare interface IArrayRule extends IBaseRule {
    type: "array";
    itemType: Types;
    rule: IValidateFields;
    max: number;
    min: 0 | number;
}

declare type IRules =
    | IBaseRule
    | IObjectRule
    | IArrayRule;

export declare interface IValidateFields {
    [p: string]: Partial<IRules> | IBaseRule["type"];
}
