import {DOUBLE, STRING, UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/** Import constants !*/
import {REQUEST_TYPE, APPROVE_STATUS} from "@/constants";

const VALID_TYPE = [REQUEST_TYPE.TRANSFER_IN, REQUEST_TYPE.TRANSFER_OUT];
const VALID_APPROVE_STATUS = [APPROVE_STATUS.NONE, APPROVE_STATUS.APPROVED, APPROVE_STATUS.REJECTED];

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";

export declare interface IAttributes {
    id: string;
    uid: string;
    accountId: string;
    amount: number;
    balance: number;
    exchangeRate: number;
    type: string;
    approveStatus: string;
    approvedBy: string;
    note: string;
}

export declare interface ICreationAttributes extends Optional<IAttributes, 'id' | 'approveStatus'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('transfer_log', {
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
    accountId: {
        type: UUID,
        allowNull: false,
    },
    amount: {
        type: DOUBLE,
        allowNull: false,
    },
    balance: {
        type: DOUBLE,
        allowNull: false,
    },
    exchangeRate: {
        type: DOUBLE,
        allowNull: false,
    },
    type: {
        type: STRING,
        allowNull: false,
        validate: {
            isIn: [VALID_TYPE]
        }
    },
    approveStatus: {
        type: STRING(20),
        allowNull: false,
        defaultValue: APPROVE_STATUS.NONE,
        validate: {
            isIn: [VALID_APPROVE_STATUS]
        }
    },
    approvedBy: {
        type: UUID,
        allowNull: true,
    },
    note: {
        type: STRING,
        allowNull: true,
        defaultValue: '',
    },
}, (app) => {
    app.model.Transfer.Log.belongsTo(app.model.User, {
        foreignKey: 'uid', targetKey: 'id', as: 'user', onDelete: 'CASCADE',
    });
    app.model.Transfer.Log.belongsTo(app.model.User, {
        foreignKey: 'approved_by', targetKey: 'id', as: 'approvedByUser', onDelete: 'CASCADE',
    });
    app.model.Transfer.Log.belongsTo(app.model.Account, {
        foreignKey: 'account_id', targetKey: 'id', as: 'account', onDelete: 'CASCADE',
    });
}, (/*app*/) => ({
    indexes: [
        {fields: ['uid'], unique: false, name: 'user_id'},
    ],
    underscored: true,
    comment: 'Transfer History',
    charset: 'utf8mb4',
    freezeTableName: true,
    engine: 'InnoDB',
}));
