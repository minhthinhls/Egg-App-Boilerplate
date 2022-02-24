import {DOUBLE, UUID, UUIDV4} from "sequelize";
import {removeNullableKeyFrom} from "@/extend/helper";
import {BaseModel} from "@/extend/class";

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";

export declare interface IAttributes {
    id: string;
    uid: string;
    balance: number;
    freeze: number;
    debt: number;
}

export declare interface ICreationAttributes extends Optional<IAttributes, 'id'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('credit', {
    id: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
        primaryKey: true,
    },
    uid: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
    },
    balance: {
        type: DOUBLE,
        allowNull: false,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    },
    /** Sum amount spending on requests */
    freeze: {
        type: DOUBLE,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isLessThanOrEqualToBalanceField: function (this: IAttributes, value: number) {
                if (value === 0) {
                    return true;
                }
                if (value <= this.balance) {
                    throw new Error('Freeze balance must be less than or equal to balance');
                }
            },
        },
    },
    /** Negative commission **/
    debt: {
        type: DOUBLE,
        allowNull: false,
        defaultValue: 0,
    },
}, (app) => {
    app.model.Credit.belongsTo(app.model.User, {
        foreignKey: 'uid', targetKey: 'id', as: 'user', onDelete: 'CASCADE',
    });
    app.model.Credit.hasMany(app.model.Credit.History, {
        sourceKey: 'id', foreignKey: 'credit_id', as: 'histories', onDelete: 'CASCADE',
    });
}, (app) => ({
    indexes: [
        {fields: ['uid'], unique: true, name: 'user_id'},
    ],
    hooks: {
        afterCreate: async function (credit, options) {
            const {id, uid, balance, freeze, debt} = credit;
            const {transaction} = options;
            await app.model.Credit.History.create(removeNullableKeyFrom({
                creditId: id,
                uid: uid,
                balance: balance,
                freeze: freeze,
                debt: debt,
                change: options.credit?.change,
                action: options.credit?.action,
                updatedBy: uid,
            }), {
                transaction: transaction,
            });
            return Promise.resolve(void 0);
        },
        afterUpdate: async function (credit, options) {
            const {id, uid, balance, freeze, debt} = credit;
            const {transaction, user, message} = options;
            if (!user || !user.id) {
                throw new ReferenceError("User context does not exists on update hook");
            }
            await app.model.Credit.History.create(removeNullableKeyFrom({
                creditId: id,
                uid: uid,
                /* After updated value */
                balance: balance,
                freeze: freeze,
                debt: debt,
                change: options.credit?.change,
                action: options.credit?.action,
                updatedBy: user.id,
                message: message,
            }), {
                transaction: transaction,
            });
            return Promise.resolve(void 0);
        },
    },
    underscored: true,
    charset: 'utf8mb4',
    engine: 'InnoDB',
}));
