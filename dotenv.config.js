const path = require('path');

module.exports = {
  parsed: {
    ...process.env,
    ...require('dotenv').config({
      path: path.resolve(__dirname, '.env')
    }).parsed,
  }
};
