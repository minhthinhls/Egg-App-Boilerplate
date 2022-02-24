/* eslint-disable-next-line no-unused-vars */
import type {Optional, ModelCtor, ModelAttributes} from "sequelize/types";
/* eslint-disable-next-line no-unused-vars */
import type {RawModelDefined, SequelizeRawModel} from "./abstract";
/* eslint-disable-next-line no-unused-vars */
import type {IApplication, IModelOptions} from "@/extend/types";

export declare interface IBaseAttributes {
    id: string;
    createdAt: string;
    updatedAt: string;
}

export declare interface IBaseCreationAttributes extends Optional<IBaseAttributes, 'id' | 'createdAt' | 'updatedAt'> {
    /* [[Optional Attributes Placeholder]] */
}

export default <
    IAttributes extends Omit<IBaseAttributes, 'createdAt' | 'updatedAt'> = IBaseAttributes,
    ICreationAttributes extends Optional<IBaseCreationAttributes, 'id' | 'createdAt' | 'updatedAt'> = IBaseCreationAttributes,
    ISequelizeRawModel extends SequelizeRawModel<IAttributes & IBaseAttributes, ICreationAttributes> = SequelizeRawModel<IAttributes & IBaseAttributes, ICreationAttributes>
>(
    modelName: string,
    attributes: ModelAttributes<ISequelizeRawModel, ISequelizeRawModel['_creationAttributes'] & ICreationAttributes>,
    associateCallbackFn: (app: IApplication) => void,
    options: (app: IApplication) => IModelOptions<SequelizeRawModel<IAttributes, ICreationAttributes>>
) => (app: IApplication): RawModelDefined<IAttributes & IBaseAttributes, ICreationAttributes & IBaseCreationAttributes> => {
    const Schema: ModelCtor<SequelizeRawModel<
        IAttributes & IBaseAttributes,
        ICreationAttributes & IBaseCreationAttributes
    >> = app.model.define<SequelizeRawModel<
        IAttributes & IBaseAttributes,
        ICreationAttributes & IBaseCreationAttributes
    >, ISequelizeRawModel['_creationAttributes'] & ICreationAttributes>(modelName, attributes, {
        ...options(app),
        /** All columns name must be converted to [[under_scored]] format !*/
        underscored: true,
        /** Disable Pluralization for Table Name on MySQL Schema Creation !*/
        freezeTableName: true,
    });

    /**
     ** - Declare [Belongs To] associates
     ** - [foreignKey] will be the populated key of [User Request] Sequelize Model
     ** - No need to declare targetKey (Primary Key of User Role) since its default to [id]
     ** @see {@link https://medium.com/@eth3rnit3/sequelize-relationships-ultimate-guide-f26801a75554}
     ** @ts-ignore ~!*/
    Schema.associate = () => associateCallbackFn(app);

    return Schema as RawModelDefined<IAttributes & IBaseAttributes, ICreationAttributes & IBaseCreationAttributes>;
};
