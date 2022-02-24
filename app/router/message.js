'use strict';

/**
 ** @param {IApplication} app - Egg Application
 **/
module.exports = (app) => {
    const {router, controller, middleware} = app;
    const userRequired = middleware.userRequired();
    /** Roles !*/
    const isAdmin = app.role.can('manager&operator');
    /** Get inner messages */
    router.get('/api/innerMessage', userRequired, controller.message.index);
    /** Create an inner message */
    router.post('/api/innerMessage', userRequired, isAdmin, controller.message.create);
    /** Mark as read an inner message */
    router.post('/api/innerMessage/:id/mark-as-read', userRequired, controller.message.markAsRead);
    /** Update an inner message */
    router.put('/api/innerMessage/:id', userRequired, isAdmin, controller.message.update);
    /** Delete an inner message */
    router.delete('/api/innerMessage/:id', userRequired, isAdmin, controller.message.deleteById);
};
