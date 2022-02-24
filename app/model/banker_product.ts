import {STRING, UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/** Import ES6 Custom [Utils && Helper] Dependencies !*/
import {/*Parser*/} from "@/utils";

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";
/** Import Models Attributes Defined Types !*/
import type {IAttributes as IBankerAttributes} from "@/model/banker";
import type {IAttributes as IProductAttributes} from "@/model/product";
import type {IAttributes as IRefundCommissionAttributes} from "@/model/commission/refund/config";

declare interface IPopulateAttributes {
    banker: IBankerAttributes | null;
    product: IProductAttributes | null;
    refundCommission: Array<IRefundCommissionAttributes> | [];
}

export declare interface IAttributes extends Partial<IPopulateAttributes> {
    id: string;
    bankerId: string;
    productId: string;
    constants: Array<string> | string; // ["all", "sb", "games-xs"]
}

export declare interface ICreationAttributes extends Optional<IAttributes, 'id'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('banker_product', {
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
    productId: {
        type: UUID,
        allowNull: false,
    },
    constants: {
        type: STRING,
        allowNull: false,
        /**
         ** @param {Array<string>} constants
         ** @returns {void}
         **/
        set: function (constants: Array<string>) {
            /** TODO: Have to check the constants is array of string here !*/
            this.setDataValue('constants', JSON.stringify(constants).toLowerCase());
        },
        get: function () {
            const rawValue = this.getDataValue('constants');
            return JSON.parse(rawValue as string, {
                emitError: false,
            });
        },
        comment: 'Trường này dùng để xác định dữ liệu winloss/turnover import từ excel thuộc trò nào',
    },
}, (app) => {
    app.model.BankerProduct.belongsTo(app.model.Banker, {
        foreignKey: 'banker_id', targetKey: 'id', as: 'banker', onDelete: 'CASCADE',
    });
    app.model.BankerProduct.belongsTo(app.model.Product, {
        foreignKey: 'product_id', targetKey: 'id', as: 'product', onDelete: 'CASCADE',
    });
    app.model.BankerProduct.hasMany(app.model.Commission.Refund.Config, {
        sourceKey: 'id', foreignKey: 'banker_product_id', as: 'refundCommission', onDelete: 'CASCADE',
    });
}, (app) => ({
    indexes: [
        {fields: ['banker_id', 'product_id'], unique: true},
        {fields: ['product_id'], unique: false},
        {fields: ['banker_id'], unique: false},
    ],
    hooks: {
        afterCreate: async function (bankerProduct, options) {
            const {transaction} = options;
            const allAvailablePrice = await app.model.Price.findAll({raw: true});
            /** For every new Banker Product rows created, respectively create N-rows according to current rows from Price !*/
            await app.model.Commission.Refund.Config.bulkCreate([
                ...allAvailablePrice.map((price) => {
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
    comment: 'Banker Unit',
    charset: 'utf8mb4',
    freezeTableName: true,
    engine: 'InnoDB',
}));
