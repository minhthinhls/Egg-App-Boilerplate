import {DOUBLE, STRING, UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";

export declare interface IAttributes {
    id: string;
    bankerProductId: string;
    priceId: string;
    percent: number;
    details: string;
}

export declare interface ICreationAttributes extends Optional<IAttributes, 'id' | 'percent' | 'details'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('refund_commission_config', {
    id: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
        primaryKey: true,
    },
    bankerProductId: {
        type: UUID,
        allowNull: false,
    },
    priceId: {
        type: UUID,
        allowNull: false,
    },
    percent: {
        type: DOUBLE,
        allowNull: false,
        validate: {
            min: 0,
            max: 100,
        },
        defaultValue: 0,
        comment: 'The percentage of refund as turnover payload commission',
    },
    details: {
        type: STRING(300),
        allowNull: false,
        defaultValue: '',
        comment: 'The detail reason why this refund is applied',
    },
}, (app) => {
    app.model.Commission.Refund.Config.belongsTo(app.model.BankerProduct, {
        foreignKey: 'banker_product_id', targetKey: 'id', as: 'bankerProduct', onDelete: 'CASCADE',
    });
    app.model.Commission.Refund.Config.belongsTo(app.model.Price, {
        foreignKey: 'price_id', targetKey: 'id', as: 'price', onDelete: 'CASCADE',
    });
}, (app) => ({
    indexes: [
        {fields: ['banker_product_id', 'price_id'], unique: true},
        {fields: ['banker_product_id'], unique: false},
        {fields: ['price_id'], unique: false},
    ],
    hooks: {
        afterUpdate: async function (refundCommissionConfig, options) {
            const {id, ...restProps} = refundCommissionConfig.get({plain: true});
            const {transaction, user} = options;
            if (!id || !user || !user.id) {
                throw new ReferenceError("User context does not exists on update hook");
            }
            await app.model.Commission.Refund.Config.History.create({
                ...restProps,
                configId: refundCommissionConfig.id,
                updatedBy: user.id,
                createdAt: restProps.updatedAt,
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
