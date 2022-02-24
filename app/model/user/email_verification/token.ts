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
    token: string;
    /** - Token will expired on this created timestamp !*/
    expired: boolean;
}

export declare interface ICreationAttributes extends Optional<IAttributes, 'id' | 'expired'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('user_verification_token', {
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
    token: {
        type: STRING,
        allowNull: false,
        comment: 'MD5 Hash [userId && Seed Nonce && Timestamp]',
    },
    expired: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Token will expired on this created timestamp',
    },
}, (app) => {
    app.model.User.EmailVerification.Token.belongsTo(app.model.User, {
        foreignKey: 'uid', targetKey: 'id', as: 'user', onDelete: 'CASCADE',
    });
}, (/*app*/) => ({
    indexes: [
        {fields: ['uid'], unique: true, name: 'uniq_user'},
        {fields: ['token'], unique: true, name: 'uniq_token'},
        {fields: ['token', 'uid'], unique: true, name: 'uniq_token_by_userId'},
    ],
    underscored: true,
    charset: 'utf8mb4',
    engine: 'InnoDB',
}));
