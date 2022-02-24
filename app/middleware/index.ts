/** Import Application Placeholder from Egg:Modules !*/
import "egg";

/** Import Application Interface as Typings from Pre-Defined Types Helper !*/
import type {IApplication, IContext} from "@/extend/types";

/** - Loading Extra Middlewares Layers into Main Egg Application !*/
export const __LoadExtraMiddlewares__ = (app: IApplication): void => {
    /** Middlewares Loaded from ``${./app/middleware}`` to Egg Application !*/
    const {middleware} = app;

    /** Second Middleware Layer to load User Instance into Request Context !*/
    app.use<{}, IContext>(middleware.passportHook());

    /** Third Middleware Layer to check whether user got kicked out by another session !*/
    // app.use<{}, IContext>(middleware.sessionReducer());

    /** Fourth Middleware Layer to merge Context Request Query && Queries into Parameters !*/
    app.use<{}, IContext>(middleware.parameterReducer());

    /** Fifth Middleware Layer to check for Attacking of Query Parameters Pollution !*/
    // app.use<{}, IContext>(middleware.parameterGuarder());

    return void 0;
};

/** For ES6 Default Import Statement !*/
export default __LoadExtraMiddlewares__;

/** For ES5 Default Import Statement !*/
module.exports = __LoadExtraMiddlewares__;
