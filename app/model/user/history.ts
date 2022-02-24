import {INTEGER, STRING, UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/** Import constants !*/
import {USER_STATUS} from "@/constants";

const VALID_STATUS = Object.values(USER_STATUS);

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";
/** Import Deep Nested Models Attributes Defined Types !*/
import type {IModelDeepAttributes} from "@/extend/types";
/** Import Models Attributes Defined Types !*/
import type {IAttributes as IRequestAttributes} from "@/model/request";

/* eslint-disable-next-line no-unused-vars */
declare interface IPopulateAttributes {
    user: IModelDeepAttributes<"User">;
    requests: Array<IModelDeepAttributes<"Request">>;
}

export declare interface IAttributes extends Partial<IPopulateAttributes> {
    id: string;
    uid: string;
    roleId: string;
    levelId: string;
    username: string;
    password: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    avatarUrl: string;
    referrerId: string;
    referralCode: string;
    ip: string;
    loginFailed: number;
    status: string;
    note: string;
    updatedBy?: string | null;
    requestId?: IRequestAttributes["id"] | null;
}

declare interface ICreationAttributes extends Optional<IAttributes, 'id' | 'requestId' | 'avatarUrl' | 'referrerId' | 'referralCode' | 'ip' | 'loginFailed' | 'status' | 'note'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('user_history', {
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
        allowNull: true,
        defaultValue: null,
    },
    roleId: {
        type: UUID,
        allowNull: false,
    },
    levelId: {
        type: UUID,
        allowNull: false,
        comment: 'Default is lowest level',
    },
    username: {
        type: STRING(50),
        allowNull: false,
        defaultValue: '',
        set: function (value: string) {
            this.setDataValue('username', value.toLowerCase());
        }
    },
    password: {
        type: STRING(32),
        allowNull: false,
        defaultValue: ''
    },
    fullName: {
        type: STRING,
        allowNull: false,
        defaultValue: '',
    },
    email: {
        type: STRING,
        allowNull: false,
        defaultValue: '',
        validate: {
            isEmail: true,
        },
        set: function (value: string) {
            this.setDataValue('email', value.toLowerCase());
        }
    },
    phoneNumber: {
        type: STRING,
        allowNull: false,
        defaultValue: '',
        set: function (value: string) {
            this.setDataValue('phoneNumber', value.toLowerCase());
        }
    },
    avatarUrl: {
        type: STRING,
        allowNull: false,
        defaultValue: ''
    },
    referrerId: {
        type: UUID,
        allowNull: true,
    },
    referralCode: {
        type: STRING(50),
        allowNull: false,
        defaultValue: '',
        set: function (value: string) {
            this.setDataValue('referralCode', value.toUpperCase());
        }
    },
    ip: {
        type: STRING(50),
        allowNull: true,
        validate: {
            isIP: true,
        },
    },
    loginFailed: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'The continuous failed login attempt from Client',
    },
    status: {
        type: STRING(20),
        allowNull: false,
        defaultValue: USER_STATUS.OPEN,
        validate: {
            isIn: [VALID_STATUS],
        },
    },
    note: {
        type: STRING,
        allowNull: true,
        defaultValue: '',
    },
    updatedBy: {
        type: UUID,
        allowNull: true,
        defaultValue: null,
    },
}, (app) => {
    app.model.User.History.belongsTo(app.model.User, {
        foreignKey: 'uid', targetKey: 'id', as: 'user', onDelete: 'CASCADE',
    });
    app.model.User.History.belongsTo(app.model.User, {
        foreignKey: 'updatedBy', targetKey: 'id', as: 'changedBy', onDelete: 'CASCADE',
    });
}, (/*app*/) => ({
    indexes: [
        {fields: ['username', 'uid'], unique: false},
    ],
    underscored: true,
    comment: 'User History Logger',
    charset: 'utf8mb4',
    freezeTableName: true,
    engine: 'InnoDB',
}));
