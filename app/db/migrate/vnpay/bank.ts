/** Import Application Placeholder from Egg:Modules !*/
import "egg";

/** Import Application Interface as Typings from Pre-Defined Types Helper !*/
import type {IApplication} from "@/extend/types";

/**
 ** @param {IApplication} app
 ** @returns {Promise<void>}
 **/
export const middlewareFn = async (app: IApplication): Promise<void> => {
    const listBank = [
        {bankId: 115, name: 'Techcombank', shortName: 'TCB'},
        {bankId: 116, name: 'Sacombank', shortName: 'SACOM'},
        {bankId: 117, name: 'Vietcombank', shortName: 'VCB'},
        {bankId: 118, name: 'Asia Commercial Bank ACB', shortName: 'ACB'},
        {bankId: 119, name: 'DongA Bank', shortName: 'DAB'},
        {bankId: 120, name: 'Vietin Bank', shortName: 'VTB'},
        {bankId: 121, name: 'BIDV', shortName: 'BIDV'},
        {bankId: 122, name: 'Eximbank Vietnam', shortName: 'EXIM'},
        {bankId: 123, name: 'Bank Central Asia', shortName: 'BCA'},
        {bankId: 124, name: 'Bank Negara Indonesia', shortName: 'BNI'},
        {bankId: 125, name: 'Bank Rakyat Indonesia BRI', shortName: 'BNI'},
        {bankId: 126, name: 'Mandiri Bank MDR', shortName: 'MDR'},
        {bankId: 127, name: 'CIMB Niaga CIMBN', shortName: 'CIMBN'},
        {bankId: 128, name: 'VP Bank', shortName: 'VP'},
        {bankId: 129, name: 'Military Commercial Joint Stock Bank', shortName: 'MB'},
        {bankId: 130, name: 'Tien Phong Commercial', shortName: 'TPB'},
        {bankId: 131, name: 'Agribank', shortName: 'AGRI'},
        {bankId: 132, name: 'Lien Viet Post Joint Stock Commercial Bank', shortName: 'LienVietPostBank'},
        {bankId: 133, name: 'Saigon – Hanoi Commercial Joint Stock Bank', shortName: 'SHB'},
        {bankId: 134, name: 'Vietnam Public Joint-stock Commercial Bank', shortName: 'PVcombank'},
        {bankId: 135, name: 'SAIGON BANK SAIGON BANK', shortName: 'SAIGON BANK SAIGON BANK'},
        {bankId: 136, name: 'Southeast Asia Commercial Joint Stock Bank', shortName: 'SeABank'},
        {bankId: 137, name: 'An Binh Commercial Join Stock Bank', shortName: 'ABBank'},
        {bankId: 138, name: 'Bac A Bank', shortName: 'BACABANK'},
        {bankId: 139, name: 'Viet Capital Bank', shortName: 'Viet Capital Bank'},
        {bankId: 140, name: 'Vietnam Maritime Commercial Joint Stock Bank', shortName: 'MSB'},
        {bankId: 141, name: 'Kien Long Commercial Joint Stock Bank', shortName: 'KienLongBank'},
        {bankId: 142, name: 'Nam A Commercial Joint Stock Bank', shortName: 'NAMABANK'},
        {bankId: 143, name: 'National Citizen Commercial Joint Stock Bank', shortName: 'NCB'},
        {bankId: 144, name: 'HD Bank HDBank', shortName: 'HD Bank HDBank'},
        {bankId: 145, name: 'Orient Commercial Joint Stock Bank', shortName: 'OCB'},
        {bankId: 146, name: 'Vietnam International Commercial Joint Stock Bank', shortName: 'VIB'},
        {bankId: 147, name: 'Sai Gon Joint Stock Commercial Bank', shortName: 'SCB'},
        {bankId: 148, name: 'Saigon Bank for Industry and Trade', shortName: 'SGB'},
        {bankId: 149, name: 'VietABank', shortName: 'VAB'},
        {bankId: 150, name: 'BAOVIET Bank', shortName: 'BAOVIET Bank'},
        {bankId: 151, name: 'Vietnam Thuong Tin Commercial Joint Stock Bank', shortName: 'VietBank'},
        {bankId: 152, name: 'Petrolimex Group Commercial Joint Stock Bank', shortName: 'PGBank'},
        {bankId: 157, name: 'Ocean Bank', shortName: 'OCEANBANK'},
        {bankId: 158, name: 'GP Bank', shortName: 'GPBANK'},
    ];

    await Promise.all([
        ...listBank.map((bank) => {
            return app.model.Vnpay.Bank.upsert(bank);
        }),
    ]);
};

/** For ES6 Default Import Statement !*/
export default middlewareFn;

/** For ES5 Default Import Statement !*/
module.exports = middlewareFn;
