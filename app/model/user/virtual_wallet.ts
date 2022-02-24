import {STRING, UUID, UUIDV4} from "sequelize";
import {BaseModel} from "@/extend/class";

/* eslint-disable-next-line no-unused-vars */
import type {Optional} from "sequelize/types";
/** Import Models Attributes Defined Types !*/
import type {IAttributes as IUserAttributes} from "@/model/user";
import type {IAttributes as ICurrencyAttributes} from "@/model/currency";

declare interface IPopulateAttributes {
    user: IUserAttributes;
    currency: ICurrencyAttributes;
}

export declare interface IAttributes extends Partial<IPopulateAttributes> {
    id: string;
    uid: string;
    currencyId: string;
    cryptoNetworkId: string;
    fullName: string;
    payId: string;
    password: string;
}

export declare interface ICreationAttributes extends Optional<IAttributes, 'id'> {
    /* [[Optional Attributes Placeholder]] */
}

export default BaseModel<IAttributes, ICreationAttributes>('virtual_wallet', {
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
    currencyId: {
        type: UUID,
        allowNull: false,
    },
    cryptoNetworkId: {
        type: UUID,
        allowNull: true,
    },
    fullName: {
        type: STRING,
        allowNull: false,
        comment: 'Full name',
    },
    payId: {
        type: STRING,
        allowNull: false,
        comment: 'Unique ID address of virtual wallet',
    },
    password: {
        type: STRING,
        allowNull: true,
        defaultValue: '',
    },
}, (app) => {
    app.model.User.VirtualWallet.belongsTo(app.model.User, {
        foreignKey: 'uid', targetKey: 'id', as: 'user', onDelete: 'CASCADE',
    });
    app.model.User.VirtualWallet.belongsTo(app.model.Currency, {
        foreignKey: 'currency_id', targetKey: 'id', as: 'currency', onDelete: 'CASCADE',
    });
    app.model.User.VirtualWallet.belongsTo(app.model.Crypto.Network, {
        foreignKey: 'crypto_network_id', targetKey: 'id', as: 'cryptoNetwork', onDelete: 'CASCADE',
    });
}, (/*app*/) => ({
    indexes: [
        {fields: ['pay_id'], unique: false, name: 'uniq_wallet'},
    ],
    underscored: true,
    charset: 'utf8mb4',
    engine: 'InnoDB',
}));
