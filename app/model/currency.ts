import {DOUBLE, INTEGER, STRING, UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";

/** Import Models Attributes Defined Types !*/
import type {/*IAttributes as IUserAttributes*/} from "@/model/user";

declare interface IPopulateAttributes {
    /* [[Populated Attributes Placeholder]] */
}

export declare interface IAttributes extends Partial<IPopulateAttributes> {
    id: string;
    name: string;
    exchangeRate: number;
    buyPrice: number;
    sellPrice: number;
}

export declare interface ICreationAttributes extends Optional<IAttributes, 'id' | 'name' | 'exchangeRate' | 'buyPrice' | 'sellPrice'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('currency', {
    id: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
        primaryKey: true,
    },
    name: {
        type: STRING(30),
        allowNull: false,
        defaultValue: '',
        comment: 'Currency name'
    },
    /** @deprecated */
    exchangeRate: {
        type: DOUBLE,
        allowNull: false,
        defaultValue: 1,
        validate: {
            min: 0,
        },
        comment: '1 VCash point = ? point of this currency'
    },
    buyPrice: {
        type: INTEGER,
        validate: {
            min: 0,
            isInt: true,
        },
        allowNull: true,
        defaultValue: 1,
    },
    sellPrice: {
        type: INTEGER,
        validate: {
            min: 0,
            isInt: true,
        },
        allowNull: true,
        defaultValue: 1,
    },
}, (/*app*/) => {
    return void 0;
}, (/*app*/) => ({
    indexes: [
        {fields: ['name'], unique: true, name: 'name'},
    ],
    underscored: true,
    charset: 'utf8mb4',
    engine: 'InnoDB',
}));
