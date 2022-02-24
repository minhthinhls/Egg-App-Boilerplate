'use strict';

/**
 ** @param {IApplication} app - Egg Application
 **/
module.exports = (app) => {
    const {router, controller, middleware} = app;
    const userRequired = middleware.userRequired();

    /** Roles !*/
    const canWrite = app.role.can('manager&operator');

    router.get('/api/price', userRequired, controller.price.index);
    router.put('/api/price', userRequired, canWrite, controller.price.create);
    router.post('/api/price', userRequired, canWrite, controller.price.update);

};
