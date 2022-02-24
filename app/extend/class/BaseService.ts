/* eslint-disable-next-line no-unused-vars */
import {BaseContextClass} from "egg-core";
/* eslint-disable-next-line no-unused-vars */
import type {EggLogger} from "egg-logger";
/* eslint-disable-next-line no-unused-vars */
import type {PlainObject} from "@/extend/types";
/* eslint-disable-next-line no-unused-vars */
import type {RawModelDefined, SequelizeRawModel} from "@/extend/class/abstract";
/* eslint-disable-next-line no-unused-vars */
import type {IApplication, IContext, IEggAppConfig, IService} from "@/extend/types";
/** Customized Context Params for Sequelize Options !*/
import type {IContextOptions} from "@/extend/types";
/** Sequelize Basic QUERY Options [TRANSACTION & LOCKER] INTERFACES !*/
import type {Identifier, WhereOptions, FindOptions, NonNullFindOptions} from "sequelize/types";
/** Sequelize Basic R.E.S.T Options [TRANSACTION & LOCKER] INTERFACES !*/
import type {CreateOptions, UpdateOptions} from "sequelize/types";

/** Import Sequelize Basic Model Properties [DEFINED] INTERFACES !*/
import type {IBaseAttributes, IBaseCreationAttributes} from "@/extend/class";

/** Declare Sequelize Basic Response Model [ATTRIBUTES] INTERFACES !*/
declare type Nullable<V, T> = T extends (true | Error) ? V : (V | null);

/** Declare Class Constructor with [ATTRIBUTES] INTERFACES !*/
declare type ContextClassConstructor<Class extends object> = Class & {new(ctx: IContext): Class};

/** Declare Sequelize Basic Response Model [ATTRIBUTES] INTERFACES !*/
declare type SequelizeResponseModel</** Response Model Instance after SQL Execution Process !*/
    IAttributes extends PlainObject = {},
    ICreationAttributes extends PlainObject = IAttributes,
    TOptions extends Partial<{rejectOnEmpty: boolean | Error, raw: boolean}> = {rejectOnEmpty: false, raw: true},
    ISequelizeModel extends SequelizeModel<IAttributes, ICreationAttributes> = SequelizeModel<IAttributes, ICreationAttributes>,
    /** Default Reject-On-Nullable Type when ${options.rejectOnEmpty} got omitted will be [FALSE] !*/
    TNonNullableModel = (boolean | Error | undefined) extends TOptions['rejectOnEmpty'] ? false : TOptions['rejectOnEmpty'], // Merge Type
    /** Default Raw Type when ${options.raw} got omitted will be [TRUE] !*/
    TRawModelInstance = (boolean | undefined) extends TOptions['raw'] ? true : TOptions['raw'], // Merge Type
> = TRawModelInstance extends true
    ? Nullable<ISequelizeModel["_attributes"], TNonNullableModel>
    : Nullable<ISequelizeModel, TNonNullableModel>;

/** Declare Sequelize Basic Response Model [ATTRIBUTES] INTERFACES !*/
declare type SequelizeModel<IAttributes extends PlainObject = {}, ICreationAttributes extends PlainObject = IAttributes> =
    & SequelizeRawModel<IAttributes & IBaseAttributes, ICreationAttributes & IBaseCreationAttributes>
    & IAttributes
    & IBaseAttributes;

export default class BaseService<IAttributes extends PlainObject = {}, ICreationAttributes extends PlainObject = IAttributes, TAttributes extends PlainObject = {
    /** [[Interface Attributes Placeholder]] **/
}> extends BaseContextClass<IContext, IApplication, IEggAppConfig, IService> {

    /** Request Context !*/
    public readonly ctx: IContext;

    /** Application Instance !*/
    public readonly app: IApplication;

    /** Application Config Object !*/
    public readonly config: IEggAppConfig;

    /** Service Class !*/
    public readonly service: IService;

    /** Customized MySQL Sequelize Find Options !*/
    public readonly FindOptions: FindOptions<TAttributes>;

    /** For custom typing as placeholder. Do not access this shadow empty attributes !*/
    public readonly _attributes: IAttributes;

    /** For custom typing as placeholder. Do not access this shadow empty attributes !*/
    public readonly _creationAttributes: ICreationAttributes;

    /** For custom typing as placeholder. Do not access this shadow empty attributes !*/
    public readonly ModelCreator: RawModelDefined<IAttributes, ICreationAttributes>;

    /** For custom typing as placeholder. Do not access this shadow empty attributes !*/
    public readonly SequelizeModel: SequelizeRawModel<IAttributes, ICreationAttributes>;

    /** Insert Model Creator to this <b>[[_Place_Holder_]]</b> for turn-on basic Sequelize Function !*/
    protected model: RawModelDefined<IAttributes, ICreationAttributes>;

    /**
     ** - Default Constructor for Base Class Service.
     ** @param {IContext} ctx
     **/
    constructor(ctx: IContext) {
        super(ctx);
    }

    /**
     ** - FIND ONE BY USER ID <b>[TYPESCRIPT OVERLOADING]</b>.
     ** @param {string} uid
     ** @param {WhereOptions<IAttributes>} [extraQueries]
     ** @param {NonNullFindOptions<IAttributes>} [options]
     ** @returns {Promise<SequelizeModel<IAttributes, ICreationAttributes>>}
     **/
    async findOneByUid<TOptions extends Partial<{rejectOnEmpty: boolean | Error, raw: boolean}> = {rejectOnEmpty: false, raw: true}>(
        uid: string,
        extraQueries?: WhereOptions<Omit<IAttributes, 'uid'>>,
        options?: TOptions & Omit<NonNullFindOptions<IAttributes>, 'where' | 'rejectOnEmpty' | 'raw'>,
    ): Promise<SequelizeResponseModel<IAttributes, ICreationAttributes, TOptions>>;

    /**
     ** - FIND ONE BY IMPLICIT CONTEXT USER ID <b>[TYPESCRIPT OVERLOADING]</b>.
     ** @param {WhereOptions<IAttributes>} [queries]
     ** @param {NonNullFindOptions<IAttributes>} [options]
     ** @returns {Promise<SequelizeModel<IAttributes, ICreationAttributes>>}
     **/
    async findOneByUid<TOptions extends Partial<{rejectOnEmpty: boolean | Error, raw: boolean}> = {rejectOnEmpty: false, raw: true}>(
        queries?: WhereOptions<IAttributes>,
        options?: TOptions & Omit<NonNullFindOptions<IAttributes>, 'where' | 'rejectOnEmpty' | 'raw'>,
    ): Promise<SequelizeResponseModel<IAttributes, ICreationAttributes, TOptions>>;

    /**
     ** - FIND ONE BY USER ID IMPLEMENTATION.
     ** @param {string | (WhereOptions<IAttributes> & Partial<{uid: string}>)} [arg0]
     ** @param {WhereOptions<IAttributes>} [arg1]
     ** @param {NonNullFindOptions<IAttributes>} [options]
     ** @returns {Promise<SequelizeModel<IAttributes, ICreationAttributes>>}
     **/
    async findOneByUid<TOptions extends Partial<{rejectOnEmpty: boolean | Error, raw: boolean}> = {rejectOnEmpty: false, raw: true}>(
        arg0?: string | (WhereOptions<IAttributes> & Partial<{uid: string}>),
        arg1?: WhereOptions<Omit<IAttributes, 'uid'>> & (TOptions & Omit<NonNullFindOptions<IAttributes>, 'where' | 'rejectOnEmpty' | 'raw'>),
        options?: TOptions & Omit<NonNullFindOptions<IAttributes>, 'where' | 'rejectOnEmpty' | 'raw'>,
    ): Promise<SequelizeResponseModel<IAttributes, ICreationAttributes, TOptions>> {
        const {ctx} = this;
        /** Whether [uid] got omitted from 1st argument, it will be ${ctx.user.id} by default !*/
        if (typeof arg0 === "undefined") {
            return this.model.findOne({
                where: {
                    uid: ctx.user.id,
                },
                rejectOnEmpty: false,
                nest: true,
                raw: true,
            });
        }
        if (typeof arg0 === "string") {
            return this.model.findOne({
                where: {
                    uid: arg0 || ctx.user.id,
                    ...arg1,
                },
                rejectOnEmpty: false,
                nest: true,
                raw: true,
                ...options as TOptions,
            });
        }
        if (typeof arg0 === "object") {
            /** TODO: Be careful of this [arg0] instance, which may cause bug in the future !*/
            return this.model.findOne({
                where: {
                    uid: arg0.uid || ctx.user.id,
                    ...ctx.helper.omit({...arg0}, ['uid']),
                },
                rejectOnEmpty: false,
                nest: true,
                raw: true,
                ...arg1 as TOptions,
            });
        }
        throw new EvalError(">>> Unsupported Over-Loading Find-One Sequelize Methods !");
    }

    /**
     ** - FIND ONE IMPLEMENTATION.
     ** @param {WhereOptions<IAttributes>} [queries]
     ** @param {FindOptions<IAttributes>} [options]
     ** @returns {Promise<*>}
     **/
    async findOne<TOptions extends Partial<{rejectOnEmpty: boolean | Error, raw: boolean}> = {rejectOnEmpty: false, raw: true}>(
        queries?: WhereOptions<IAttributes>,
        options?: TOptions & Omit<NonNullFindOptions<IAttributes>, 'where' | 'rejectOnEmpty' | 'raw'>,
    ) {
        return this.findOneUseCallback(() => this.model.findOne<SequelizeModel<IAttributes, ICreationAttributes>>({
            where: {...queries},
            rejectOnEmpty: false,
            nest: true,
            raw: true,
            ...options,
        }), options as {
            /** Default Reject-On-Nullable Type when ${options.rejectOnEmpty} got omitted will be [FALSE] !*/
            rejectOnEmpty: (boolean | Error | undefined) extends TOptions['rejectOnEmpty'] ? false : TOptions['rejectOnEmpty']; // Merge Type
            /** Default Raw Type when ${options.raw} got omitted will be [TRUE] !*/
            raw: (boolean | undefined) extends TOptions['raw'] ? true : TOptions['raw']; // Merge Type
        });
    }

    /**
     ** - FIND ONE USE PRIMARY KEY IMPLEMENTATION.
     ** @param {Identifier} identifier
     ** @param {FindOptions<IAttributes>} [options]
     ** @returns {Promise<*>}
     **/
    async findByPk<TOptions extends Partial<{rejectOnEmpty: boolean | Error, raw: boolean}> = {rejectOnEmpty: false, raw: true}>(
        identifier: Identifier,
        options?: TOptions & Omit<NonNullFindOptions<IAttributes>, 'where' | 'rejectOnEmpty' | 'raw'>,
    ) {
        return this.findByPkUseCallback(() => this.model.findByPk<SequelizeModel<IAttributes, ICreationAttributes>>(identifier, {
            rejectOnEmpty: false,
            nest: true,
            raw: true,
            ...options,
        }), options as {
            /** Default Reject-On-Nullable Type when ${options.rejectOnEmpty} got omitted will be [FALSE] !*/
            rejectOnEmpty: (boolean | Error | undefined) extends TOptions['rejectOnEmpty'] ? false : TOptions['rejectOnEmpty']; // Merge Type
            /** Default Raw Type when ${options.raw} got omitted will be [TRUE] !*/
            raw: (boolean | undefined) extends TOptions['raw'] ? true : TOptions['raw']; // Merge Type
        });
    }

    /**
     ** - FIND ALL IMPLEMENTATION.
     ** @param {WhereOptions<IAttributes>} [queries]
     ** @param {FindOptions<IAttributes>} [options]
     ** @returns {Promise<*>}
     **/
    async findAll<TOptions extends Partial<{raw: boolean}> = {raw: true}>(
        queries?: WhereOptions<IAttributes>,
        options?: TOptions & Omit<FindOptions<IAttributes>, 'where'>,
    ) {
        return this.findAllUseCallback(() => this.model.findAll<SequelizeModel<IAttributes, ICreationAttributes>>({
            where: {...queries},
            nest: true,
            raw: true,
            ...options,
        }), options as {
            /** Default Raw Type when ${options.raw} got omitted will be [TRUE] !*/
            raw: (boolean | undefined) extends TOptions['raw'] ? true : TOptions['raw']; // Merge Type
        });
    }

    /**
     ** - FIND AND COUNT ALL IMPLEMENTATION.
     ** @param {WhereOptions<IAttributes>} [queries]
     ** @param {FindOptions<IAttributes>} [options]
     ** @returns {Promise<*>}
     **/
    async findAndCountAll<TOptions extends Partial<{raw: boolean}> = {raw: true}>(
        queries?: WhereOptions<IAttributes>,
        options?: TOptions & Omit<FindOptions<IAttributes>, 'where'>,
    ) {
        return this.findAndCountAllUseCallback(() => this.model.findAndCountAll<SequelizeModel<IAttributes, ICreationAttributes>>({
            where: {...queries},
            nest: true,
            raw: true,
            ...options
        }), options as {
            /** Default Raw Type when ${options.raw} got omitted will be [TRUE] !*/
            raw: (boolean | undefined) extends TOptions['raw'] ? true : TOptions['raw']; // Merge Type
        });
    }

    /**
     ** - MODEL CREATOR IMPLEMENTATION.
     ** @param {ICreationAttributes} record
     ** @param {CreateOptions<IAttributes>} [options]
     ** @returns {Promise<*>}
     **/
    async create<TOptions extends CreateOptions<IAttributes>>(
        record: ICreationAttributes,
        options?: TOptions & IContextOptions,
    ) {
        return this.model.create<SequelizeRawModel<IAttributes, ICreationAttributes>>(record, options);
    }

    /**
     ** - MODEL UPDATE IMPLEMENTATION.
     ** @param {Partial<Omit<IAttributes, 'id'>>} fields
     ** @param {WhereOptions<IAttributes>} queries
     ** @param {UpdateOptions<IAttributes>} [options]
     ** @returns {Promise<*>}
     **/
    async update<TOptions extends UpdateOptions<IAttributes>>(
        fields: Partial<Omit<IAttributes, 'id'>>,
        queries: WhereOptions<IAttributes>,
        options?: Omit<TOptions, 'where'> & IContextOptions,
    ) {
        return this.model.update(fields as IAttributes, {
            where: queries,
            ...options,
        });
    }

    /**
     ** @deprecated
     ** @protected
     ** @template T
     ** @param {BaseService} _this
     ** @param {string} propName
     ** @param {T} injectInstance
     ** @returns {T | void}
     **/
    protected static safePropertyInject<T extends any>(_this: BaseService, propName: string, injectInstance: T): T | void {
        if (_this[propName] !== null && _this[propName] !== undefined) {
            throw new ReferenceError("This property already existed, please consider either debugging or refactor property name!");
        }
        return (_this[propName] = injectInstance) || void 0;
    }

    /**
     ** @protected
     ** @param {BaseService} _this
     ** @param {string} propName
     ** @param {ContextClassConstructor<{}>} ServiceClass
     ** @returns {BaseService}
     **/
    protected static safeLazyPropertyInject<TBaseService extends Pick<BaseService, 'ctx'>>(
        _this: TBaseService,
        propName: string,
        ServiceClass: ContextClassConstructor<{}>,
    ): TBaseService {
        if (_this[propName] !== null && _this[propName] !== undefined) {
            throw new ReferenceError("This property already existed, please consider either debugging or refactor property name!");
        }

        return Object.defineProperty(_this, `${propName}`, {
            get() {
                const service = new ServiceClass(_this.ctx);

                Object.defineProperty(_this, `${propName}`, {
                    value: service,
                    writable: false,
                    configurable: false,
                });

                return service;
            },
            configurable: true,
            enumerable: true,
        });
    }

    /**
     ** @protected
     ** @param {BaseService} _this
     ** @param {string} propName
     ** @param {Record<string, ContextClassConstructor<{}>>} ServiceClasses
     ** @returns {Record<string, TBaseService> | void}
     **/
    protected static safeLazyNestedPropertyInject<TBaseService extends Pick<BaseService, 'ctx'>>(
        _this: TBaseService,
        propName: string,
        ServiceClasses: Record<string, ContextClassConstructor<{}>>,
    ): Record<string, TBaseService> | void {
        if (_this[propName] !== null && _this[propName] !== undefined) {
            throw new ReferenceError("This property already existed, please consider either debugging or refactor property name!");
        }

        const keys = Object.keys(ServiceClasses);
        const namespace = {};
        for (let i = 0; i < keys.length; i++) {
            const ServiceClass = ServiceClasses[keys[i]];
            Object.defineProperty(namespace, `${keys[i]}`, {
                get() {
                    const service = new ServiceClass(_this.ctx);

                    Object.defineProperty(namespace, `${keys[i]}`, {
                        value: service,
                        writable: false,
                        configurable: false,
                    });

                    return service;
                },
                configurable: true,
                enumerable: true,
            });
        }

        return _this[propName] = namespace;
    }

    /** - Use this function for resolving return type of calling Sequelize Model Query inside Base Services !
     ** - For options: {raw: true} || {raw?: false} will compiled correctly with Returned Instance Type !*/
    protected async findOneUseCallback<TOptions extends Partial<{rejectOnEmpty: boolean | Error, raw: boolean}>, R extends SequelizeRawModel<IAttributes, ICreationAttributes>>(
        callback: (options?: TOptions) => Promise<R | null>,
        options?: TOptions,
    ) {
        type Nullable<V> = TOptions['rejectOnEmpty'] extends true | Error ? V : (V | null);
        const record = await callback(options);
        return record as TOptions['raw'] extends true
            ? Nullable<R["_attributes"]>
            : Nullable<NonNullable<typeof record>>;
    }

    /** - Use this function for resolving return type of calling Sequelize Model Query inside Base Services !
     ** - For options: {raw: true} || {raw?: false} will compiled correctly with Returned Instance Type !*/
    protected async findByPkUseCallback<TOptions extends Partial<{rejectOnEmpty: boolean | Error, raw: boolean}>, R extends SequelizeRawModel<IAttributes, ICreationAttributes>>(
        callback: (options?: TOptions) => Promise<R | null>,
        options?: TOptions,
    ) {
        type Nullable<V> = TOptions['rejectOnEmpty'] extends true | Error ? V : (V | null);
        const record = await callback(options);
        return record as TOptions['raw'] extends true
            ? Nullable<R["_attributes"]>
            : Nullable<NonNullable<typeof record>>;
    }

    /** - Use this function for resolving return type of calling Sequelize Model Query inside Base Services !
     ** - For options: {raw: true} || {raw?: false} will compiled correctly with Returned Instance Type !*/
    protected async findAllUseCallback<TOptions extends Partial<{raw: boolean}>, R extends SequelizeRawModel<IAttributes, ICreationAttributes>>(
        callback: (options?: TOptions) => Promise<Array<R>>,
        options?: TOptions,
    ) {
        const records = await callback(options);
        return records as TOptions['raw'] extends true
            ? Array<R["_attributes"]>
            : typeof records;
    }

    /** - Use this function for resolving return type of calling Sequelize Model Query inside Base Services !
     ** - For options: {raw: true} || {raw?: false} will compiled correctly with Returned Instance Type !*/
    protected async findAndCountAllUseCallback<TOptions extends Partial<{raw: boolean}>, R extends SequelizeRawModel<IAttributes, ICreationAttributes>>(
        callback: (options?: TOptions) => Promise<{
            count: number;
            rows: Array<R>;
        }>,
        options?: TOptions,
    ) {
        const {count: numRecords, rows: records} = await callback(options);
        return ({
            count: numRecords,
            rows: records as TOptions['raw'] extends true
                ? Array<R["_attributes"]>
                : typeof records,
        });
    }

    /** Override Logger in Egg BaseContextClass !*/
    protected logger: EggLogger = {} as EggLogger;
}

/** For ES5 Default Import Statement !*/
module.exports.default = BaseService;
