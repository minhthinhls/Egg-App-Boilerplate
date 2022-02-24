/* eslint-disable-next-line no-unused-vars */
import type {Identifier, CreateOptions, UpdateOptions, FindOptions, FindAndCountOptions, NonNullFindOptions} from "sequelize/types";
/* eslint-disable-next-line no-unused-vars */
import type {Model, ModelStatic, ModelCtor} from "sequelize/types";
/* eslint-disable-next-line no-unused-vars */
import type {Col, Fn, Literal} from "sequelize/types/lib/utils";
/* eslint-disable-next-line no-unused-vars */
import type {IBaseAttributes} from "@/extend/class";
/* eslint-disable-next-line no-unused-vars */
import type {IModelOptions} from "@/extend/types";
/* eslint-disable-next-line no-unused-vars */
import {Model as SequelizeModel} from "sequelize/types";

declare type ModelCreator<M extends Model> = typeof SequelizeRawModel & ModelCtor<M> & {new(): M & M["_attributes"]};

export abstract class SequelizeRawModel<
    TModelAttributes extends Partial<IBaseAttributes> = Partial<IBaseAttributes>,
    TCreationAttributes extends Partial<IBaseAttributes> = TModelAttributes
> extends SequelizeModel<TModelAttributes & IBaseAttributes, TCreationAttributes> {

    /**
     ** @override
     ** @see {@link https://github.com/sequelize/sequelize/issues/12575}
     ** @ts-ignore ~!*/
    public static create<M extends SequelizeModel, R extends {} = M['_attributes'], O extends {} = CreateOptions<M['_attributes']>>(
        this: ModelStatic<M>,
        values?: M['_creationAttributes'],
        options?: CreateOptions<M['_attributes']>
    ): Promise<O extends {returning: false} | {ignoreDuplicates: true} ? void : (M & R)>;

    /**
     ** @override
     ** @see {@link https://github.com/sequelize/sequelize/issues/12575}
     ** @ts-ignore ~!*/
    public static update<M extends SequelizeModel, R extends {} = M['_attributes'], O extends {} = UpdateOptions<M['_attributes']>>(
        this: ModelStatic<M>,
        values: {
            [key in keyof M['_attributes']]?: M['_attributes'][key] | Fn | Col | Literal;
        },
        options: UpdateOptions<M['_attributes']> & Partial<IModelOptions>
    ): Promise<O extends {returning: false} ? void : [number, (M & R)[]]>;

    /**
     ** @override
     ** @see {@link https://github.com/sequelize/sequelize/issues/12575}
     ** @ts-ignore ~!*/
    public static findAll<M extends SequelizeModel>(
        this: ModelStatic<M>,
        options?: FindOptions<M['_attributes']> & {raw?: false}
    ): Promise<M[]>;

    /**
     ** @override
     ** @see {@link https://github.com/sequelize/sequelize/issues/12575}
     ** @ts-ignore ~!*/
    public static findAll<M extends SequelizeModel, R extends any = M['_attributes']>(
        this: ModelStatic<M>,
        options?: FindOptions<M['_attributes']> & {raw: true}
    ): Promise<R[]>;

    /**
     ** @override
     ** @see {@link https://github.com/sequelize/sequelize/issues/12575}
     ** @ts-ignore ~!*/
    public static findByPk<M extends SequelizeModel>(
        this: ModelStatic<M>,
        identifier: Identifier,
        options: Omit<NonNullFindOptions<M['_attributes']>, 'where'> & {raw?: false}
    ): Promise<M>;

    /**
     ** @override
     ** @see {@link https://github.com/sequelize/sequelize/issues/12575}
     ** @ts-ignore ~!*/
    public static findByPk<M extends SequelizeModel, R extends any = M['_attributes']>(
        this: ModelStatic<M>,
        identifier: Identifier,
        options: Omit<NonNullFindOptions<M['_attributes']>, 'where'> & {raw: true}
    ): Promise<R>;

    /**
     ** @override
     ** @see {@link https://github.com/sequelize/sequelize/issues/12575}
     ** @ts-ignore ~!*/
    public static findByPk<M extends SequelizeModel>(
        this: ModelStatic<M>,
        identifier: Identifier,
        options?: Omit<FindOptions<M['_attributes']>, 'where'> & {raw?: false}
    ): Promise<M | null>;

    /**
     ** @override
     ** @see {@link https://github.com/sequelize/sequelize/issues/12575}
     ** @ts-ignore ~!*/
    public static findByPk<M extends SequelizeModel, R extends any = M['_attributes']>(
        this: ModelStatic<M>,
        identifier: Identifier,
        options?: Omit<FindOptions<M['_attributes']>, 'where'> & {raw: true}
    ): Promise<R | null>;

    /**
     ** @override
     ** @see {@link https://github.com/sequelize/sequelize/issues/12575}
     ** @ts-ignore ~!*/
    public static findOne<M extends SequelizeModel>(
        this: ModelStatic<M>,
        options: NonNullFindOptions<M['_attributes']> & {raw?: false}
    ): Promise<M>;

    /**
     ** @override
     ** @see {@link https://github.com/sequelize/sequelize/issues/12575}
     ** @ts-ignore ~!*/
    public static findOne<M extends SequelizeModel, R extends any = M['_attributes']>(
        this: ModelStatic<M>,
        options: NonNullFindOptions<M['_attributes']> & {raw: true}
    ): Promise<R>;

    /**
     ** @override
     ** @see {@link https://github.com/sequelize/sequelize/issues/12575}
     ** @ts-ignore ~!*/
    public static findOne<M extends SequelizeModel>(
        this: ModelStatic<M>,
        options?: FindOptions<M['_attributes']> & {raw?: false}
    ): Promise<M | null>;

    /**
     ** @override
     ** @see {@link https://github.com/sequelize/sequelize/issues/12575}
     ** @ts-ignore ~!*/
    public static findOne<M extends SequelizeModel, R extends any = M['_attributes']>(
        this: ModelStatic<M>,
        options?: FindOptions<M['_attributes']> & {raw: true}
    ): Promise<R | null>;

    /**
     ** @override
     ** @see {@link https://github.com/sequelize/sequelize/issues/12575}
     ** @ts-ignore ~!*/
    public static findAndCountAll<M extends SequelizeModel>(
        this: ModelStatic<M>,
        options?: FindAndCountOptions<M['_attributes']> & {raw?: false}
    ): Promise<{
        count: number;
        rows: M[];
    }>;

    /**
     ** @override
     ** @see {@link https://github.com/sequelize/sequelize/issues/12575}
     ** @ts-ignore ~!*/
    public static findAndCountAll<M extends SequelizeModel, R extends any = M['_attributes']>(
        this: ModelStatic<M>,
        options?: FindAndCountOptions<M['_attributes']> & {raw: true}
    ): Promise<{
        count: number;
        rows: R[];
    }>;

    /**
     ** @override
     ** @see {@link https://github.com/sequelize/sequelize/issues/12575}
     ** @ts-ignore ~!*/
    public update<M extends SequelizeRawModel<TModelAttributes, TCreationAttributes>, R extends {} = M['_attributes']>(
        values: {
            [key in keyof R]?: R[key] | Fn | Col | Literal;
        },
        options?: UpdateOptions<M['_attributes']> & Partial<IModelOptions>
    ): Promise<this>;

}

export declare type RawModelDefined<
    TModelAttributes extends {} = any,
    TCreationAttributes extends {} = TModelAttributes
> = ModelCreator<SequelizeRawModel<TModelAttributes, TCreationAttributes>>;
