import {BOOLEAN, DATE, DATEONLY, INTEGER, STRING, UUID, UUIDV4} from "sequelize";
import {removeNullableKeyFrom, pick} from "@/extend/helper";
import {BaseModel} from "@/extend/class";

/** Import constants !*/
import {USER_STATUS} from "@/constants";

const VALID_USER_STATUS = [USER_STATUS.OPEN, USER_STATUS.SUSPENDED, USER_STATUS.CLOSED];

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";
/** Import Deep Nested Models Attributes Defined Types !*/
import type {IModelDeepAttributes} from "@/extend/types";

declare interface IExtraAttributes {
    level: IModelDeepAttributes<"User", "Level">;
}

declare interface IPopulateAttributes {
    role: IModelDeepAttributes<"Role">;
    credit: IModelDeepAttributes<"Credit">;
    accounts: Array<IModelDeepAttributes<"Account">>;
    requests: Array<IModelDeepAttributes<"Request">>;
    invitedUsers: Array<IAttributes>;
    referredByUser: Partial<IAttributes>;
}

export declare interface IAttributes extends Partial<IPopulateAttributes>, Partial<IExtraAttributes> {
    id: string;
    roleId: string;
    levelId: string;
    username: string;
    password: string;
    password2: string;
    withdrawalPassword: string;
    isActivePassword2: boolean;
    token: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    avatarUrl: string;
    referrerId: string;
    referralCode: string;
    ip: string;
    /** - Số lần đăng nhập thất bại liên tiếp, login thành công reset về zero !*/
    loginFailed: number;
    withdrawalPasswordFailed: number;
    status: string;
    dateOfBirth: string;
    emailVerified: boolean;
    infoLastModified: string;
}

export declare interface ICreationAttributes extends Optional<IAttributes, 'id' | 'credit' | 'withdrawalPassword' | 'isActivePassword2' | 'token' | 'avatarUrl' | 'referrerId' | 'referralCode' | 'ip' | 'loginFailed' | 'withdrawalPasswordFailed' | 'status' | 'emailVerified' | 'infoLastModified'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('user', {
    id: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
        primaryKey: true,
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
    password2: {
        type: STRING(32),
        allowNull: true,
        defaultValue: ''
    },
    withdrawalPassword: {
        type: STRING(32),
        allowNull: true,
        defaultValue: ''
    },
    isActivePassword2: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    token: {
        type: STRING,
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
    withdrawalPasswordFailed: {
        type: INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment: 'The continuous failed withdrawal password input from Client',
    },
    status: {
        type: STRING(20),
        allowNull: false,
        defaultValue: USER_STATUS.OPEN,
        validate: {
            isIn: [VALID_USER_STATUS],
        },
    },
    dateOfBirth: {
        type: DATEONLY,
        allowNull: false,
    },
    emailVerified: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    infoLastModified: {
        type: DATE,
        allowNull: true,
    },
}, (app) => {
    app.model.User.belongsTo(app.model.Role, {
        foreignKey: 'role_id', targetKey: 'id', as: 'role', onDelete: 'CASCADE',
    });
    app.model.User.belongsTo(app.model.User.Level, {
        foreignKey: 'level_id', targetKey: 'id', as: 'level', onDelete: 'CASCADE',
    });

    /**
     ** - Declare [Has Many] associates
     ** - [foreignKey] will be the populated key of [User Role] Sequelize Model -> Cannot declare since no specified property declared
     ** - Cannot declare targetKey (Primary Key of User)
     ** @see {@link https://medium.com/@eth3rnit3/sequelize-relationships-ultimate-guide-f26801a75554}
     **/
    app.model.User.hasOne(app.model.Credit, {
        sourceKey: 'id', foreignKey: 'uid', as: 'credit', onDelete: 'CASCADE',
    });
    app.model.User.hasMany(app.model.Request, {
        sourceKey: 'id', foreignKey: 'uid', as: 'requests', onDelete: 'CASCADE',
    });
    app.model.User.hasMany(app.model.Account, {
        sourceKey: 'id', foreignKey: 'uid', as: 'accounts', onDelete: 'CASCADE',
    });
    app.model.User.hasMany(app.model.User, {
        sourceKey: 'id', foreignKey: 'referrer_id', as: 'invitedUsers', onDelete: 'CASCADE',
    });
    app.model.User.hasMany(app.model.User.Level.Log, {
        sourceKey: 'id', foreignKey: 'uid', as: 'logLevel', onDelete: 'CASCADE',
    });
    app.model.User.hasMany(app.model.User.History, {
        sourceKey: 'id', foreignKey: 'uid', as: 'history', onDelete: 'CASCADE',
    });
    app.model.User.hasMany(app.model.User.Login.History, {
        sourceKey: 'id', foreignKey: 'uid', as: 'loginHistory', onDelete: 'CASCADE',
    });
    app.model.User.belongsTo(app.model.User, {
        foreignKey: 'referrer_id', targetKey: 'id', as: 'referredByUser', onDelete: 'CASCADE',
    });
}, (app) => ({
    indexes: [
        {fields: ['email'], unique: true, name: 'uniq_email'},
        {fields: ['username'], unique: true, name: 'uniq_username'},
        {fields: ['phone_number'], unique: true, name: 'uniq_phone_number'},
        {fields: ['referral_code'], unique: false, name: 'referral_code'},
        {fields: ['referrer_id'], unique: false, name: 'referrer_id'},
    ],
    hooks: {
        afterCreate: async function (record, options) {
            const {id, ...restProps} = record.get({plain: true});
            const {transaction} = options;

            const history = pick({...restProps}, [
                'roleId', 'levelId', 'username', 'password', 'fullName', 'email', 'phoneNumber',
                'avatarUrl', 'referrerId', 'referralCode', 'ip', 'status', 'loginFailed',
            ]);

            await app.model.User.History.create({
                uid: id,
                ...removeNullableKeyFrom({...history}),
                ...removeNullableKeyFrom({
                    updatedBy: id,
                    note: "Tạo tài khoản",
                }),
            }, {
                transaction: transaction,
            });

            return Promise.resolve(void 0);
        },
        afterUpdate: async function (record, options) {
            const {id, ...restProps} = record.get({plain: true});
            const {transaction, user, request, message} = options;

            const history = pick({...restProps}, [
                'roleId', 'levelId', 'username', 'password', 'fullName', 'email', 'phoneNumber',
                'avatarUrl', 'referrerId', 'referralCode', 'ip', 'status', 'loginFailed',
            ]);

            await app.model.User.History.create({
                uid: id,
                ...removeNullableKeyFrom({...history}),
                ...removeNullableKeyFrom({
                    updatedBy: user?.id,
                    requestId: request?.id,
                    note: message,
                }),
            }, {
                transaction: transaction,
            });

            /** Careful because this ``${afterCommit}`` only run when you pass down Transaction Instance !*/
            options?.ctx && transaction?.afterCommit(async () => {
                if (!options?.ctx) {
                    return void 0;
                }
                return await options.ctx.reload(true) && void 0;
            });

            return Promise.resolve(void 0);
        },
    },
    underscored: true,
    charset: 'utf8mb4',
    engine: 'InnoDB',
}));
