const pg = require('pg');
require('custom-env').env(true);

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const password = process.env.HASHED_PASSWORD;
const adminPassword = process.env.HASHED_ADMIN_PASSWORD;

const seed = async () => {
  try {
    const seedTables = `
  INSERT INTO users (first_name, last_name, email, password, is_admin) VALUES ('Thor', 'Odin', 'thor@ragnarok.com', '${adminPassword}', true);
  INSERT INTO users (first_name, last_name, email, password, is_admin) VALUES ('Ifeanyi', 'Nkwoji', 'ifeanyi@wayfarer.com', '${adminPassword}',true);
  INSERT INTO users (first_name, last_name, email, password) VALUES ('Loki', 'Odin', 'loki@odin.com', '${password}');
  INSERT INTO users (first_name, last_name, email, password) VALUES ('Hela', 'Odin', 'hela@odin.com', '${password}');
 
  INSERT INTO buses (number_plate, manufacturer, model, year, capacity) VALUES ('JJJ490EJ', 'Volvo', 'AR150', '2015-01-01', 30);
  INSERT INTO buses (number_plate, manufacturer, model, year, capacity) VALUES ('ABJ490EJ', 'Mercedes', 'Marcopolo', '2015-03-09', 30);
  INSERT INTO buses (number_plate, manufacturer, model, year, capacity) VALUES ('JOY490EJ', 'Toyota', 'Hilux', '2015-07-10', 30);

  `;

    await pool.query(seedTables);
    console.log('Seeded the tables successfully!');
  } catch (error) {
    console.log(error.message);
  }
};

pool.on('remove', () => {
  console.log('client removed');
  process.exit(0);
});

module.exports = seed;

seed();

require('make-runnable');
