/** Import ES6 Default Dependencies !*/
import * as chai from "chai";

/** Import ES6 Default Dependencies !*/
import * as chaiSubset from "chai-subset";

/** Import ES6 Default Dependencies !*/
import {app as _app, mock as _mock, mm as _mm, assert} from "egg-mock/bootstrap";

/** Import Installed Types from NPM Dependencies !*/
import type {BaseMockApplication, EggMock, MockOption} from "egg-mock";

/** Import Application Interface as Typings from Pre-Defined Types Helper !*/
import type {IApplication, IContext, Intersection} from "@/extend/types";

/** Override the Types of Mock Application from Project Pre-Defined Modules !*/
export interface IMockApplication extends BaseMockApplication<IApplication, IContext> {
    /* [[Optional Attributes Placeholder]] */
}

/** Intersect to eliminate Duplicate Properties from the Types of Mock Application !*/
export type MockApplication = Intersection<IApplication, IMockApplication>;

/** @ts-ignore !*/
export interface IEggMock extends EggMock {
    /**
     ** Create a egg mocked application
     **/
    app: (option?: MockOption) => MockApplication;

    /**
     ** Create a mock cluster server, but you can't use API in application, you should test using supertest
     **/
    cluster: (option?: MockOption) => MockApplication;
}

/** @ts-ignore - Egg Mock Application !*/
const app: MockApplication = _app;
/** @ts-ignore - Egg Mock Global Instance !*/
const mock: IEggMock = _mock;
/** @ts-ignore - Egg Mock Global Instance !*/
const mm: IEggMock = _mm;

/** @ts-ignore - Load Chai Subset Comparison to Assertion Library !*/
chai.use(chaiSubset);
/**
 ** - For detail purpose of using Chai Subset Middleware. Please refer to the following articles:
 ** @see {@link https://github.com/visionmedia/supertest/issues/628/}
 ** @see {@link https://stackoverflow.com/questions/62547335/mocha-chai-deep-include-an-array-of-objects-but-only-have-part-of-expected-obj/}
 ** @see {@link https://www.chaijs.com/plugins/chai-subset/}
 ** @see {@link https://www.npmjs.com/package/chai-subset/}
 **/
const {expect} = chai;

/**
 ** - Create hook to force all Unit Test wait for this resolved Ready Promise.
 ** @param {MockApplication} [_app]
 ** @returns {Promise<void>}
 **/
const onReady = async (_app: MockApplication = app): Promise<void> => {
    const db = require('@/db');
    const user = await _app.model.User.findOne({
        nest: true,
        raw: true,
    });

    /** @ts-ignore !*/
    const {username, password, database, dialect} = _app.config.sequelize;
    /**
     ** - Create a new database via built-in Sequelize Method.
     ** @see {@link https://stackoverflow.com/questions/41258500/how-to-create-mysql-database-with-sequelize-nodejs/}
     **/
    const sequelize = new _app.model.Sequelize("", username, password, {
        dialect: dialect || "mysql",
    });
    await sequelize.query(`CREATE DATABASE ${database};`).then((/*data*/) => {
        /* [[Optional Execution Placeholder]] */
    }).catch(() => {
        return console.log(`> Database "${database}" already existed =>`);
    });

    /** Check whether the data has been fetched to Unit Test Database yet !*/
    if (user) {
        return _app.ready();
    }
    return Promise.all([_app.ready(), db.migrate(_app)]).then(() => void 0);
};

/**
 ** Clean database after Unit Test Process Finished.
 **/
process.on('exit', async () => {
    return console.log('>>> ON EXIT FINISHED UNIT TEST');
});

export {app, mock, mm, assert, expect, onReady};
