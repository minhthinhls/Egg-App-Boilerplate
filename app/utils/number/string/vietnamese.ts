export const NUMBER = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

/**
 ** @see {@link https://timoday.edu.vn/chuyen-so-thanh-chuoi-bang-c/}
 ** @param {string | number} num
 ** @param {string} [unit]
 ** @returns {string}
 **/
export const parse = (num: number, unit: string = ""): string => {
    if (num < 0) {
        throw new EvalError("Number cannot be less than zero =>");
    }
    if (num === 0) {
        return ' ' + NUMBER[0];
    }
    /** Modulus factor of number by 1 billion for each loop !*/
    let mod = 0;
    let str = "";
    let postfix = "";

    while (num > 0) {
        /** Lấy phần dư sau số hàng tỷ !*/
        mod = num % 1_000_000_000;
        /** Lấy số hàng tỷ !*/
        num = Math.floor(num / 1_000_000_000);
        if (num <= 0) {
            break;
        }
        str = million(mod, true) + postfix + str;
        /** Only insert postfix "Billion" when starting from the 2nd iteration !*/
        postfix = " tỷ";
    }

    /** Most significant digits lays before billion postfix !*/
    return million(mod, false).substring(1) + postfix + str + unit;
};

/**
 ** @see {@link https://timoday.edu.vn/chuyen-so-thanh-chuoi-bang-c/}
 ** @param {string | number} num
 ** @param {boolean} full
 ** @returns {string}
 **/
const million = (num: number, full: boolean): string => {
    let str = "";
    /** Lấy số hàng triệu !*/
    const million = Math.floor(num / 1_000_000);
    /** Lấy phần dư sau số hàng triệu !*/
    num = num % 1_000_000;
    if (million > 0) {
        str = hundred(million, full) + " triệu";
        full = true;
    }
    /** Lấy số hàng nghìn !*/
    const thousand = Math.floor(num / 1_000);
    /** Lấy phần dư sau số hàng nghìn !*/
    num = num % 1_000;
    if (thousand > 0) {
        str += hundred(thousand, full) + " nghìn";
        full = true;
    }
    /** Số hàng trăm !*/
    if (num > 0) {
        str += hundred(num, full);
    }
    return str;
};

/**
 ** @see {@link https://timoday.edu.vn/chuyen-so-thanh-chuoi-bang-c/}
 ** @param {string | number} num
 ** @param {boolean} full
 ** @returns {string}
 **/
const hundred = (num: number, full: boolean): string => {
    /** Lấy số hàng trăm !*/
    const hundred = Math.floor(num / 100);
    /** Lấy phần dư sau số hàng trăm !*/
    num = num % 100;
    if (full || hundred > 0) {
        return " " + NUMBER[hundred] + " trăm" + decimal(num, true);
    }
    return decimal(num, false);
};

/**
 ** @see {@link https://timoday.edu.vn/chuyen-so-thanh-chuoi-bang-c/}
 ** @param {string | number} num
 ** @param {boolean} full
 ** @returns {string}
 **/
const decimal = (num: number, full: boolean): string => {
    let str = "";
    const decimal = Math.floor(num / 10);
    const unit = num % 10;
    /** Hai mươi [2x] -> Chín mươi [9x] !*/
    if (decimal > 1) {
        str = " " + NUMBER[decimal] + " mươi";
        /** Hai mươi mốt [21], [31], [41], ... -> Chín mươi mốt [91] !*/
        if (unit === 1) {
            str += " mốt";
        }
    } else if (decimal === 1) {
        /** Mười hai [12] -> Mười chín [19] !*/
        str = " mười";
        /** Mười một [11] !*/
        if (unit === 1) {
            str += " một";
        }
    } else if (full && unit > 0) {
        /** Nếu hàng đơn vị khác 0 và có các số hàng trăm, ví dụ 101.
         ** Thì biến [full == true] => Vậy sẽ đọc một trăm lẻ một !*/
        str = " lẻ";
    }
    if (unit === 5 && decimal >= 1) {
        /** [Một, Hai, Ba, ..., Chín] trăm [mười, hai mươi, ba mươi, ..., chín mươi] lăm
         ** [115, 125, 135, ..., 195] && [115, 225, 335, ..., 995] !*/
        str += " lăm";
    } else if (unit > 1 || (unit === 1 && decimal === 0)) {
        str += " " + NUMBER[unit];
    }
    return str;
};
