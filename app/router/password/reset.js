'use strict';

/**
 ** @param {IApplication} app - Egg Application
 **/
module.exports = (app) => {
    const {router, controller/*, middleware*/} = app;

    /** Roles !*/

    router.get('/api/forgot-password', function (/*ctx, next*/) {
        /** Be careful with <this> context. Do not use Arrow Function !*/
        return controller.user.password.reset.email.call(this);
    });

    /** TODO: This is for testing purpose only. Token should not be exposed via API except sending to Users Email !*/
    router.get('/api/reset-password', function (/*ctx, next*/) {
        return Promise.reject(new EvalError("This route is prohibited from usage"));
        /** Be careful with <this> context. Do not use Arrow Function !*/
        // return controller.user.password.reset.create.call(this);
    });

    /** All safety POST methods !*/
    router.post('/api/reset-password', controller.user.password.reset.exec);

};
