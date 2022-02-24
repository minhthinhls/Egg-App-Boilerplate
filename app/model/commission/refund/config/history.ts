import {DOUBLE, STRING, UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";
/** Import Models Attributes Defined Types !*/
import type {IAttributes as IRefundCommissionAttributes} from "../config";

export declare interface IAttributes extends IRefundCommissionAttributes {
    id: string;
    bankerProductId: string;
    configId: string;
    priceId: string;
    percent: number;
    details: string;
    updatedBy: string;
}

export declare interface ICreationAttributes extends Optional<IAttributes, 'id' | 'percent' | 'details'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('refund_commission_config_history', {
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
    configId: {
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
    /** Operator who handling this Request !*/
    updatedBy: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
    },
}, (app) => {
    app.model.Commission.Refund.Config.History.belongsTo(app.model.Commission.Refund.Config, {
        foreignKey: 'refund_commission_config_id', targetKey: 'id', as: 'refundCommission', onDelete: 'CASCADE',
    });
    app.model.Commission.Refund.Config.History.belongsTo(app.model.BankerProduct, {
        foreignKey: 'banker_product_id', targetKey: 'id', as: 'bankerProduct', onDelete: 'CASCADE',
    });
    app.model.Commission.Refund.Config.History.belongsTo(app.model.Price, {
        foreignKey: 'price_id', targetKey: 'id', as: 'price', onDelete: 'CASCADE',
    });
    app.model.Commission.Refund.Config.History.belongsTo(app.model.User, {
        foreignKey: 'updated_by', targetKey: 'id', as: 'updatedByUser', onDelete: 'CASCADE',
    });
}, (/*app*/) => ({
    indexes: [
        {fields: ['banker_product_id'], unique: false},
        {fields: ['price_id'], unique: false},
    ],
    underscored: true,
    comment: 'Banker Unit',
    charset: 'utf8mb4',
    freezeTableName: true,
    engine: 'InnoDB',
}));
