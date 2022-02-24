/**!*****************************!*
 ** PUT THIS ON MAIN ENTRY FILES !
 ** WRITE RESOLVED PATH IN BOTH FILES
 ** [PACKAGE.JSON] AND [TSCONFIG.JSON]
 **!*****************************!*/
require("module-alias/register");

const {parsed: {NODE_ENV: NODE_ENVIRONMENT}} = require("$/dotenv.config");

/** Import ES6 Default Dependencies !*/
import {ensure} from "@/extend";

/**
 ** - This is used to print the data with log path to the specific line of codes !
 ** - Which is good for later delete after releasing to the production environment.
 ** @template T
 ** @param {T | Array<T>} [textLines]
 ** @param {number} [destinationLine]
 ** @param {boolean} [forceDisplay]
 ** @returns {void}
 **/
export const trace = <T extends Exclude<any, Array<any>>>(textLines?: T | Array<T>, destinationLine: number = 3, forceDisplay: boolean = false): void => {
    if (['PRODUCTION, PRODUCT, PROD'].includes(String(NODE_ENVIRONMENT).toUpperCase()) && !forceDisplay) {
        return; /** Return immediately if the log running on production mode !*/
    }

    const errorStackString = ensure(new Error().stack);
    let currentLine = 1;
    let startIndex, endIndex;

    for (startIndex = 0; startIndex < errorStackString.length; startIndex++) {
        if (errorStackString[startIndex].match(/^(\r\n|\r|\n)$/g)) {
            currentLine += 1;
            if (currentLine === destinationLine) {
                break;
            }
        }
    }

    for (endIndex = startIndex + 1; endIndex < errorStackString.length; endIndex++) {
        if (errorStackString[endIndex].match(/^(\r\n|\r|\n)$/g)) {
            break;
        }
    }

    if (!textLines) {
        return console.log(errorStackString.substring(startIndex, endIndex), "\n");
    }

    if (!(textLines instanceof Array)) {
        return console.log(textLines, errorStackString.substring(startIndex, endIndex), "\n");
    }

    return console.log(...textLines, errorStackString.substring(startIndex, endIndex), "\n");
};

/** For ES5 Import Statement !*/
module.exports = {trace};
