/** Import Application Placeholder from Egg:Modules !*/
import "egg";

/** Import Application Interface as Typings from Pre-Defined Types Helper !*/
import type {IApplication} from "@/extend/types";

/**
 ** @param {IApplication} app
 ** @returns {Promise<void>}
 **/
export const middlewareFn = async (app: IApplication): Promise<void> => {
    const listCurrency = [
        {name: 'VND', exchangeRate: 1},
        {name: 'USDT', exchangeRate: 23300},
    ];
    await Promise.allSettled([
        ...listCurrency.map((currency) => {
            return app.model.Currency.create(currency);
        }),
    ]);
};

/** For ES6 Default Import Statement !*/
export default middlewareFn;

/** For ES5 Default Import Statement !*/
module.exports = middlewareFn;
