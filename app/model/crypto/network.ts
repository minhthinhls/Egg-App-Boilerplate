import {STRING, UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";

declare interface IPopulateAttributes {
    /* [[Populated Attributes Placeholder]] */
}

export declare interface IAttributes extends Partial<IPopulateAttributes> {
    id: string;
    name: string;
}

export declare interface ICreationAttributes extends Optional<IAttributes, 'id'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('crypto_network', {
    id: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
        primaryKey: true,
    },
    name: {
        type: STRING,
        allowNull: false,
        comment: 'Network name, example: TRON (TRC20)',
    }
}, (/*app*/) => {
    return void 0;
}, (/*app*/) => ({
    indexes: [
        {fields: ['name'], unique: true, name: 'uniq_network_name'},
    ],
    underscored: true,
    comment: 'VNPay Bank Unit',
    charset: 'utf8mb4',
    freezeTableName: true,
    engine: 'InnoDB',
}));
