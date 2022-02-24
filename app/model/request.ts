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

declare interface IPopulateAttributes {
    user: IUserAttributes;
    chatMessages: IModelDeepAttributes<"Message">;
}

export declare interface IAttributes extends Partial<IPopulateAttributes> {
    id: string;
    code: string;
    uid: IUserAttributes["id"];
    type: keyof typeof REQUEST_TYPE | REQUEST_TYPE_ENUM;
    status: keyof typeof REQUEST_STATUS | REQUEST_STATUS_ENUM;
    data: string | PlainObject | any;
    note: string;
    updatedBy: IUserAttributes["id"];
}

export declare interface ICreationAttributes extends PlainObject, Optional<IAttributes, 'id' | 'code' | 'updatedBy'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('request', {
    id: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
        primaryKey: true,
    },
    code: {
        type: STRING,
        allowNull: true,
        defaultValue: '',
    },
    uid: {
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
        },
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
        },
    },
    data: {
        type: STRING(1000),
        allowNull: true,
        defaultValue: "{}",
        /**
         ** @param {Object} object
         ** @returns {void}
         **/
        set: function (object: object) {
            this.setDataValue('data', JSON.stringify(object));
        },
        get: function () {
            const rawValue = this.getDataValue('data');
            return Parser.JSON.parse(rawValue, {
                emitError: false,
            });
        },
    },
    note: {
        type: STRING(300),
        allowNull: true,
    },
    /** Operator who handling this Request !*/
    updatedBy: {
        type: UUID,
        allowNull: true,
    },
}, (app) => {
    app.model.Request.belongsTo(app.model.User, {
        foreignKey: 'uid', targetKey: 'id', as: 'user', onDelete: 'CASCADE',
    });
    app.model.Request.belongsTo(app.model.User, {
        foreignKey: 'updated_by', targetKey: 'id', as: 'updatedByUser', onDelete: 'CASCADE',
    });
    app.model.Request.hasMany(app.model.Request.History, {
        sourceKey: 'id', foreignKey: 'request_id', as: 'history', onDelete: 'CASCADE',
    });
    app.model.Request.hasMany(app.model.Request.Message, {
        sourceKey: 'id', foreignKey: 'request_id', as: 'messages', onDelete: 'CASCADE',
    });
    app.model.Request.hasMany(app.model.Message, {
        sourceKey: 'id', foreignKey: 'request_id', as: 'chatMessages', onDelete: 'CASCADE',
    });
}, (app) => ({
    indexes: [
        {fields: ['uid'], unique: false, name: 'user_id'},
        {fields: ['type'], unique: false, name: 'type'},
        {fields: ['type', 'status'], unique: false, name: 'type_and_status'},
    ],
    hooks: {
        beforeUpdate: async function (request, option) {
            /** Need to validate status value !*/
            return Promise.resolve(request && option && void 0);
        },
        afterCreate: async function (request, options) {
            const {id, uid, status, type, data} = request;
            const {transaction, user, message} = options;
            if (!user || !user.id) {
                throw new ReferenceError("User context does not exists on update hook");
            }
            /** Insert 1 New Row into History for every Update Callback !*/
            await app.model.Request.History.create({
                requestId: id,
                uid: uid,
                status: status,
                type: type,
                data: data,
                updatedBy: user.id,
                note: message || '',
            }, {
                transaction: transaction,
            });
            return Promise.resolve(void 0);
        },
        afterUpdate: async function (request, options) {
            const {id, uid, status, type, data} = request;
            const {transaction, user, message} = options;
            if (!user || !user.id) {
                throw new ReferenceError("User context does not exists on update hook");
            }
            /** Insert 1 New Row into History for every Update Callback !*/
            await app.model.Request.History.create({
                requestId: id,
                uid: uid,

                /** After updated values */
                status: status,
                type: type,
                data: data,
                updatedBy: user.id,
                note: message || '',
            }, {
                transaction: transaction,
            });
            return Promise.resolve(void 0);
        },
    },
    underscored: true,
    charset: 'utf8mb4',
    engine: 'InnoDB',
}));
