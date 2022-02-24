/**
 ** For Non-Capturing Regular Expression Groups -> Use the following Expression -> (?:<RegExp>)
 ** https://stackoverflow.com/questions/3512471/what-is-a-non-capturing-group-in-regular-expressions
 **/

/** @type {string}
 ** @example
 ** const regex = /`${pattern}`/;
 ** const stringRegex = `${pattern}`;
 ** @ts-ignore ~!*/
const validDecimalNumber = new RegExp(/(?:[1-9][0-9]*)/).toString().replace(/\//g, "");

/** @type {string}
 ** @example
 ** const regex = /`${pattern}`/;
 ** const stringRegex = `${pattern}`;
 ** @ts-ignore ~!*/
const validDoubleNumber = new RegExp(`(?:${validDecimalNumber}|(?:${validDecimalNumber}?[0-9][.][0-9]*[1-9]))`).toString().replace(/\//g, "");

/** @type {string}
 ** @example
 ** const regex = /`${pattern}`/;
 ** const stringRegex = `${pattern}`;
 ** @ts-ignore ~!*/
const validPassword = new RegExp(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/).toString().replace(/\//g, "");

/** @type {string}
 ** @example
 ** const regex = /`${pattern}`/;
 ** const stringRegex = `${pattern}`;
 ** @ts-ignore ~!*/
const validUsername = new RegExp(/^(?=.*[a-zA-Z])[a-zA-Z\d]{5,15}$/).toString().replace(/\//g, "");

/** @type {string}
 ** @example
 ** const regex = /`${pattern}`/;
 ** const stringRegex = `${pattern}`;
 ** @ts-ignore ~!*/
const validBankAccountNumber = new RegExp(/^[a-zA-Z\d]{5,25}$/).toString().replace(/\//g, "");

/** @type {string}
 ** @example
 ** const regex = /`${pattern}`/;
 ** const stringRegex = `${pattern}`;
 ** @ts-ignore ~!*/
const validBankAccountName = new RegExp(/^[A-Z\d ]{5,40}$/).toString().replace(/\//g, "");

/** @type {string}
 ** @example
 ** const regex = /`${pattern}`/;
 ** const stringRegex = `${pattern}`;
 ** @ts-ignore ~!*/
const validVirtualWalletId = new RegExp(/^[a-zA-Z\d]{5,100}$/).toString().replace(/\//g, "");

/** @type {string}
 ** @example
 ** const regex = /`${pattern}`/;
 ** const stringRegex = `${pattern}`;
 ** @ts-ignore ~!*/
const validTransferNote = new RegExp(/^[a-zA-Z\d ]{1,210}$/).toString().replace(/\//g, "");

/** @type {string}
 ** @example
 ** const regex = /`${pattern}`/;
 ** const stringRegex = `${pattern}`;
 ** @ts-ignore ~!*/
const validDepositNote = new RegExp(/^[a-zA-Z\d ]{6}$/).toString().replace(/\//g, "");

const RegExpUtils = {
    /** @type {function(flags=: string): InstanceType<RegExp>} ~!*/
    validDecimalNumber: (flags = "g") => {
        return new RegExp(`^[-]?${validDecimalNumber}$`, flags || 'g');
    },
    /** @type {function(flags=: string): InstanceType<RegExp>} ~!*/
    validDoubleNumber: (flags = "g") => {
        return new RegExp(`^[-]?${validDoubleNumber}$`, flags || 'g');
    },
    /** @type {function(flags=: string): InstanceType<RegExp>} ~!*/
    validPositiveDecimalNumber: (flags = "g") => {
        return new RegExp(`^${validDecimalNumber}$`, flags || 'g');
    },
    /** @type {function(flags=: string): InstanceType<RegExp>} ~!*/
    validPositiveDoubleNumber: (flags = "g") => {
        return new RegExp(`^${validDoubleNumber}$`, flags || 'g');
    },
    /** @type {function(flags=: string): InstanceType<RegExp>} ~!*/
    validPassword: function (flags = "g") {
        return new RegExp(`^${validPassword}$`, flags || 'g');
    },
    /** @type {function(flags=: string): InstanceType<RegExp>} ~!*/
    validUsername: function (flags = "g") {
        return new RegExp(`^${validUsername}$`, flags || 'g');
    },
    /** @type {function(flags=: string): InstanceType<RegExp>} ~!*/
    validBankAccountNumber: function (flags = "g") {
        return new RegExp(`^${validBankAccountNumber}$`, flags || 'g');
    },
    /** @type {function(flags=: string): InstanceType<RegExp>} ~!*/
    validBankAccountName: function (flags = "g") {
        return new RegExp(`^${validBankAccountName}$`, flags || 'g');
    },
    /** @type {function(flags=: string): InstanceType<RegExp>} ~!*/
    validVirtualWalletId: function (flags = "g") {
        return new RegExp(`^${validVirtualWalletId}$`, flags || 'g');
    },
    /** @type {function(flags=: string): InstanceType<RegExp>} ~!*/
    validTransferNote: function (flags = "g") {
        return new RegExp(`^${validTransferNote}$`, flags || 'g');
    },
    /** @type {function(flags=: string): InstanceType<RegExp>} ~!*/
    validDepositNote: function (flags = "g") {
        return new RegExp(`^${validDepositNote}$`, flags || 'g');
    }
};

export default RegExpUtils;
