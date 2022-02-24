/** Import Pre-Defined Types Helper !*/
import "mocha";

/** Import ES6 Default Dependencies !*/
import {app, mock, assert, expect, onReady} from "$/test/bootstrap";

describe(`User Certificated should be response to Client properly`, () => {

    before(async () => {
        /** Execute tests after app is ready !*/
        return onReady();
    });

    it('Should mock `user` into Context Instance', () => {
        const ctx = app.mockContext({
            headers: {
                token: "",
            },
            user: {
                username: 'edgar@v3t.io',
            },
        });
        assert(ctx.user?.username === 'edgar@v3t.io');
    });

    it('Should response `user` successfully to Client', async () => {
        app.mockContext({
            headers: {
                token: Buffer.from(`manager:1111qqqq@Q`).toString('base64'),
            },
        });

        await app.httpRequest().get('/api/user').expect(200).expect((res) => {
            return expect(res.body).to.containSubset({
                data: {
                    userInfo: {
                        fullName: 'Manager',
                        username: 'manager',
                        email: 'manager@v3t.io',
                        role: {
                            name: "MANAGER",
                        },
                        level: {
                            name: "Sắt",
                        },
                        status: 'OPEN',
                        referrerId: null,
                        token: Buffer.from(`manager:1111qqqq@Q`).toString('base64'),
                        // phoneNumber: '+855111222333',
                        // referralCode: 'MANAGER',
                        isActivePassword2: 0,
                        loginFailed: 0,
                    }
                },
                errorCode: 0,
                success: true,
            });
        });
    });

    afterEach(() => {
        return mock.restore();
    });

    after(() => {
        return console.log('finish required');
    });
});
