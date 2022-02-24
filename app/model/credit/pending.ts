import {DOUBLE, UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";

declare interface IAttributes {
    id: string;
    creditId: string;
    requestId: string;
    amount: number;
}

declare interface ICreationAttributes extends Optional<IAttributes, 'id'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('credit_pending', {
    id: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
        primaryKey: true,
    },
    creditId: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
    },
    requestId: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
    },
    /** Amount spending on [TRANSFER_CASH_IN] requests */
    amount: {
        type: DOUBLE,
        allowNull: false,
        defaultValue: 0,
    },
}, (app) => {
    app.model.Credit.Pending.belongsTo(app.model.Credit, {
        foreignKey: 'credit_id', targetKey: 'id', as: 'credit', onDelete: 'CASCADE',
    });
    app.model.Credit.Pending.belongsTo(app.model.Request, {
        foreignKey: 'request_id', targetKey: 'id', as: 'by', onDelete: 'CASCADE',
    });
}, (/*app*/) => ({
    indexes: [
        {fields: ['credit_id'], unique: false, name: 'credit_id'},
        {fields: ['request_id'], unique: false, name: 'request_id'},
    ],
    underscored: true,
    charset: 'utf8mb4',
    engine: 'InnoDB',
}));
