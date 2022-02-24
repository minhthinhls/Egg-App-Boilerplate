import {UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";
/** Import Models Attributes Defined Types !*/
import type {IAttributes as IBankerAttributes} from "@/model/banker";
import type {IAttributes as IPriceAttributes} from "@/model/price";

declare interface IPopulateAttributes {
    banker: IBankerAttributes | null;
    price: IPriceAttributes | null;
}

export declare interface IAttributes extends Partial<IPopulateAttributes> {
    id: string;
    bankerId: string;
    priceId: string;
}

export declare interface ICreationAttributes extends Optional<IAttributes, 'id'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('banker_price', {
    id: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
        primaryKey: true,
    },
    bankerId: {
        type: UUID,
        allowNull: false,
    },
    priceId: {
        type: UUID,
        allowNull: false,
    },
}, (app) => {
    app.model.BankerPrice.belongsTo(app.model.Banker, {
        foreignKey: 'banker_id', targetKey: 'id', as: 'banker', onDelete: 'CASCADE',
    });
    app.model.BankerPrice.belongsTo(app.model.Price, {
        foreignKey: 'price_id', targetKey: 'id', as: 'price', onDelete: 'CASCADE',
    });
}, (/*app*/) => ({
    indexes: [
        {fields: ['banker_id', 'price_id'], unique: true},
        {fields: ['price_id'], unique: false},
        {fields: ['banker_id'], unique: false},
    ],
    underscored: true,
    comment: 'Banker Unit',
    charset: 'utf8mb4',
    freezeTableName: true,
    engine: 'InnoDB',
}));
