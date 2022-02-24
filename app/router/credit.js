'use strict';

/**
 ** @param {IApplication} app - Egg Application
 **/
module.exports = (app) => {
    const {router, controller, middleware} = app;
    const userRequired = middleware.userRequired();

    /** Log Credit */
    router.get('/api/credit/log', userRequired, controller.credit.history.index);
};
