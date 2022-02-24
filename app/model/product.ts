import {STRING, UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/** Import ENUMS & CONSTANTS !*/
import {BOOK_TYPE} from "@/constants";

const VALID_BOOK_TYPE = Object.values(BOOK_TYPE);

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";
/** Import Models Attributes Defined Types !*/
import type {IAttributes as IBankerProductAttributes} from "@/model/banker_product";

declare interface IPopulateAttributes {
    /* [[Populated Attributes Placeholder]] */
    bankerProduct: IBankerProductAttributes;
}

export declare interface IAttributes extends Partial<IPopulateAttributes> {
    id: string;
    name: string;
    originName: string;
    posterUrl: string;
}

export declare interface ICreationAttributes extends Optional<IAttributes, 'id' | 'originName' | 'posterUrl'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('product', {
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
        comment: 'Vietnamese Product Name',
    },
    originName: {
        type: STRING(30),
        allowNull: true,
        validate: {
            isIn: [VALID_BOOK_TYPE],
        },
        comment: 'Original Name from Valid Book Type',
    },
    posterUrl: {
        type: STRING(200),
        allowNull: true,
        defaultValue: '',
    },
}, (app) => {
    app.model.Product.hasMany(app.model.BankerProduct, {
        sourceKey: 'id', foreignKey: 'product_id', as: 'bankerProducts', onDelete: 'CASCADE',
    });
    app.model.Product.belongsToMany(app.model.Banker, {
        foreignKey: 'product_id', otherKey: 'banker_id', through: 'banker_product', as: 'bankers', onDelete: 'CASCADE',
    });
}, (/*app*/) => ({
    indexes: [
        {fields: ['name'], unique: true, name: 'uniq_product_name'},
    ],
    underscored: true,
    comment: 'Banker Unit',
    charset: 'utf8mb4',
    freezeTableName: true,
    engine: 'InnoDB',
}));
