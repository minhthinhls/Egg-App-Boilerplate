import {INTEGER, STRING, UUID, UUIDV4} from "sequelize";
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
    bankId: number;
    name: string;
    shortName: string;
}

export declare interface ICreationAttributes extends Optional<IAttributes, 'id'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('vnpay_bank', {
    id: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
        primaryKey: true,
    },
    bankId: {
        type: INTEGER,
        allowNull: false,
        comment: 'VNPay bank id, example: 120',
    },
    name: {
        type: STRING,
        allowNull: false,
        comment: 'Bank name, example: Vietinbank',
    },
    shortName: {
        type: STRING,
        allowNull: false,
        comment: 'Bank short name, example: VTB',
    }
}, (/*app*/) => {
    return void 0;
}, (/*app*/) => ({
    indexes: [
        {fields: ['bank_id'], unique: true, name: 'uniq_bank'},
    ],
    underscored: true,
    comment: 'VNPay Bank Unit',
    charset: 'utf8mb4',
    freezeTableName: true,
    engine: 'InnoDB',
}));
