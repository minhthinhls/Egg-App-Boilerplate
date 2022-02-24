import {INTEGER, STRING, UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {BOOK_TYPE} from "@/constants";

const VALID_BOOK_TYPE = Object.values(BOOK_TYPE);

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";
/** Import Models Attributes Defined Types !*/
import type {IAttributes as IProductAttributes} from "@/model/product";
import type {IAttributes as IPriceAttributes} from "@/model/price";

declare interface IPopulateAttributes {
    products: Array<IProductAttributes>;
    prices: Array<IPriceAttributes>;
}

export declare interface IAttributes extends Partial<IPopulateAttributes> {
    id: string;
    name: string;
    shortName: string;
    posterUrl: string;
    bookType: string;
    website: string;
    min: number;
    max: number;
}

export declare interface ICreationAttributes extends Optional<IAttributes, 'id' | 'name' | 'shortName' | 'posterUrl'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('banker', {
    id: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
        primaryKey: true,
    },
    name: {
        type: STRING(30),
        allowNull: false,
        defaultValue: '',
        comment: 'Banker Name',
    },
    shortName: {
        type: STRING(30),
        allowNull: false,
        defaultValue: '',
        comment: 'Banker Short name',
    },
    posterUrl: {
        type: STRING(200),
        allowNull: true,
        defaultValue: '',
    },
    website: {
        type: STRING(100),
        allowNull: false,
    },
    min: {
        type: INTEGER,
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    max: {
        type: INTEGER,
        allowNull: false,
        validate: {
            min: 0,
        },
    },
    bookType: {
        type: STRING,
        allowNull: false,
        validate: {
            isIn: [VALID_BOOK_TYPE],
        },
    },
}, (app) => {
    app.model.Banker.hasMany(app.model.Account, {
        sourceKey: 'id', foreignKey: 'banker_id', as: 'accounts', onDelete: 'CASCADE',
    });
    app.model.Banker.hasMany(app.model.BankerPrice, {
        sourceKey: 'id', foreignKey: 'banker_id', as: 'bankerPrices', onDelete: 'CASCADE',
    });
    app.model.Banker.hasMany(app.model.BankerProduct, {
        sourceKey: 'id', foreignKey: 'banker_id', as: 'bankerProducts', onDelete: 'CASCADE',
    });
    app.model.Banker.belongsToMany(app.model.Price, {
        foreignKey: 'banker_id', otherKey: 'price_id', through: 'banker_price', as: 'prices', onDelete: 'CASCADE',
    });
    app.model.Banker.belongsToMany(app.model.Product, {
        foreignKey: 'banker_id', otherKey: 'product_id', through: 'banker_product', as: 'products', onDelete: 'CASCADE',
    });
}, (/*app*/) => ({
    indexes: [
        {fields: ['name'], unique: true, name: 'uniq_banker_name'},
    ],
    underscored: true,
    comment: 'Banker Unit',
    charset: 'utf8mb4',
    freezeTableName: true,
    engine: 'InnoDB',
}));
