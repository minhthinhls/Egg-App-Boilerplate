'use strict';

/**
 ** @param {IApplication} app - Egg Application
 **/
module.exports = (app) => {
    const {router, controller, middleware} = app;
    const userRequired = middleware.userRequired();
    const logoutHook = middleware.logoutHook();

    /** Roles !*/
    const isManager = app.role.can('manager');
    const isAdmin = app.role.can('manager&operator');
    const localStrategy = app.passport.authenticate('local', {
        successReturnToOrRedirect: false,
        successRedirect: false,
    });

    /** Authentication APIs !*/
    router.post('/api/passport/local', localStrategy);
    router.get('/api/logout', userRequired, controller.user.logout);
    router.get('/api/accessToken', controller.user.accessToken);
    /** Send verification email API!*/
    router.post('/api/user/send-verification-email', controller.user.emailVerification.sendEmail);
    router.get('/api/user/email-verification', controller.user.emailVerification.verify);
    /** Send otp to email API!*/
    router.post('/api/user/email/send-otp', userRequired, controller.user.emailVerification.sendOTP);
    router.get('/api/user/email/verify-otp', userRequired, controller.user.emailVerification.verifyOTP);

    /** User Base APIs !*/
    router.get('/api/user', userRequired, controller.user.getUser);
    router.get('/api/user/list', userRequired, controller.user.findAndCountAll);
    router.get('/api/user/credit', userRequired, controller.user.getCreditInfo);
    router.post('/api/user/update', userRequired, controller.user.updateUser);
    router.post('/api/user/password/update', userRequired, logoutHook, controller.user.updateUserPassword);
    router.post('/api/user/password2/update', userRequired, logoutHook, controller.user.updateUserPassword2);
    router.post('/api/user/withdrawal-password/update', userRequired, controller.user.updateUserWithdrawalPassword);
    router.post('/api/user/register', controller.user.registerLocalUser);
    router.post('/api/user/verify-referral-code', controller.user.verifyReferralCode);
    router.post('/api/user/verify-username', controller.user.verifyUsername);
    router.post('/api/user/verify-email', controller.user.verifyEmail);
    router.post('/api/user/verify-phone-number', controller.user.verifyPhoneNumber);
    router.get('/api/user/history', userRequired, isAdmin, controller.user.getHistory);
    router.get('/api/user/login-history', userRequired, isAdmin, controller.user.getLoginHistory);

    /** Bank-account !*/
    router.get('/api/user/bank-account', userRequired, controller.user.bankAccount.index);
    router.post('/api/user/bank-account', userRequired, controller.user.bankAccount.create);
    router.put('/api/user/bank-account', userRequired, controller.user.bankAccount.update);
    router.delete('/api/user/bank-account/:id', userRequired, controller.user.bankAccount.deleteById);

    /** Virtual-wallet !*/
    router.get('/api/user/virtual-wallet', userRequired, controller.user.virtualWallet.index);
    router.post('/api/user/virtual-wallet', userRequired, controller.user.virtualWallet.create);
    router.put('/api/user/virtual-wallet', userRequired, controller.user.virtualWallet.update);
    router.delete('/api/user/virtual-wallet/:id', userRequired, controller.user.virtualWallet.deleteById);

    /** For Manager */
    router.post('/api/user/operator', userRequired, isManager, controller.user.createOperator);
    router.post('/api/user/force-update/', userRequired, isAdmin, controller.user.forceUpdateUser);
    router.post('/api/user/balance/update', userRequired, isManager, controller.user.updateBalanceManual);
};
