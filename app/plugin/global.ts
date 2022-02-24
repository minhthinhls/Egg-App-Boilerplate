/**!*****************************!*
 ** PUT THIS ON MAIN ENTRY FILES !
 ** WRITE RESOLVED PATH IN BOTH FILES
 ** [PACKAGE.JSON] AND [TSCONFIG.JSON]
 **!*****************************!*/
require("module-alias/register");

/** Export Default Global Modules !*/
export * from "@/utils";

/** Export ES6 Custom [Utils && Helper] Dependencies !*/
export {parse} from "@/utils/parser/json";
