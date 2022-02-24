'use strict';

/**
 ** @param {IApplication} app - Egg Application
 **/
module.exports = (app) => {
    const {router, controller, middleware} = app;
    const userRequired = middleware.userRequired();

    /** Roles !*/
    const canWrite = app.role.can('manager&operator');

    router.get('/api/product', userRequired, controller.product.index);
    router.put('/api/product', userRequired, canWrite, controller.product.create);
    router.post('/api/product', userRequired, canWrite, controller.product.update);
};
