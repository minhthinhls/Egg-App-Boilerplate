import {STRING, UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/** Import constants !*/
import {REQUEST_STATUS_ENUM, REQUEST_TYPE_ENUM} from "@/constants";
/** Import constants !*/
import {REQUEST_STATUS, REQUEST_TYPE} from "@/constants";
/** Import ES6 Custom [Utils && Helper] Dependencies !*/
import {Parser} from "@/utils";

const VALID_STATUS = Object.values(REQUEST_STATUS);
const VALID_REQUEST_TYPE = Object.values(REQUEST_TYPE);

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";
/** Import Pre-Defined Types Helper !*/
import type {PlainObject} from "@/extend/types";
/** Import Deep Nested Models Attributes Defined Types !*/
import type {IModelDeepAttributes} from "@/extend/types";
/** Import Models Attributes Defined Types !*/
import type {IAttributes as IUserAttributes} from "@/model/user";

export declare interface IAttributes {
    id: string;
    uid: IUserAttributes["id"];
    requestId: IModelDeepAttributes<"Request">["id"];
    type: keyof typeof REQUEST_TYPE | REQUEST_TYPE_ENUM;
    status: keyof typeof REQUEST_STATUS | REQUEST_STATUS_ENUM;
    data: string | PlainObject | any;
    updatedBy: IUserAttributes["id"];
    note: string;
}

declare interface ICreationAttributes extends PlainObject, Optional<IAttributes, 'id' | 'updatedBy' | 'note'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('request_history', {
    id: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
        primaryKey: true,
    },
    uid: {
        type: UUID,
        allowNull: false,
    },
    requestId: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
    },
    status: {
        type: STRING(20),
        allowNull: false,
        defaultValue: REQUEST_STATUS.PENDING,
        /**
         ** @param {string} status
         ** @returns {void}
         **/
        set: function (status: IAttributes["status"]) {
            if (!VALID_STATUS.includes(status)) {
                throw new EvalError("Not supported Request Status");
            }
            this.setDataValue('status', status);
        }
    },
    /** Applied Request Type - [CREATE_ACCOUNT, CLOSE_ACCOUNT, TOP-UP/WITHDRAW WALLET BALANCE or ACCOUNT BALANCE] !*/
    type: {
        type: STRING(50),
        allowNull: false,
        /**
         ** @param {string} type
         ** @returns {void}
         **/
        set: function (type: IAttributes["type"]) {
            if (!VALID_REQUEST_TYPE.includes(type)) {
                throw new EvalError("Not supported Request Type");
            }
            this.setDataValue('type', type);
        }
    },
    data: {
        type: STRING(1000),
        allowNull: true,
        defaultValue: "{}",
        /**
         ** @param {Object|String} object
         ** @returns {void}
         **/
        set: function (object: object) {
            if (typeof object === 'object') {
                this.setDataValue('data', JSON.stringify(object));
            } else {
                this.setDataValue('data', JSON.parse(object));
            }
        },
        get: function () {
            const rawValue = this.getDataValue('data');
            return Parser.JSON.parse(rawValue, {
                emitError: false,
            });
        },
    },
    note: {
        type: STRING,
        allowNull: true,
        defaultValue: '',
    },
    /** Operator who handling this Request !*/
    updatedBy: {
        type: UUID,
        allowNull: true,
    },
}, (app) => {
    app.model.Request.History.belongsTo(app.model.Request, {
        foreignKey: 'request_id', targetKey: 'id', as: 'request', onDelete: 'CASCADE',
    });
    app.model.Request.History.belongsTo(app.model.User, {
        foreignKey: 'updated_by', targetKey: 'id', as: 'changedBy', onDelete: 'CASCADE',
    });
    app.model.Request.History.belongsTo(app.model.User, {
        foreignKey: 'uid', targetKey: 'id', as: 'user', onDelete: 'CASCADE',
    });
}, (/*app*/) => ({
    indexes: [
        {fields: ['request_id'], unique: false, name: 'request_id'},
    ],
    underscored: true,
    charset: 'utf8mb4',
    engine: 'InnoDB',
}));
