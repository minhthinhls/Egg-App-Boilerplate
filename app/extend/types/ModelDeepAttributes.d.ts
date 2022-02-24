// @ts-nocheck !*/

/** Import all Extended Static Sequelize Models !*/
import type {IModel} from "@/extend/types";
/* eslint-disable-next-line no-unused-vars */
import type {IndexSignatures} from "@/extend";
/* eslint-disable-next-line no-unused-vars */
import type {Traverse, TraverseDepthLv1, TraverseDepthLv2, TraverseDepthLv3} from "@/extend/types";
/* eslint-disable-next-line no-unused-vars */
import type {TraverseDepthLv4, TraverseDepthLv5, TraverseDepthLv6, TraverseDepthLv7} from "@/extend/types";

/** - Version 1: Currently support first nested level only !*/
export declare type IModelAttributes<ModelName extends keyof IModel> = InstanceType<IModel[ModelName]>["_attributes"];

/** - Version 2: Enable supporting deeply nested level !*/
export declare type IModelDeepAttributes</** - !*/
    K1 extends keyof IModel,
    K2 extends keyof IModel[K1] = unknown,
    K3 extends keyof IModel[K1][K2] = unknown,
    K4 extends keyof IModel[K1][K2][K3] = unknown,
    K5 extends keyof IModel[K1][K2][K3][K4] = unknown,
    K6 extends keyof IModel[K1][K2][K3][K4][K5] = unknown,
    K7 extends keyof IModel[K1][K2][K3][K4][K5][K6] = unknown,
> = K7 extends IndexSignatures ? InstanceType<Traverse<IModel, TraverseDepthLv7<IModel, K1, K2, K3, K4, K5, K6, K7>>>["_attributes"]
    : K6 extends IndexSignatures ? InstanceType<Traverse<IModel, TraverseDepthLv6<IModel, K1, K2, K3, K4, K5, K6>>>["_attributes"]
        : K5 extends IndexSignatures ? InstanceType<Traverse<IModel, TraverseDepthLv5<IModel, K1, K2, K3, K4, K5>>>["_attributes"]
            : K4 extends IndexSignatures ? InstanceType<Traverse<IModel, TraverseDepthLv4<IModel, K1, K2, K3, K4>>>["_attributes"]
                : K3 extends IndexSignatures ? InstanceType<Traverse<IModel, TraverseDepthLv3<IModel, K1, K2, K3>>>["_attributes"]
                    : K2 extends IndexSignatures ? InstanceType<Traverse<IModel, TraverseDepthLv2<IModel, K1, K2>>>["_attributes"]
                        : K1 extends IndexSignatures ? InstanceType<Traverse<IModel, TraverseDepthLv1<IModel, K1>>>["_attributes"]
                            : never;

/** - Version 2: Enable supporting deeply nested level !*/
export declare type IModelDeepSchemas</** - !*/
    K1 extends keyof IModel,
    K2 extends keyof IModel[K1] = unknown,
    K3 extends keyof IModel[K1][K2] = unknown,
    K4 extends keyof IModel[K1][K2][K3] = unknown,
    K5 extends keyof IModel[K1][K2][K3][K4] = unknown,
    K6 extends keyof IModel[K1][K2][K3][K4][K5] = unknown,
    K7 extends keyof IModel[K1][K2][K3][K4][K5][K6] = unknown,
> = K7 extends IndexSignatures ? Traverse<IModel, TraverseDepthLv7<IModel, K1, K2, K3, K4, K5, K6, K7>>
    : K6 extends IndexSignatures ? Traverse<IModel, TraverseDepthLv6<IModel, K1, K2, K3, K4, K5, K6>>
        : K5 extends IndexSignatures ? Traverse<IModel, TraverseDepthLv5<IModel, K1, K2, K3, K4, K5>>
            : K4 extends IndexSignatures ? Traverse<IModel, TraverseDepthLv4<IModel, K1, K2, K3, K4>>
                : K3 extends IndexSignatures ? Traverse<IModel, TraverseDepthLv3<IModel, K1, K2, K3>>
                    : K2 extends IndexSignatures ? Traverse<IModel, TraverseDepthLv2<IModel, K1, K2>>
                        : K1 extends IndexSignatures ? Traverse<IModel, TraverseDepthLv1<IModel, K1>>
                            : never;
