/** Import Application Placeholder from Egg:Modules !*/
import "egg";

/** Import Application Interface as Typings from Pre-Defined Types Helper !*/
import type {IApplication} from "@/extend/types";

/**
 ** @param {IApplication} app
 ** @returns {Promise<void>}
 **/
export const middlewareFn = async (app: IApplication): Promise<void> => {
    /** Supported bankers */
    const bankerList = [
        {name: 'Viva88', shortName: 'V88', posterUrl: '/public/poster.png', website: 'http://', min: 0, max: 1000, bookType: 'SPORTSBOOK'},
        {name: 'Sbobet', shortName: 'SBO', posterUrl: '/public/poster.png', website: 'http://', min: 0, max: 1000, bookType: 'SPORTSBOOK'},
        {name: 'Fishbet', shortName: 'Fishbet', posterUrl: '/public/poster.png', website: 'http://', min: 0, max: 1000, bookType: 'SPORTSBOOK'},
        {name: '3in1bet', shortName: '3in', posterUrl: '/public/poster.png', website: 'http://', min: 0, max: 1000, bookType: 'SPORTSBOOK'},
        {name: 'wbet', shortName: 'WB', posterUrl: '/public/poster.png', website: 'http://', min: 0, max: 1000, bookType: 'SPORTSBOOK'},
        {name: 'p88bet', shortName: 'P88', posterUrl: '/public/poster.png', website: 'http://', min: 0, max: 1000, bookType: 'SPORTSBOOK'},

        {name: 'LVS', shortName: 'LVS', posterUrl: '/public/poster.png', website: 'http://', min: 0, max: 1000, bookType: 'CASINO'},
        {name: 'SGD777', shortName: 'SGD777', posterUrl: '/public/poster.png', website: 'http://', min: 0, max: 1000, bookType: 'CASINO'},

        {name: 'N789', shortName: 'n789', posterUrl: '/public/poster.png', website: 'http://', min: 0, max: 1000, bookType: 'LOTO'},
        {name: 'One789', shortName: 'one789', posterUrl: '/public/poster.png', website: 'http://', min: 0, max: 1000, bookType: 'LOTO'},
        {name: 'OK368', shortName: 'OK368', posterUrl: '/public/poster.png', website: 'http://', min: 0, max: 1000, bookType: 'LOTO'},
        {name: 'LDB88', shortName: 'LDB88', posterUrl: '/public/poster.png', website: 'http://', min: 0, max: 1000, bookType: 'LOTO'},
        {name: 'HK', shortName: 'hk', posterUrl: '/public/poster.png', website: 'http://', min: 0, max: 1000, bookType: 'LOTO'},

        {name: 'SV388', shortName: 'SV388', posterUrl: '/public/poster.png', website: 'http://', min: 0, max: 1000, bookType: 'COCKFIGHT'},
    ];

    await Promise.allSettled([
        ...bankerList.map((banker) => {
            return app.model.Banker.create(banker);
        }),
    ]);
};

/** For ES6 Default Import Statement !*/
export default middlewareFn;

/** For ES5 Default Import Statement !*/
module.exports = middlewareFn;
