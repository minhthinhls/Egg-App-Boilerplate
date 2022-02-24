'use strict';

/**
 ** @param {IApplication} app - Egg Application
 **/
module.exports = (app) => {
    const {router, controller, middleware} = app;
    const userRequired = middleware.userRequired();

    /** Log Transfer */
    router.get('/api/transfer/log', userRequired, controller.transfer.log.index);
};
