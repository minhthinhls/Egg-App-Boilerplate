/* eslint valid-jsdoc: "off", complexity: "off", no-unused-vars: "off", @typescript-eslint/naming-convention: "off" */

/** @ts-nocheck - Turn this on to ignore this file !*/

"use strict";

const {migrate: migrateDatabase} = require('./app/db');

/** Import ES6 Custom [Utils && Helper] Dependencies !*/
const {removeNullableKeyFrom} = require('./app/extend/helper');

/**
 ** @deprecated - Only enable this when need to build types !
 ** - Run this command line from Project Root Directory to build Types instead.
 ** @example
 ** > npx ts-node --transpile-only app/utils/type/generator/build.ts
 ** > npm run build
 ** @example
 ** > require('./app/utils/type/generator').exec();
 **/
const generateType = () => require('./app/utils/type/generator').exec();

module.exports = class App {

    /**
     ** @param {IApplication} app - Egg Application
     **/
    constructor(app) {
        this.app = app;
    }

    /**
     ** @see {@link https://www.eggjs.org/advanced/loader#life-cycles}
     ** @returns {Promise<void>}
     **/
    async willReady() {
        const app = this.app;
        const $ENV = process.env;

        console.time('>>> MySQL Table Synchronization Time');
        /** Synchronize the database !*/
        await app.model.sync(removeNullableKeyFrom({
            /** Alter Table sometime run too slow, upto 30 seconds !*/
            alter: $ENV.NODE_ENV.toUpperCase() === "DEV" || null,
            /** Force Drop Table sometime run too slow, upto 10 seconds !*/
            // force: $ENV.NODE_ENV.toUpperCase() === "TEST" || null,
        })).then(() => {
            app.logger.info('Sync Tables...');
        }).catch((error) => {
            app.logger.error(error);
        });
        console.timeEnd('>>> MySQL Table Synchronization Time');

        /** Init data tables !*/
        if (String(process.env.INIT_MYSQL_DB).toUpperCase() !== "FALSE") {
            await migrateDatabase(app);
        }

        /** Applying Authorization Middleware !*/
        await this.app.enablePassport();

        /** Add custom Application Plugins !*/
        require('./app/plugin')(app);

        /** Add custom Validator Rules !*/
        require('./app/extend/validator')(app);

        return console.log([
            `>>> Node Heap Limit = ${require('v8').getHeapStatistics().heap_size_limit / (1024 * 1024)} MBs <<<`,
        ].join("\n"));
    }
};
