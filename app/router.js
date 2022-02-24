"use strict";

/** Import ES6 Default Core Dependencies !*/
const path = require('path');

/**
 ** @param {IApplication} app - Egg Application
 ** @description - DO NOT USE ASYNC FUNCTION ON THIS LOADER.
 **/
module.exports = (app) => {
    const {router, controller, middleware} = app;
    const userRequired = middleware.userRequired();

    /** Roles !*/
    // const roleOperator = app.role.can('operator');
    // const roleManager = app.role.can('manager');

    /* ====================== HTTPS ====================== */

    /**
     ** @description - All error thrown by downstream middlewares via registered Router Actions will be caught here.
     ** @see {@link https://github.com/koajs/koa/wiki/Error-Handling} - Legacy Koa JavaScript Github.
     ** @see {@link https://github.com/koajs/koa/blob/master/docs/error-handling.md} - Legacy Koa JavaScript Github.
     ** @see {@link https://stackoverflow.com/questions/49228366/koa2-error-handling} - Stack Overflow && Github Solutions.
     **/
    app.use(async (ctx, next) => {
        try {
            await next();
        } catch (error) {
            /** If you've already set the Response Context then skip !*/
            if (ctx.print) {
                return void 0;
            }
            /** Failed at Parameters Validation !*/
            if (error.message === "Validation Failed") {
                return ctx.print = {
                    errorCode: error.statusCode,
                    msg: error.message,
                };
            }
            /** Only Logging [Non User Level] & [Other] Errors except [Failed Validation] !*/
            if (!(error instanceof VisibleError)) {
                /** Use either Koa Built-in Logger [ctx.app.emit -> boolean] or Egg Logger Plugin [ctx.logger.error -> void] !*/
                ctx.logger.error(error) && ctx.app.emit('error', error, ctx);
            }
            ctx.print = {
                errorCode: error.statusCode || 400,
                msg: error.message,
                errorMsg: error,
            };
        } finally {
            /**
             ** @take-note At the end of every request. Make sure to call Passport Logout Mechanism.
             ** @advantage Prevent memory leak, since all User Context will be flushed at the end of HTTP Response.
             ** @description Since Passport Session and Browser Cookie has already been deprecated. Replaced by JWT Token for Authorization.
             **/
            await ctx.logout();
        }
    });

    /** Add Extra Middlewares Layer !*/
    require('./middleware')(app);

    /** User Defined Routers ~!*/
    new app.loader.FileLoader({
        directory: path.join(app.baseDir, 'app/router'),
        target: router,
        /**
         ** - Use inject property as the 1st argument when loading file as function.
         ** @example
         ** @file app/router/user.(js|ts);
         ** > module.exports = (app: IApplication) => {...}
         ** ~!*/
        inject: app,
        /** Enable [[override]] flag so that EggLoader.load() can override collision properties ~!*/
        override: true,
    }).load();

    /** Common routers, public interfaces **/
    router.get('/', controller.common.index);
    router.get('/api/captcha', controller.common.captcha);
    router.get('/api/panel', userRequired, controller.common.getPanelData);

    /** Language routers !*/
    router.get('/api/locales/:lng/:ns', controller.language.getLanguage);

    /** System routers !*/
    router.get('/api/system/info', userRequired, controller.system.index);

    /* ====================== SOCKET EVENTS ====================== */
    /* Socket routes */
    app.io.route('chat', app.io.controller.chat.chat);
    app.io.route('disconnect', app.io.controller.chat.disconnect);
};
