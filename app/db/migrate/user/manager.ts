/** Import Application Placeholder from Egg:Modules !*/
import "egg";

/** Import Application Interface as Typings from Pre-Defined Types Helper !*/
import type {IApplication} from "@/extend/types";

/**
 ** @param {IApplication} app
 ** @returns {Promise<void>}
 **/
export const middlewareFn = async (app: IApplication): Promise<void> => {
    const roleManager = await app.model.Role.findOne({
        where: {name: 'MANAGER'},
        rejectOnEmpty: true,
    });
    const level = await app.model.User.Level.findOne({
        where: {name: 'Sắt'},
        rejectOnEmpty: true,
    });

    await app.model.User.upsert({
        username: 'manager',
        roleId: roleManager.id,
        levelId: level.id,
        password: '19f96a7bd60a6493ebb1ff8e832ad85e', // 1111qqqq@Q
        password2: '19f96a7bd60a6493ebb1ff8e832ad85e', // 1111qqqq@Q
        token: Buffer.from(`manager:1111qqqq@Q`).toString('base64'),
        fullName: "Manager",
        email: 'cskh@kdo88.net',
        phoneNumber: '099999999',
        referralCode: 'MANAGER',
        dateOfBirth: '1999-09-09',
        emailVerified: true,
    });

    /** Insert Credit Info */
    const userRow = await app.model.User.findOne({
        where: {username: 'manager'},
        rejectOnEmpty: true,
    });
    const creditInfo = {
        uid: userRow.id,
        balance: 0,
        freeze: 0,
        debt: 0,
    };

    await app.model.Credit.upsert(creditInfo);
};

/** For ES6 Default Import Statement !*/
export default middlewareFn;

/** For ES5 Default Import Statement !*/
module.exports = middlewareFn;
