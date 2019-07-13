const pg = require('pg');
require('custom-env').env(true);

const dbUrl = process.env.DATABASE_URL;
const pool = new pg.Pool({
  connectionString: dbUrl,
});

const migration = async () => {
  try {
    const dropTables = `
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS trips CASCADE;
    DROP TABLE IF EXISTS buses CASCADE;
    DROP TABLE IF EXISTS bookings CASCADE`;

    const createTables = `
    CREATE TABLE IF NOT EXISTS users(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(128) UNIQUE NOT NULL,
      first_name VARCHAR(128) NOT NULL,
      last_name VARCHAR(128) NOT NULL,
      password VARCHAR(256) NOT NULL,
      is_admin BOOLEAN DEFAULT false,
      created_on TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS trips(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      bus_id UUID NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      trip_date TIMESTAMP NOT NULL DEFAULT NOW(),
      fare NUMERIC(6, 2) NOT NULL,
      status TEXT DEFAULT 'active' NOT NULL
    );

    CREATE TABLE IF NOT EXISTS buses(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      number_plate TEXT UNIQUE NOT NULL,
      manufacturer TEXT NOT NULL,
      model TEXT NOT NULL,
      year DATE NOT NULL,
      capacity INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings(
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      trip_id UUID NOT NULL,
      user_id UUID NOT NULL,
      seat_number INTEGER NOT NULL CHECK(seat_number > 0),
      created_on TIMESTAMP NOT NULL DEFAULT NOW(),
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    `;

    await pool.query(dropTables);
    console.log('Dropped the tables successfully!');

    await pool.query(createTables);
    console.log('Created the tables successfully!');
  } catch (error) {
    console.error(error.message);
  }
};

pool.on('remove', () => {
  console.log('client removed');
  process.exit(0);
});

module.exports = migration;

migration();

require('make-runnable');
