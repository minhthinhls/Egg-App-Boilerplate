'use strict';

/**
 ** @param {IApplication} app - Egg Application
 **/
module.exports = (app) => {
    const {router, controller, middleware} = app;
    const userRequired = middleware.userRequired();

    /** Roles !*/
    const canWrite = app.role.can('manager');

    router.get('/api/level', userRequired, controller.user.level.index);
    router.put('/api/level', userRequired, canWrite, controller.user.level.create);
    router.post('/api/level', userRequired, canWrite, controller.user.level.update);

};
