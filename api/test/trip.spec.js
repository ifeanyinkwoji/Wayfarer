import chai from 'chai';
import chaiUUID from 'chai-uuid';
import assert from 'assert';
import request from 'supertest';
import chaiJsonSchema from 'chai-json-schema';
import { Pool } from 'pg';
import faker from 'faker';
import app from '..';
import config from '../config';

chai.use(chaiJsonSchema);
chai.use(chaiUUID);
const should = chai.should();

const { dbUrl } = config;

const pool = new Pool({
  connectionString: dbUrl,
});

describe('admin creates a trip test suite', () => {
  pool.connect();
  let adminToken;
  before('Get adminToken', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signin')
      .send({ email: config.admin, password: config.adminPassword })
      .catch((errors) => {
        console.error(errors);
        throw errors;
      });
    adminToken = await res.body.data.token;
  });

  it('should create a trip', async () => {
    let bus_id;
    let newTrip;
    try {
      const results = await pool.query('SELECT * FROM buses');
      bus_id = await results.rows[0].id;
      newTrip = await {
        token: adminToken,
        bus_id,
        origin: 'Hell',
        destination: 'Heaven',
        fare: 7000,
      };
    } catch (e) {
      return console.error(e);
    }

    const resp = await request(app)
      .post('/api/v1/trips')
      .send(newTrip);

    resp.status.should.equal(201);
    resp.body.should.haveOwnProperty('status');
    resp.body.status.should.be.a('string');
    resp.body.status.should.equal('success');
    resp.body.should.haveOwnProperty('data');
    const { data } = resp.body;
    data.should.be.an('object');
    data.should.haveOwnProperty('id');
    data.id.should.be.a('string');
    data.id.should.be.a.uuid('v4');
    data.should.haveOwnProperty('bus_id');
    data.bus_id.should.be.a('string');
    data.bus_id.should.be.a.uuid('v4');
    data.should.haveOwnProperty('origin');
    data.origin.should.be.a('string');
    data.should.haveOwnProperty('destination');
    data.destination.should.be.a('string');
    data.should.haveOwnProperty('trip_date');
    data.trip_date.should.be.a('string');
    data.should.haveOwnProperty('fare');
    data.should.haveOwnProperty('status');
    data.status.should.be.a('string');
    data.status.should.equal('active');
  });

  it('should fail to create a trip: "invalid token error"', async () => {
    let bus_id;
    let newTrip;
    try {
      const results = await pool.query('SELECT * FROM buses');
      bus_id = await results.rows[0].id;
      newTrip = await {
        token: `${adminToken}MyNameisSLimShady`,
        bus_id,
        origin: 'Hell',
        destination: 'Heaven',
        fare: 7000,
      };
    } catch (e) {
      return console.error(e);
    }

    const resp = await request(app)
      .post('/api/v1/trips')
      .send(newTrip);

    resp.status.should.equal(401);
    resp.body.should.haveOwnProperty('status');
    resp.body.status.should.be.a('string');
    resp.body.status.should.equal('error');
    resp.body.should.haveOwnProperty('error');
    resp.body.error.should.be.a('string');
    resp.body.error.should.equal('Invalid token');
  });

  it('should fail to create a trip: "Invalid bus id"', async () => {
    const newTrip = await {
      token: adminToken,
      bus_id: 'khosjlmlkk ;lkdgkf;gk;fl;dj;',
      origin: 'Hell',
      destination: 'Heaven',
      fare: 7000,
    };

    const resp = await request(app)
      .post('/api/v1/trips')
      .send(newTrip);

    resp.status.should.equal(400);
    resp.body.should.haveOwnProperty('status');
    resp.body.status.should.be.a('string');
    resp.body.status.should.equal('error');
    resp.body.should.haveOwnProperty('error');
    resp.body.error.should.be.a('string');
    resp.body.error.should.equal(
      'Please enter a valid bus id. The bus_id format shoud be "uuid version 4"',
    );
  });

  it('should fail to create a trip: "Invalid origin error"', async () => {
    let bus_id;
    let newTrip;
    try {
      const results = await pool.query('SELECT * FROM buses');
      bus_id = await results.rows[0].id;
      newTrip = await {
        token: adminToken,
        bus_id,
        origin: 5670,
        destination: 'Heaven',
        fare: 7000,
      };
    } catch (e) {
      return console.error(e);
    }

    const resp = await request(app)
      .post('/api/v1/trips')
      .send(newTrip);

    resp.status.should.equal(400);
    resp.body.should.haveOwnProperty('status');
    resp.body.status.should.be.a('string');
    resp.body.status.should.equal('error');
    resp.body.should.haveOwnProperty('error');
    resp.body.error.should.be.a('string');
    resp.body.error.should.equal(
      'Please enter the  origin. It should be alphanumerical with least 2 or at most 30 characters',
    );
  });

  it('should fail to create a trip: "Invalid destination error"', async () => {
    let bus_id;
    let newTrip;
    try {
      const results = await pool.query('SELECT * FROM buses');
      bus_id = await results.rows[0].id;
      newTrip = await {
        token: adminToken,
        bus_id,
        destination: 5670,
        origin: 'Heaven',
        fare: 7000,
      };
    } catch (e) {
      return console.error(e);
    }

    const resp = await request(app)
      .post('/api/v1/trips')
      .send(newTrip);

    resp.status.should.equal(400);
    resp.body.should.haveOwnProperty('status');
    resp.body.status.should.be.a('string');
    resp.body.status.should.equal('error');
    resp.body.should.haveOwnProperty('error');
    resp.body.error.should.be.a('string');
    resp.body.error.should.equal(
      'Please enter the  destination. It should be alphanumerical with at least 2 or at most 30 characters',
    );
  });

  it('should fail to create a trip: "Invalid fare error"', async () => {
    let bus_id;
    let newTrip;
    try {
      const results = await pool.query('SELECT * FROM buses');
      bus_id = await results.rows[0].id;
      newTrip = await {
        token: adminToken,
        bus_id,
        destination: 'Hell',
        origin: 'Heaven',
        fare: 150,
      };
    } catch (e) {
      return console.error(e);
    }

    const resp = await request(app)
      .post('/api/v1/trips')
      .send(newTrip);

    resp.status.should.equal(400);
    resp.body.should.haveOwnProperty('status');
    resp.body.status.should.be.a('string');
    resp.body.status.should.equal('error');
    resp.body.should.haveOwnProperty('error');
    resp.body.error.should.be.a('string');
    resp.body.error.should.equal('Please enter the fare. It should be at least 500');
  });
});

describe('user gets trips test suite', () => {
  let requestPayload;
  pool.connect();
  before('Get authentication token', async () => {
    const res = await request(app)
      .post('/api/v1/auth/signin')
      .send({ email: config.user, password: config.userPassword })
      .catch((errors) => {
        console.error(errors);
        throw errors;
      });
    const { token, id, is_admin } = await res.body.data;
    requestPayload = { token, id, is_admin };
  });

  it('should get all trips: "no error"', async () => {
    const resp = await request(app)
      .get('/api/v1/trips')
      .send(requestPayload);
    resp.status.should.equal(200);
    resp.body.should.haveOwnProperty('status');
    resp.body.status.should.be.a('string');
    resp.body.status.should.equal('success');
    resp.body.should.haveOwnProperty('data');
    const { data } = resp.body;
    data.should.be.an('array');
    for (let i = 0; i < data.length; i += 1) {
      data[i].should.be.an('object');
      data[i].should.haveOwnProperty('id');
      data[i].id.should.be.a('string');
      data[i].id.should.be.a.uuid('v4');
      data[i].should.haveOwnProperty('bus_id');
      data[i].bus_id.should.be.a('string');
      data[i].bus_id.should.be.a.uuid('v4');
      data[i].should.haveOwnProperty('origin');
      data[i].origin.should.be.a('string');
      data[i].should.haveOwnProperty('destination');
      data[i].destination.should.be.a('string');
      data[i].should.haveOwnProperty('trip_date');
      data[i].trip_date.should.be.a('string');
      data[i].should.haveOwnProperty('fare');
      data[i].should.haveOwnProperty('status');
      data[i].status.should.be.a('string');
    }
  });

  it('should fail to get all trips: "no available trip error"', async () => {
    try {
      await pool.query('TRUNCATE ONLY trips RESTART IDENTITY CASCADE');
    } catch (e) {
      return console.error(e);
    }

    const resp = await request(app)
      .get('/api/v1/trips')
      .send(requestPayload);

    resp.status.should.equal(404);
    resp.body.should.haveOwnProperty('status');
    resp.body.status.should.be.a('string');
    resp.body.status.should.equal('error');
    resp.body.should.haveOwnProperty('error');
    resp.body.error.should.be.a('string');
    resp.body.error.should.equal('There is no available trip');
  });
});
