import { Pool } from 'pg';
import config from '../config';

const { dbUrl } = config;

const pool = new Pool({
  connectionString: dbUrl,
});

pool.on('connect', () => {
  console.log('Connection to the database is successful');
});

class Model {
  constructor(table) {
    this.table = table;
    this.pool = pool;
    this.pool.on('error', (err) => {
      console.log('Unexpected error on idle client', err);
      process.exit(-1);
    });
  }

  async select(columns, clause) {
    const query = `SELECT ${columns} FROM ${this.table} ${clause};`;
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

module.exports = { pool, Model };
