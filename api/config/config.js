import dotEnv from 'dotenv';

dotEnv.config();

const port = process.env.PORT;

module.exports = port;
