"use strict";

/** The [Egg-Validate] Dependencies was built on top of [Parameter] Node Modules !*/
import "$/node_modules/parameter/index";

/** Import ES6 TYPES !*/
import type {IApplication} from "@/extend/types";

/** Import ENUMS & CONSTANTS !*/
import {REQUEST_STATUS, REQUEST_TYPE} from "@/constants";

export declare interface IParameter {
    /** Override this Function at [config/config.default.js] -> [validate.t: () => I18n.t.apply(I18n, args)] !*/
    t(resourceKey: string): string;
}

/** Please specify inserted types into this variable, when adding new Rules into Validator below !*/
export type CustomRules =
    | "Amount"
    | "Boolean"
    | "Nullable"
    | "RequestType"
    | "RequestStatus";

export const __Initialize_Validator_Rules__ = (app: IApplication) => {

    app.validator.addRule('Amount', function (this: IParameter, _rule, value, object) {
        if (!object) {
            return (new ReferenceError(this.t('Target Object must be provided'))).message;
        }
        if (!value) {
            return (new ReferenceError(this.t('Amount must be provided'))).message;
        }

        if (typeof value !== 'string' && typeof value !== 'number') {
            return (new TypeError(this.t('Amount is invalid'))).message;
        }

        const number = parseFloat(String(value));
        if (isNaN(number) || number <= 0) {
            return (new EvalError(this.t('Amount must be larger than 0'))).message;
        }
    });

    app.validator.addRule('Boolean', function (this: IParameter, _rule, value, object) {
        if (!object) {
            return (new ReferenceError(this.t('Target Object must be provided'))).message;
        }

        if (value !== true && value !== false) {
            return (new ReferenceError(this.t('Boolean must be provided correctly'))).message;
        }
    }, (value) => {
        switch (value) {
            case 'false':
                return false;
            case 'true':
                return true;
        }
        return value;
    });

    app.validator.addRule('Nullable', function (this: IParameter, rule, value, object) {
        if (!rule && !object) {
            return (new ReferenceError(this.t('Target Object must be provided'))).message;
        }
        if ([NaN, 0, '', false].includes(value)) {
            return (new EvalError(this.t(`Request type cannot involve either of included [NaN, 0, '', false] values`))).message;
        }
    }, (value) => {
        switch (value) {
            case 'null':
                return null;
            case 'undefined':
                return undefined;
            case 'NaN':
                return NaN;
        }
        return value;
    });

    app.validator.addRule('RequestType', function (this: IParameter, _rule, value, object) {
        if (!object) {
            return (new ReferenceError(this.t('Target Object must be provided'))).message;
        }
        if (!value) {
            return (new ReferenceError(this.t('Request type must be provided'))).message;
        }
        if (![
            REQUEST_TYPE.CREATE_ACCOUNT,
            REQUEST_TYPE.CLOSE_ACCOUNT,
            REQUEST_TYPE.REOPEN_ACCOUNT,
            REQUEST_TYPE.UPDATE_PROFILE,
            REQUEST_TYPE.RESET_PASSWORD,
            REQUEST_TYPE.DEPOSIT,
            REQUEST_TYPE.WITHDRAW,
            REQUEST_TYPE.TRANSFER_OUT,
            REQUEST_TYPE.TRANSFER_IN,
        ].includes(value)) {
            return (new EvalError(this.t('Request type is invalid'))).message;
        }
    });

    app.validator.addRule('RequestStatus', function (this: IParameter, _rule, value, object) {
        if (!object) {
            return (new ReferenceError(this.t('Target Object must be provided'))).message;
        }
        if (!value) {
            return (new ReferenceError(this.t('Request status must be provided'))).message;
        }
        if (![
            /** Request status can not be changed to [[PENDING]] !*/
            // REQUEST_STATUS.PENDING,
            REQUEST_STATUS.RECEIVED,
            REQUEST_STATUS.RESOLVED,
            REQUEST_STATUS.CANCELLED,
        ].includes(value)) {
            return (new EvalError(this.t('Request status is invalid'))).message;
        }
    });
};

/** For ES6 Default Import Statement !*/
export default __Initialize_Validator_Rules__;

/** For ES5 Default Import Statement !*/
module.exports = __Initialize_Validator_Rules__;
