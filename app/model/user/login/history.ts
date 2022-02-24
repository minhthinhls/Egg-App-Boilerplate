import {STRING, UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/** Import constants !*/
import {USER_LOGIN_STATUS, LOGIN_LOG_TYPE} from "@/constants";

/** Import ES6 Custom [Utils && Helper] Dependencies !*/
import {/*Parser*/} from "@/utils";

const VALID_LOGIN_STATUS = Object.values(USER_LOGIN_STATUS);
const VALID_LOGIN_LOG_TYPE = Object.values(LOGIN_LOG_TYPE);

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";

/** Import Pre-Defined Types Helper !*/
import type {PlainObject} from "@/extend/types";

/** Import Models Attributes Defined Types !*/
import type {IAttributes as IUserAttributes} from "@/model/user";

/* eslint-disable-next-line no-unused-vars */
declare interface IPopulateAttributes {
    user: IUserAttributes;
}

export declare interface IAttributes extends Partial<IPopulateAttributes> {
    id: string;
    uid: string;
    ip: string;
    device: string | PlainObject | any;
    browser: string | PlainObject | any;
    userAgent: string;
    status: string;
    type: string;
    os: string | PlainObject | any;
}

declare interface ICreationAttributes extends Optional<IAttributes, 'id' | 'ip' | 'os' | 'device' | 'browser' | 'userAgent'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('user_login_history', {
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
    ip: {
        type: STRING(50),
        allowNull: true,
        validate: {
            isIP: true,
        },
    },
    status: {
        type: STRING(20),
        allowNull: false,
        validate: {
            isIn: [VALID_LOGIN_STATUS],
        },
    },
    type: {
        type: STRING(20),
        allowNull: false,
        validate: {
            isIn: [VALID_LOGIN_LOG_TYPE],
        },
    },
    userAgent: {
        type: STRING,
        allowNull: true,
        defaultValue: ''
    },
    browser: {
        type: STRING(1000),
        allowNull: true,
        defaultValue: "{}",
        /**
         ** @param {Object} object
         ** @returns {void}
         **/
        set: function (object: object) {
            this.setDataValue('browser', JSON.stringify(object));
        },
        get: function () {
            const rawValue = this.getDataValue('browser');
            return JSON.parse(rawValue, {
                emitError: false,
            });
        }
    },
    device: {
        type: STRING(1000),
        allowNull: true,
        defaultValue: "{}",
        /**
         ** @param {Object} object
         ** @returns {void}
         **/
        set: function (object: object) {
            this.setDataValue('device', JSON.stringify(object));
        },
        get: function () {
            const rawValue = this.getDataValue('device');
            return JSON.parse(rawValue, {
                emitError: false,
            });
        }
    },
    os: {
        type: STRING(1000),
        allowNull: true,
        defaultValue: "{}",
        /**
         ** @param {Object} object
         ** @returns {void}
         **/
        set: function (object: object) {
            this.setDataValue('os', JSON.stringify(object));
        },
        get: function () {
            const rawValue = this.getDataValue('os');
            return JSON.parse(rawValue, {
                emitError: false,
            });
        }
    },
}, (app) => {
    app.model.User.Login.History.belongsTo(app.model.User, {
        foreignKey: 'uid', targetKey: 'id', as: 'user', onDelete: 'CASCADE',
    });
}, (/*app*/) => ({
    indexes: [
        {fields: ['uid'], unique: false},
    ],
    underscored: true,
    comment: 'User Login History Logger',
    charset: 'utf8mb4',
    freezeTableName: true,
    engine: 'InnoDB',
}));
