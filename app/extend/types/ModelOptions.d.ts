/* eslint-disable-next-line no-unused-vars */
import type {CreateOptions, InstanceUpdateOptions} from "sequelize/types/lib/model";
/* eslint-disable-next-line no-unused-vars */
import type {IAttributes as IRequestAttributes} from "@/model/request";
/* eslint-disable-next-line no-unused-vars */
import type {ModelHooks, HookReturn} from "sequelize/types/lib/hooks";
/* eslint-disable-next-line no-unused-vars */
import type {Model, ModelOptions} from "sequelize/types";
/* eslint-disable-next-line no-unused-vars */
import type {SequelizeRawModel} from "@/extend/class/abstract";
/* eslint-disable-next-line no-unused-vars */
import type {IBaseAttributes} from "@/extend/class";
/* eslint-disable-next-line no-unused-vars */
import type {IContext} from "@/extend/types";
/** Import Models Attributes Defined Types !*/
import type {IAttributes as IUserAttributes} from "@/model/user";
/** Import ES6 Custom [Utils && Helper] Dependencies !*/
import type {RecursivePartial, /*Primitives*/} from "@/extend/helper";

export declare interface IHookOptions {
    /** Context Injection for Extra Usage inside Sequelize Hook Record !*/
    ctx: IContext;
    /** Will soon be deprecated since ``${ctx}`` has been updated to Custom Hook Options !*/
    user: RecursivePartial<IUserAttributes & IBaseAttributes>;
    /** For logging Credit Change && Request Action behind the Scene !*/
    credit: Partial<{
        change: number;
        action: IRequestAttributes["type"] | "AGENT_COMMISSION" | "REFUND_COMMISSION" | `PROMOTION_${string}` | 'TOP_UP_BALANCE_MANUAL' | 'SUBTRACT_BALANCE_MANUAL';
    }>;
    /** For injecting User Request into Sequelize Hook !*/
    request: IRequestAttributes;
    /** For Logging Purpose when Creating [History || Log] as Sequelize Record !*/
    message: string;
}

export declare interface IContextOptions extends Partial<IHookOptions> {
    /** @interface IContextOptions - Make all attributes of IHookOptions become Optional !*/
}

declare interface IModelHooks<M extends Model = SequelizeRawModel, TAttributes extends M["_attributes"] = M["_attributes"]> extends ModelHooks<M, TAttributes> {
    /**
     ** @override
     ** Used this as SQL Model Hook, will run immediately after an instance created within SQL Table
     **/
    afterCreate(attributes: M & TAttributes & IBaseAttributes, options: CreateOptions<TAttributes & IBaseAttributes> & IContextOptions): HookReturn;

    /**
     ** @override
     ** Used this as SQL Model Hook, will run immediately after an instance updated within SQL Table
     **/
    afterUpdate(instance: M & TAttributes & IBaseAttributes, options: InstanceUpdateOptions<TAttributes & IBaseAttributes> & IContextOptions): HookReturn;
}

export declare interface IModelOptions<M extends Model = SequelizeRawModel> extends ModelOptions<M>, IContextOptions {
    hooks?: Partial<IModelHooks<M, M["_attributes"]>>;
}
