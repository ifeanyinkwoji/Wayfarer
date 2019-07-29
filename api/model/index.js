import { Pool, types } from 'pg';
import { dbUrl, nodeEnv } from '../config';
import log from '../utility/log';

require('custom-env').env(true);

types.setTypeParser(1700, value => parseFloat(value));
log(nodeEnv);

const pool = new Pool({
  connectionString: dbUrl,
});

pool.on('connect', () => {
  log(`Connection successful to ${nodeEnv} database`);
});

class Model {
  constructor(table) {
    this.table = table;
    this.pool = pool;
    this.pool.on('error', (err) => {
      log('Error: Idle client', err);
      process.exit(-1);
    });
  }

  async select(columns, clause = '') {
    const query = `SELECT ${columns} FROM ${this.table} ${clause}`;
    const data = await this.pool.query(query);
    return data.rows;
  }

  async insert(columns, values, clause) {
    const query = `INSERT INTO ${this.table}(${columns}) VALUES(${values}) ${clause}`;
    const data = await this.pool.query(query);
    return data.rows;
  }

  async update(columns, clause) {
    const query = `UPDATE ${this.table} SET ${columns} ${clause}`;
    const data = await this.pool.query(query);
    return data.rows;
  }

  async delete(clause) {
    const query = `DELETE FROM ${this.table} ${clause}`;
    const data = await this.pool.query(query);
    return data.rows;
  }
}

export { pool, Model };
