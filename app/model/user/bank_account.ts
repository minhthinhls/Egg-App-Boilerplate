import {STRING, UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";
/** Import Models Attributes Defined Types !*/
import type {IAttributes as IUserAttributes} from "@/model/user";
import type {IAttributes as IBankAttributes} from "@/model/vnpay/bank";

declare interface IPopulateAttributes {
    user: IUserAttributes;
    bank: IBankAttributes;
}

export declare interface IAttributes extends Partial<IPopulateAttributes> {
    id: string;
    uid: string;
    bankId: string;
    cardName: string;
    cardNo: string;
    province: string;
    city: string;
    branchName: string;
    /** @deprecated ~!*/
    password: string;
}

export declare interface ICreationAttributes extends Optional<IAttributes, 'id' | 'cardName' | 'province' | 'city' | 'branchName'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('bank_account', {
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
    bankId: {
        type: UUID,
        allowNull: false,
    },
    cardName: {
        type: STRING,
        allowNull: false,
        defaultValue: '',
        comment: 'Full name',
    },
    cardNo: {
        type: STRING,
        allowNull: false,
        comment: 'Bank account number',
    },
    province: {
        type: STRING,
        allowNull: true,
        defaultValue: '',
        comment: 'Province',
    },
    city: {
        type: STRING,
        allowNull: true,
        defaultValue: '',
        comment: 'City',
    },
    branchName: {
        type: STRING,
        allowNull: true,
        defaultValue: '',
        comment: 'Branch name',
    },
    password: {
        type: STRING,
        allowNull: true,
        defaultValue: '',
    },
}, (app) => {
    app.model.User.BankAccount.belongsTo(app.model.User, {
        foreignKey: 'uid', targetKey: 'id', as: 'user', onDelete: 'CASCADE',
    });
    app.model.User.BankAccount.belongsTo(app.model.Vnpay.Bank, {
        foreignKey: 'bank_id', targetKey: 'id', as: 'bank', onDelete: 'CASCADE',
    });
}, (/*app*/) => ({
    indexes: [
        {fields: ['card_no', 'bank_id'], unique: false, name: 'uniq_card'},
    ],
    underscored: true,
    charset: 'utf8mb4',
    engine: 'InnoDB',
}));
