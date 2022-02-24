'use strict';

const {ROLE: {MANAGER, OPERATOR, MEMBER}} = require('../app/constants');

/**
 ** @extends {import('koa-roles')} - Typescript Definition.
 ** - Read {Egg-User-Role && Koa-Roles} for documents.
 **/
require('../node_modules/koa-roles'); // Javascript Source Code
/* eslint-disable-next-line no-unused-vars */
const {userrole: {failureHandler}} = require('egg-userrole/config/config.default');

/**
 ** @param {IApplication} app - Egg Application
 **/
module.exports = function (app) {
  app.role.use('manager&operator', (ctx) => {
    return [MANAGER, OPERATOR].includes(ctx.user.role.name);
  });
  app.role.use('manager', (ctx) => {
    return ctx.user.role.name === MANAGER;
  });
  app.role.use('operator', (ctx) => {
    return ctx.user.role.name === OPERATOR;
  });
  app.role.use('member', (ctx) => {
    return ctx.user.role.name === MEMBER;
  });

  /**
   ** @type {failureHandler} - Override built-in Egg-User Role error handler.
   ** @override {failureHandler} - @Override failure handler.
   ** @param {IContext} ctx
   ** @param action
   **/
  app.role.failureHandler = function (ctx, action) {
    ctx.helper.Console.trace(`> Require role: ${action}`);
    ctx.print = {
      errorCode: 403,
      msg: 'Access denied',
    };
  };
};
