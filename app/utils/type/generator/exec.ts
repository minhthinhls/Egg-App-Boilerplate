import {__BuildAbstractTree__, __ComposeInterface__, __ObjectKeysModifier__} from "./core";
import {__FileLoader__, __ImportDependency__} from "./core";

/** Import Node Native Dependencies !*/
import * as path from "path";

/** Import Node Native Dependencies !*/
import * as fs from "fs";

/** Import Installed NPM Dependencies !*/
import * as camelCase from "camelcase";

/** Import Pre-Defined Types Helper !*/
import type {IDependencyOptions, IDirectory} from "./core";

/** Import Installed Types from NPM Dependencies !*/
import type {Options as CamelCaseOptions} from "camelcase";

const FOUR_SPACES = "    ";
const ESLINT_DISABLE_PREFIX = `/* eslint-disable-next-line no-unused-vars */`;

export declare interface IHandlerOptions extends IDependencyOptions {
    indent: typeof FOUR_SPACES;
    keywordHandler: ((v: string) => string) | null;
    interfaceWrapper: {
        _name: string;
        _extends?: Array<string>;
        _extraProps?: {[p: string]: string};
        _extraImports?: {[p: string]: string};
    } | null;
    /** - The output file name. Default will be `` ${dirPath} `` !*/
    fileName: string;
    camelCase: CamelCaseOptions;
}

/**
 ** @see {@link https://stackoverflow.com/questions/59398053/node-js-properly-closing-fd-with-multiple-streams}
 ** @example
 ** > return fs.close(_fileDescriptor, (error) => {
 **     if (error) throw error;
 **     console.log(`> File system Stream-Reader [${fileName}] successfully closed !`);
 ** });
 ** @param {IDirectory} dirPath
 ** @param {Partial<IHandlerOptions>} [options]
 **~!*/
export const __GenerateTypeHandler__ = (dirPath: IDirectory, options?: Partial<IHandlerOptions>) => {
    return __FileLoader__(dirPath, (files) => {
        /** All required Import Statements !*/
        const __ImportStatements__ = files.map((filePath) => {
            return __ImportDependency__(dirPath, filePath, {
                asType: options?.asType || false,
                asNameSpace: options?.asNameSpace || false,
            });
        }).join("\n");

        /** Step 1: Let's build a Tree of Node by looping through array files !*/
        const __AbstractTree__ = __ObjectKeysModifier__(__BuildAbstractTree__(files, dirPath, {...options}), {...options});
        /** Step 2: Loop all files, compose all import string using function __ImportDependency__() !*/
        const __InternalModules__ = __ComposeInterface__(__AbstractTree__, options?.indent || FOUR_SPACES, options?.keywordHandler || null);

        /** Step 3: Wrap [__InternalModules__] by Custom Interface Name & Extended Components !*/
        const {_name, _extends, _extraProps, _extraImports} = options?.interfaceWrapper || {};
        const __ExtraModules__ = Object.entries(_extraProps || {}).map(([k, v]) => {
            return FOUR_SPACES + `${k}: ${v};\n`;
        });
        const __ParsedInterface__ = [
            `export declare interface ${_name}${_extends ? ` extends ${_extends.join(", ")}` : ""} {\n`,
            ...__ExtraModules__,
            __InternalModules__,
            `}\n`,
        ].join("");

        const __ExtraImports__ = Object.entries(_extraImports || {}).map(([k, v]) => {
            return [
                ESLINT_DISABLE_PREFIX,
                `import ${k} from "${v}";`,
            ].join("\n");
        });

        /** Step 4: Composing all component into unique [__MODULES__] !*/
        const __MODULES__ = [
            ...__ExtraImports__,
            __ImportStatements__,
            "",
            `/** Import all Extended Static Sequelize Models !*/`,
            __ParsedInterface__,
        ].join("\n");

        /** Step 5: File Writer and I/O Read-Only Files !*/
        const destPath = path.resolve(__dirname, '../../../extend/types'); // @/extend/types
        const fileName = `${camelCase(options?.fileName || dirPath, {...options?.camelCase, pascalCase: true})}.d.ts`;

        /**
         ** @see {@link https://stackoverflow.com/questions/59398053/node-js-properly-closing-fd-with-multiple-streams}
         **/
        fs.promises.open(`${path.resolve(destPath, fileName)}`, "r").then(async (__FileHandler__) => {
            const {fd: _fileDescriptor} = __FileHandler__;
            await new Promise((resolve, reject) => {
                return fs.fchmod(_fileDescriptor, 0o777, (error) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(_fileDescriptor);
                });
            });
            await fs.promises.writeFile(`${path.resolve(destPath, fileName)}`, __MODULES__);
            /**
             ** @see {@link https://stackoverflow.com/questions/59398053/node-js-properly-closing-fd-with-multiple-streams}
             ** @example
             ** @deprecated
             ** > return fs.close(_fileDescriptor, (error) => {
             **     if (error) throw error;
             **     console.log(`> File system Stream-Reader [${fileName}] successfully closed !`);
             ** });
             **~!*/
            return __FileHandler__.close().then(() => {
                return console.log(`> File system Stream-Reader [${fileName}] successfully closed !`);
            });
        }).catch(() => {
            return fs.promises.writeFile(`${path.resolve(destPath, fileName)}`, __MODULES__);
        }).finally(async () => {
            const __FileHandler__ = await fs.promises.open(`${path.resolve(destPath, fileName)}`, "r");
            const {fd: _fileDescriptor} = __FileHandler__;
            /**
             ** @see {@link https://codeburst.io/node-js-fs-module-changing-file-permissions-and-ownership-with-file-descriptors-14749fdf3eaf}
             **/
            return fs.fchmod(_fileDescriptor, 0o444, (error) => {
                if (error) throw error;
                console.log(`> File permission [${fileName}] successfully changed into READ-ONLY !`);
                /**
                 ** @see {@link https://stackoverflow.com/questions/59398053/node-js-properly-closing-fd-with-multiple-streams}
                 ** @example
                 ** @deprecated
                 ** > return fs.close(_fileDescriptor, (error) => {
                 **     if (error) throw error;
                 **     console.log(`> File system Stream-Reader [${fileName}] successfully closed !`);
                 ** });
                 **~!*/
                return __FileHandler__.close().then(() => {
                    return console.log(`> File system Stream-Reader [${fileName}] successfully closed !`);
                });
            });
        });

        return void (0);
    });
};
