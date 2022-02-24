/** Import Egg-Modules as Typed Namespace !*/
import * as Egg from "egg";
/** Import Pre-Defined custom built Types from egg-ts-helper !*/
import "$/typings/app";
/** Import Pre-Defined custom built Types from egg-ts-helper !*/
import "$/typings/config/plugin";
/** Import Already Defined [Application && I/O Handlers] !*/
import "egg-socket.io";
/** Import Already Defined [Application && Context && EggAppConfig] !*/
import "egg-sequelize";
/** Import Already Defined [Application && Context && EggAppConfig] !*/
import "egg-mongoose";
/** Import Already Defined [Application && Context && EggAppConfig] !*/
import "egg-redis";
/** Import Already Defined [Application && Context && EggAppConfig] !*/
import "egg-cors";
/** Import Already Defined [Application Mock] for Unit Test !*/
import "egg-mock";

/** Import Models Attributes Defined Types !*/
import type {IAttributes as IUserAttributes} from "@/model/user";

/** Declare new Extended Egg Modules !*/
declare module "egg" {

    /** Extended Services !*/
    export interface IService {

    }

    /** Extended Models !*/
    export interface IModel {

    }

    /** Extended App !*/ // eslint-disable-next-line @typescript-eslint/naming-convention
    export interface Application {

    }

    /** Extended Context !*/ // eslint-disable-next-line @typescript-eslint/naming-convention
    export interface Context {
        isAuthenticated(): boolean;
        login<T extends IUserAttributes>(user: T): Promise<void>;
        login<T extends IUserAttributes, O extends {session: boolean} = {session: true}>(user: T, options: O): Promise<void>;
        logout(): void;
    }

    /** Extended your own Configs !*/ // eslint-disable-next-line @typescript-eslint/naming-convention
    export interface EggAppConfig {
        redirectURL: string;
    }

    /** Extended your own Passport Configs !*/ // eslint-disable-next-line @typescript-eslint/naming-convention
    export interface EggPassportCommonConfig {
        key: string;
        secret: string;
        redirectURL: string;
    }

    /** Extend Customize Environment !*/ // @ts-ignore
    export type EggEnvType = 'local' | 'unittest' | 'prod' | 'sit';
}

/** Export the whole Egg !*/
export default Egg;
