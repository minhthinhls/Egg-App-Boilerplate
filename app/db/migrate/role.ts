/** Import Application Placeholder from Egg:Modules !*/
import "egg";

/** Import Application Interface as Typings from Pre-Defined Types Helper !*/
import type {IApplication} from "@/extend/types";

/** Import ENUMS & CONSTANTS !*/
import {ROLE_ENUM} from "@/constants";

/**
 ** @param {IApplication} app
 ** @returns {Promise<void>}
 **/
export const middlewareFn = async (app: IApplication): Promise<void> => {
    const roleList = [
        {name: ROLE_ENUM.MANAGER},
        {name: ROLE_ENUM.OPERATOR},
        {name: ROLE_ENUM.MEMBER},
    ];
    await Promise.all([
        ...roleList.map((role) => {
            return app.model.Role.upsert(role);
        }),
    ]);
};

/** For ES6 Default Import Statement !*/
export default middlewareFn;

/** For ES5 Default Import Statement !*/
module.exports = middlewareFn;
