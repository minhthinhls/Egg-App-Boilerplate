import {DOUBLE, STRING, UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";
/** Customized Context Params for Sequelize Options !*/
import type {IHookOptions} from "@/extend/types";
/** Import Models Attributes Defined Types !*/
import type {IAttributes as ICreditAttributes} from "@/model/credit";

export declare interface IAttributes extends ICreditAttributes {
    id: string;
    uid: string;
    creditId: string;
    balance: number;
    freeze: number;
    debt: number;
    change: number;
    action: IHookOptions["credit"]["action"];
    updatedBy: string;
    message: string;
}

export declare interface ICreationAttributes extends Optional<IAttributes, 'id' | 'change' | 'action' | 'message'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('credit_history', {
    id: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
        primaryKey: true,
    },
    uid: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
    },
    creditId: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
    },
    balance: {
        type: DOUBLE,
        allowNull: false,
        defaultValue: 0,
    },
    /** Sum amount spending on requests */
    freeze: {
        type: DOUBLE,
        allowNull: false,
        defaultValue: 0,
    },
    /** Negative commission **/
    debt: {
        type: DOUBLE,
        allowNull: false,
        defaultValue: 0,
    },
    change: {
        type: DOUBLE,
        allowNull: false,
        defaultValue: 0,
    },
    action: {
        type: STRING,
        allowNull: false,
        defaultValue: '',
    },
    updatedBy: {
        type: UUID,
        allowNull: false,
    },
    message: {
        type: STRING,
        allowNull: true,
    },
}, (app) => {
    app.model.Credit.History.belongsTo(app.model.Credit, {
        foreignKey: 'credit_id', targetKey: 'id', as: 'credit', onDelete: 'CASCADE',
    });
    app.model.Credit.History.belongsTo(app.model.User, {
        foreignKey: 'updated_by', targetKey: 'id', as: 'changedBy', onDelete: 'CASCADE',
    });
    app.model.Credit.History.belongsTo(app.model.User, {
        foreignKey: 'uid', targetKey: 'id', as: 'user', onDelete: 'CASCADE',
    });
}, (/*app*/) => ({
    indexes: [
        {fields: ['credit_id'], unique: false, name: 'credit_id'},
    ],
    underscored: true,
    charset: 'utf8mb4',
    engine: 'InnoDB',
}));
