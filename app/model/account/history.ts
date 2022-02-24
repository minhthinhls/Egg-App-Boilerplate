import {STRING, UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/** Import constants !*/
import {ACCOUNT_STATUS} from "@/constants";

const VALID_STATUS = Object.values(ACCOUNT_STATUS);

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";
/* eslint-disable-next-line no-unused-vars */
import type {IAttributes as IAccountAttributes} from "@/model/account";
/* eslint-disable-next-line no-unused-vars */
import type {IAttributes as IRequestAttributes} from "@/model/request";

declare interface IAttributes extends IAccountAttributes {
    id: string;
    accountId: string;
    uid: string;
    requestId: IRequestAttributes["id"] | null;
    request?: IRequestAttributes | null;
    bankerId: string;
    priceId: string;
    username: string;
    password: string;
    status: string;
    note: string;
    updatedBy: string;
}

declare interface ICreationAttributes extends Optional<IAttributes, 'id' | 'requestId' | 'request' | 'note'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('account_history', {
    id: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
        primaryKey: true,
    },
    accountId: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
    },
    uid: {
        type: UUID,
        allowNull: false,
    },
    requestId: {
        type: UUID,
        allowNull: true,
        defaultValue: null,
    },
    bankerId: {
        type: UUID,
        allowNull: false,
    },
    priceId: {
        type: UUID,
        allowNull: false,
    },
    username: {
        type: STRING(30),
        allowNull: false,
        defaultValue: '',
        comment: 'Login Username',
    },
    password: {
        type: STRING(30),
        allowNull: false,
        defaultValue: '',
        comment: 'Login Password',
    },
    status: {
        type: STRING(20),
        allowNull: false,
        defaultValue: ACCOUNT_STATUS.OPEN,
        comment: "Status Of Account",
        validate: {
            isIn: [VALID_STATUS],
        },
    },
    updatedBy: {
        type: UUID,
        allowNull: false,
    },
    note: {
        type: STRING,
        allowNull: true,
        defaultValue: '',
    },
}, (app) => {
    app.model.Account.History.belongsTo(app.model.User, {
        foreignKey: 'uid', targetKey: 'id', as: 'user', onDelete: 'CASCADE',
    });
    app.model.Account.History.belongsTo(app.model.User, {
        foreignKey: 'updated_by', targetKey: 'id', as: 'changedBy', onDelete: 'CASCADE',
    });
    app.model.Account.History.belongsTo(app.model.Account, {
        foreignKey: 'account_id', targetKey: 'id', as: 'account', onDelete: 'CASCADE',
    });
}, (/*app*/) => ({
    indexes: [
        {fields: ['username', 'account_id'], unique: false},
    ],
    underscored: true,
    comment: 'Account History Logger',
    charset: 'utf8mb4',
    freezeTableName: true,
    engine: 'InnoDB',
}));
