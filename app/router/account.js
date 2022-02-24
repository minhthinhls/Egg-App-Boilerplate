'use strict';

/**
 ** @param {IApplication} app - Egg Application
 **/
module.exports = (app) => {
    const {router, controller, middleware} = app;
    const userRequired = middleware.userRequired();

    /** Roles !*/
    const isAdmin = app.role.can('manager&operator');

    router.get('/api/account', userRequired, controller.account.index);
    router.post('/api/account', userRequired, isAdmin, controller.account.updateStatus);

    router.get('/api/account/summary', userRequired, controller.account.summary);
    router.get('/api/account/status', userRequired, controller.account.getByStatus);
    router.get('/api/account/history', userRequired, controller.account.getHistory);

};
