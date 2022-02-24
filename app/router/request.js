'use strict';

/**
 ** @param {IApplication} app - Egg Application
 **/
module.exports = (app) => {
    const {router, controller, middleware} = app;
    const userRequired = middleware.userRequired();

    /** Roles !*/
    const isAdmin = app.role.can('manager&operator');
    const isMember = app.role.can('member');

    router.get('/api/request', userRequired, controller.request.index);
    router.put('/api/request', userRequired, controller.request.create);
    router.post('/api/request', userRequired, controller.request.update);

    router.get('/api/request/message', userRequired, controller.request.message.index);
    router.get('/api/request/history', userRequired, isAdmin, controller.request.getHistory);
    router.get('/api/request/count', userRequired, isAdmin, controller.request.getWaitingCount);
    router.get('/api/request/summary', userRequired, isMember, controller.request.getSummary);

};
