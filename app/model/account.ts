import {STRING, UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {ACCOUNT_STATUS} from "@/constants";

const VALID_STATUS = Object.values(ACCOUNT_STATUS);

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";
/** Import Models Attributes Defined Types !*/
import type {IAttributes as IUserAttributes} from "@/model/user";
import type {IAttributes as IPriceAttributes} from "@/model/price";
import type {IAttributes as IBankerAttributes} from "@/model/banker";

declare interface IPopulateAttributes {
    user: IUserAttributes;
    price: IPriceAttributes;
    banker: IBankerAttributes;
}

export declare interface IAttributes extends Partial<IPopulateAttributes> {
    id: string;
    uid: string;
    priceId: string;
    bankerId: string;
    username: string;
    password: string;
    status: string;
}

export declare interface ICreationAttributes extends Optional<IAttributes, 'id' | 'username' | 'password' | 'status'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('account', {
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
    priceId: {
        type: UUID,
        allowNull: false,
    },
    bankerId: {
        type: UUID,
        allowNull: false,
    },
    username: {
        type: STRING(30),
        allowNull: false,
        defaultValue: '',
        comment: 'Login Username',
    },
    password: {
        type: STRING(30),
        allowNull: false,
        defaultValue: '',
        comment: 'Login Password',
    },
    status: {
        type: STRING(20),
        allowNull: false,
        defaultValue: ACCOUNT_STATUS.OPEN,
        comment: "Status Of Account",
        validate: {
            isIn: [VALID_STATUS],
        },
    },
}, (app) => {
    app.model.Account.belongsTo(app.model.User, {
        foreignKey: 'uid', targetKey: 'id', as: 'user', onDelete: 'CASCADE',
    });
    app.model.Account.belongsTo(app.model.Price, {
        foreignKey: 'price_id', targetKey: 'id', as: 'price', onDelete: 'CASCADE',
    });
    app.model.Account.belongsTo(app.model.Banker, {
        foreignKey: 'banker_id', targetKey: 'id', as: 'banker', onDelete: 'CASCADE',
    });
    app.model.Account.hasMany(app.model.Account.History, {
        sourceKey: 'id', foreignKey: 'account_id', as: 'history', onDelete: 'CASCADE',
    });
}, (app) => ({
    indexes: [
        {fields: ['username', 'banker_id'], unique: true, name: 'uniq_account'},
    ],
    hooks: {
        afterCreate: async function (account, options) {
            const {id, uid, bankerId, priceId, username, password, status} = account;
            const {transaction, user, request, message} = options;
            if (!user || !user.id) {
                throw new ReferenceError("User context does not exists on update hook");
            }
            await app.model.Account.History.create({
                uid: uid,
                accountId: id,
                bankerId: bankerId,
                priceId: priceId,
                username: username,
                password: password,
                status: status,
                updatedBy: user.id,
                requestId: request?.id || null,
                note: "Duyệt tạo tài khoản: " + message,
            }, {
                transaction: transaction,
            });
            return Promise.resolve(void 0);
        },
        afterUpdate: async function (account, options) {
            const {id, uid, bankerId, priceId, username, password, status} = account;
            const {transaction, user, request, message} = options;
            if (!user || !user.id) {
                throw new ReferenceError("User context does not exists on update hook");
            }
            if (!request || !request.id) {
                console.error(new ReferenceError("This Row of Account History will not included the corresponding requestId"));
            }
            await app.model.Account.History.create({
                uid: uid,
                accountId: id,
                /* After updated value */
                bankerId: bankerId,
                priceId: priceId,
                username: username,
                password: password,
                status: status,
                updatedBy: user.id,
                requestId: request?.id || null,
                note: message || '',
            }, {
                transaction: transaction,
            });
            return Promise.resolve(void 0);
        },
    },
    underscored: true,
    comment: 'Banker Unit',
    charset: 'utf8mb4',
    freezeTableName: true,
    engine: 'InnoDB',
}));
