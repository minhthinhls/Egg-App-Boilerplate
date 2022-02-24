import {BOOLEAN, STRING, UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";
/** Import Models Attributes Defined Types !*/
import type {IAttributes as IUserAttributes} from "@/model/user";

declare interface IPopulateAttributes {
    user: IUserAttributes;
}

export declare interface IAttributes extends Partial<IPopulateAttributes> {
    id: string;
    uid: string;
    username: string;
    token: string;
    /** - Token will expired on this created timestamp !*/
    expired: boolean;
}

export declare interface ICreationAttributes extends Optional<IAttributes, 'id' | 'expired'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('user_password_reset', {
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
    username: {
        type: STRING,
        allowNull: false,
        comment: 'Username from User Schema',
    },
    token: {
        type: STRING,
        allowNull: false,
        comment: 'MD5 Hash [Username && Seed Nonce && Timestamp]',
    },
    expired: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Token will expired on this created timestamp',
    },
}, (app) => {
    app.model.User.Password.Reset.belongsTo(app.model.User, {
        foreignKey: 'uid', targetKey: 'id', as: 'user', onDelete: 'CASCADE',
    });
}, (/*app*/) => ({
    indexes: [
        {fields: ['uid'], unique: true, name: 'uniq_user'},
        {fields: ['token'], unique: true, name: 'uniq_token'},
        {fields: ['username'], unique: true, name: 'uniq_username'},
        {fields: ['token', 'username'], unique: true, name: 'uniq_token_by_username'},
    ],
    underscored: true,
    charset: 'utf8mb4',
    engine: 'InnoDB',
}));
