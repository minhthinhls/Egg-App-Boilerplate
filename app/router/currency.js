'use strict';

/**
 ** @param {IApplication} app - Egg Application
 **/
module.exports = (app) => {
    const {router, controller, middleware} = app;
    const userRequired = middleware.userRequired();

    /** Roles !*/
    const canWrite = app.role.can('manager&operator');

    router.get('/api/currency', userRequired, controller.currency.index);
    router.put('/api/currency', userRequired, canWrite, controller.currency.create);
    router.post('/api/currency', userRequired, canWrite, controller.currency.update);
};
