/** Import Application Placeholder from Egg:Modules !*/
import "egg";

/** Import Application Interface as Typings from Pre-Defined Types Helper !*/
import type {IApplication} from "@/extend/types";

/**
 ** @param {IApplication} app
 ** @returns {Promise<void>}
 **/
export const middlewareFn = async (app: IApplication): Promise<void> => {
    const listLevel = [
        {name: 'Sắt', percentRefund: 0, cumulativeDeposit: 1},
        {name: 'Đồng', percentRefund: 0, cumulativeDeposit: 2},
        {name: 'Bạc', percentRefund: 0, cumulativeDeposit: 3},
        {name: 'Vàng', percentRefund: 0, cumulativeDeposit: 4},
        {name: 'Bạch Kim', percentRefund: 0, cumulativeDeposit: 5},
        {name: 'Kim Cương', percentRefund: 0, cumulativeDeposit: 6},
    ];
    await Promise.allSettled([
        ...listLevel.map((level) => {
            return app.model.User.Level.create(level);
        }),
    ]);
};

/** For ES6 Default Import Statement !*/
export default middlewareFn;

/** For ES5 Default Import Statement !*/
module.exports = middlewareFn;
