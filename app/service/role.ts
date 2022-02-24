'use strict';

import {BaseService} from "@/extend/class";

/** Import Models Attributes Defined Types !*/
import type {IAttributes, ICreationAttributes} from "@/model/role";

export default class RoleService extends BaseService<IAttributes, ICreationAttributes> {

    /**
     ** @constructor
     ** @param {IContext} ctx
     **/
    constructor(ctx: BaseService["ctx"]) {
        super(ctx);
        this.model = ctx.model.Role;
    }

    async findRoleByName(name: string) {
        const {ctx} = this;
        return ctx.model.Role.findOne({
            where: {name},
            raw: true,
        });
    }
}

/** For ES5 Default Import Statement !*/
module.exports.default = RoleService;
