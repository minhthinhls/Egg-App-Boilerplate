import {UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";

/** Import Deep Nested Models Attributes Defined Types !*/
import type {IModelDeepAttributes} from "@/extend/types";

declare interface IPopulateAttributes {
    /* [[Populated Attributes Placeholder]] */
    user: IModelDeepAttributes<'User'>;
    level: IModelDeepAttributes<'User', 'Level'>;
}

export declare interface IAttributes extends Partial<IPopulateAttributes> {
    id: string;
    uid: string;
    levelId: string;
}

export declare interface ICreationAttributes extends Optional<IAttributes, 'id'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('user_level_log', {
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
    levelId: {
        type: UUID,
        allowNull: false,
    },
}, (app) => {
    app.model.User.Level.Log.belongsTo(app.model.User.Level, {
        foreignKey: 'level_id', targetKey: 'id', as: 'level', onDelete: 'CASCADE',
    });
    app.model.User.Level.Log.belongsTo(app.model.User, {
        foreignKey: 'uid', targetKey: 'id', as: 'user', onDelete: 'CASCADE',
    });
}, (/*app*/) => ({
    indexes: [
        {fields: ['uid'], unique: false, name: 'user_id'},
    ],
    underscored: true,
    comment: 'Log Level of Users',
    charset: 'utf8mb4',
    freezeTableName: true,
    engine: 'InnoDB',
}));
