require('custom-env').env(true);

const port = process.env.PORT;
const dbUrl = process.env.DATABASE_URL;
const jwtKey = process.env.JWT_KEY;
const user = process.env.USER;
const userPassword = process.env.PASSWORD;
const admin = process.env.ADMIN;
const adminPassword = process.env.ADMIN_PASSWORD;
const busCap = process.env.BUS_CAP;

const exportOut = {
  port,
  dbUrl,
  jwtKey,
  user,
  userPassword,
  admin,
  adminPassword,
  busCap,
};

module.exports = exportOut;
