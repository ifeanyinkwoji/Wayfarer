import { pool } from '../model';
import { userPassword } from '../config';
import { Auth, log } from '../utility';

require('custom-env').env(true);

const hashedPassword = Auth.hash(userPassword);

const seed = async () => {
  try {
    const seedTables = `
  INSERT INTO users (first_name, last_name, email, password) VALUES ('Thor', 'Odinson', 'thor@ragnarok.com', '${hashedPassword}');
  INSERT INTO users (first_name, last_name, email, password) VALUES ('Loki', 'Odinson', 'loki@ragnarok.com', '${hashedPassword}');
  INSERT INTO users (first_name, last_name, email, password) VALUES ('Wolverine', 'Xmen', 'wolverine@berserker.com', '${hashedPassword}');
 
  INSERT INTO buses (number_plate, manufacturer, model, capacity) VALUES ('EX123FK', 'Nissan', 'Mac10', 40);
  INSERT INTO buses (number_plate, manufacturer, model, capacity) VALUES ('EX125FS', 'RoBeast', 'F789', 40);
  INSERT INTO buses (number_plate, manufacturer, model, capacity) VALUES ('EY323FK', 'Tardis', 'Timehopper', 40);
  INSERT INTO buses (number_plate, manufacturer, model, capacity) VALUES ('GY327HK', 'Magiker', 'Magic School Bus', 40);
  INSERT INTO buses (number_plate, manufacturer, model, capacity) VALUES ('KZ393GK', 'Future', 'Hyperspace Bus', 40);

  INSERT INTO trips (bus_id, origin, destination, fare) VALUES (1, 'Hell', 'Heaven', 15000);
  INSERT INTO trips (bus_id, origin, destination, fare) VALUES (2, 'Lagos', 'Abuja', 17300);
  INSERT INTO trips (bus_id, origin, destination, fare) VALUES (3, 'Accra', 'Owerri', 20000);
  `;

    log('Seeding Tables...');
    await pool.query(seedTables);
    log('Tables seeded successfully!');
  } catch (error) {
    log(error.message);
  }
};

export default seed;

seed();
