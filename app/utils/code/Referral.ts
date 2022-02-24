/**
 ** @param {string} [username]
 ** @returns {string}
 **/
export const getUniqueCode = (username?: string) => {
    if (!username) {
        return `KDO88_${Date.now()}`;
    }
    return `KDO88_${username}`;
};

/** For ES5 Import Statement !*/
module.exports = {
    getUniqueCode
};
