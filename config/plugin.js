"use strict";

/** @type Egg.EggPlugin ~!*/
module.exports = {
  cors: {
    enable: true,
    package: "egg-cors",
  },
  crypto: {
    enable: true,
    package: "egg-crypto",
  },
  io: {
    enable: true,
    package: "egg-socket.io",
  },
  jwt: {
    enable: true,
    package: "egg-jwt",
  },
  mailer: {
    enable: true,
    package: "egg-mailer",
  },
  mongoose: {
    enable: true,
    package: "egg-mongoose",
  },
  passport: {
    enable: true,
    package: "egg-passport",
  },
  passportLocal: {
    enable: true,
    package: "egg-passport-local",
  },
  redis: {
    enable: true,
    package: "egg-redis",
  },
  security: {
    enable: true,
    package: "egg-security",
  },
  sequelize: {
    enable: true,
    package: "egg-sequelize",
  },
  userrole: {
    enable: true,
    package: "egg-userrole",
  },
  validate: {
    enable: true,
    package: "egg-validate",
  },
};
