require('custom-env').env(true);

const port = process.env.PORT;
const dbUrl = process.env.DATABASE_URL;
const jwtKey = process.env.JWT_KEY;
const userEmail = process.env.USER;
const user2Email = process.env.USER2;
const userPassword = process.env.PASSWORD;
const adminEmail = process.env.ADMIN;
const adminPassword = process.env.ADMIN_PASSWORD;
const busCap = process.env.BUS_CAP;
const nodeEnv = process.env.NODE_ENV;

export {
  port,
  dbUrl,
  jwtKey,
  userEmail,
  userPassword,
  adminEmail,
  adminPassword,
  busCap,
  user2Email,
  nodeEnv,
};
