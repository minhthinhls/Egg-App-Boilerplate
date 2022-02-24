import {__GenerateTypeHandler__} from "./exec";

export const exec = () => {

    /** Sequelize Model Interfaces !*/
    __GenerateTypeHandler__("model", {
        keywordHandler: (key) => {
            return `ReturnType<typeof ${key}>`;
        },
        interfaceWrapper: {
            _name: "IModel",
            _extends: ["Model"],
            _extraProps: {Sequelize: `typeof sequelize.Sequelize`},
            _extraImports: {
                "* as sequelize": "sequelize/types",
                "type {IModel as Model}": "egg",
            },
        },
        camelCase: {
            pascalCase: true,
        },
    });

    /** Sequelize Model Attributes Interfaces !*/
    __GenerateTypeHandler__("model", {
        keywordHandler: (key) => {
            return `${key}`;
        },
        fileName: "ModelAttributes",
        interfaceWrapper: {
            _name: "IModelAttributes",
        },
        camelCase: {
            pascalCase: true,
        },
        asNameSpace: true,
    });

    /** Mongoose Model Interfaces !*/
    __GenerateTypeHandler__("mongoose", {
        keywordHandler: (key) => {
            return `ReturnType<typeof ${key}>`;
        },
        interfaceWrapper: {
            _name: "IMongoose",
            _extends: ["mongoose.Mongoose"],
            _extraImports: {
                "* as mongoose": "mongoose",
            },
        },
        camelCase: {
            pascalCase: true,
        },
    });

    /** Sequelize Service Interfaces !*/
    __GenerateTypeHandler__("service", {
        interfaceWrapper: {
            _name: "IService",
            _extends: ["Service"],
            _extraProps: {logger: "EggLogger"},
            _extraImports: {
                "type {EggLogger}": "egg",
                "type {IService as Service}": "egg",
            },
        },
        camelCase: {
            pascalCase: false,
        },
    });

    /** Sequelize Service Interfaces !*/
    __GenerateTypeHandler__("controller", {
        interfaceWrapper: {
            _name: "IController",
            _extends: ["Controller"],
            _extraProps: {logger: "EggLogger"},
            _extraImports: {
                "type {EggLogger}": "egg",
                "type {IController as Controller}": "egg",
            },
        },
        camelCase: {
            pascalCase: false,
        },
    });

};

/** For ES6 Default Import Statement !*/
export default exec;

/** For ES5 Import Statement !*/
module.exports = {exec};
