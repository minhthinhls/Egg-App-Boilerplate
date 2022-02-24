import {DOUBLE, STRING, UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";

export declare interface IAttributes {
    id: string;
    name: string;
    exchangeRate: number;
}

export declare interface ICreationAttributes extends Optional<IAttributes, 'id' | 'exchangeRate'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('price', {
    id: {
        type: UUID,
        allowNull: false,
        defaultValue: UUIDV4,
        primaryKey: true,
    },
    name: {
        type: STRING,
        allowNull: false,
        comment: "Đô 5, Đô 50,...",
    },
    exchangeRate: {
        type: DOUBLE,
        allowNull: false,
        defaultValue: 1,
        comment: 'Đô 5, exchangeRate = 5000 (VND), ...',
    },
}, (app) => {
    app.model.Price.hasMany(app.model.Commission.Refund.Config, {
        sourceKey: 'id', foreignKey: 'price_id', as: 'refundCommission', onDelete: 'CASCADE',
    });
    app.model.Price.hasMany(app.model.BankerPrice, {
        sourceKey: 'id', foreignKey: 'price_id', as: 'bankerPrices', onDelete: 'CASCADE',
    });
    app.model.Price.belongsToMany(app.model.Banker, {
        foreignKey: 'price_id', otherKey: 'banker_id', through: 'banker_price', as: 'bankers', onDelete: 'CASCADE',
    });
}, (app) => ({
    indexes: [
        {fields: ['name'], unique: true, name: 'uniq_name'},
    ],
    hooks: {
        afterCreate: async function (price, options) {
            const {transaction} = options;
            const allAvailableBankerProduct = await app.model.BankerProduct.findAll({raw: true});
            /** For every new Price created, respectively create N-rows according to current rows from Banker Product !*/
            await app.model.Commission.Refund.Config.bulkCreate([
                ...allAvailableBankerProduct.map((bankerProduct) => {
                    return ({
                        bankerProductId: bankerProduct.id,
                        priceId: price.id,
                    });
                }),
            ], {
                transaction: transaction,
            });
            return Promise.resolve(void 0);
        },
    },
    underscored: true,
    charset: 'utf8mb4',
    engine: 'InnoDB',
}));
