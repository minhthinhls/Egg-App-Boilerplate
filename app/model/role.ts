import {STRING, UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/** Import constants !*/
import {ROLE, ROLE_ENUM} from "@/constants";

const VALID_ROLE_NAME_VALUES = Object.values(ROLE);

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";

export declare interface IAttributes {
    id: string;
    name: keyof typeof ROLE | ROLE_ENUM;
}

export declare interface ICreationAttributes extends Optional<IAttributes, 'id'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('role', {
    id: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
        primaryKey: true,
    },
    name: {
        type: STRING,
        allowNull: false,
        validate: {
            isIn: [VALID_ROLE_NAME_VALUES],
        },
    },
}, (app) => {
    app.model.Role.hasMany(app.model.User, {
        sourceKey: 'id', foreignKey: 'role_id', as: 'users', onDelete: 'CASCADE',
    });
}, (/*app*/) => ({
    indexes: [
        {fields: ['name'], unique: true, name: 'uniq_role_name'},
    ],
    underscored: true,
    charset: 'utf8mb4',
    engine: 'InnoDB',
}));
