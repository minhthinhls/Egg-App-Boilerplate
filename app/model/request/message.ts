import {TEXT, UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";

export declare interface IAttributes {
    id: string;
    requestId: string;
    from: string;
    message: string;
}

export declare interface ICreationAttributes extends Optional<IAttributes, 'id' | 'requestId'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('request_message', {
    id: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
        primaryKey: true,
    },
    requestId: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
    },
    /* Sender */
    from: {
        type: UUID,
        allowNull: false,
    },
    message: {
        type: TEXT({length: 'long'}),
        allowNull: false,
    },
}, (app) => {
    app.model.Request.Message.belongsTo(app.model.Request, {
        foreignKey: 'request_id', targetKey: 'id', as: 'request', onDelete: 'CASCADE',
    });
}, (/*app*/) => ({
    indexes: [
        {fields: ['request_id'], unique: false, name: 'request_id'},
    ],
    underscored: true,
    charset: 'utf8mb4',
    engine: 'InnoDB',
}));
