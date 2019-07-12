require('custom-env').env(true);

const port = process.env.PORT;
const dbUrl = process.env.DATABASE_URL;
const jwtKey = process.env.JWT_KEY;

const exportOut = {
  port,
  dbUrl,
  jwtKey,
};

module.exports = exportOut;
