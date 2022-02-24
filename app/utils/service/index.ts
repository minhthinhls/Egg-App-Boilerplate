export * from ".";
/** Import Base Service Interface !*/
import type {BaseService} from "@/extend/class";

export declare type ServiceHandler<TArguments extends {[p: string]: any}, TBaseService extends BaseService> = (
    _this: TBaseService,
    args: TArguments,
) => Promise<void>;
