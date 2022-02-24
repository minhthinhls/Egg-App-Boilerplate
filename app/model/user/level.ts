import {DOUBLE, STRING, UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";

/** Import Models Attributes Defined Types !*/
import type {IAttributes as IUserAttributes} from "@/model/user";

declare interface IExtraAttributes {
    users: Array<IUserAttributes>;
}

declare interface IPopulateAttributes {
    /* [[Populated Attributes Placeholder]] */
}

export declare interface IAttributes extends Partial<IPopulateAttributes>, Partial<IExtraAttributes> {
    id: string;
    name: string;
    cumulativeDeposit: number;
    percentRefund: number;
}

export declare interface ICreationAttributes extends Optional<IAttributes, 'id' | 'name' | 'cumulativeDeposit' | 'percentRefund'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('user_level', {
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
        comment: 'Level Name',
    },
    cumulativeDeposit: {
        type: DOUBLE,
        allowNull: false,
        defaultValue: 0,
        comment: 'Min Cumulative deposit to reach this level',
    },
    percentRefund: {
        type: DOUBLE,
        allowNull: false,
        defaultValue: 0,
        comment: 'Percentage refund by Turnover',
    },
}, (/*app*/) => {
    return void 0;
}, (/*app*/) => ({
    indexes: [
        {fields: ['name'], unique: true, name: 'uniq_name'},
    ],
    underscored: true,
    comment: 'Level Unit',
    charset: 'utf8mb4',
    freezeTableName: true,
    engine: 'InnoDB',
}));
