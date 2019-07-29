import chai from 'chai';
import chaiJWT from 'chai-jwt';
import chaiMATCH from 'chai-match';
import moment from 'moment';
import assert from 'assert';
import request from 'supertest';
import { pool } from '../model';
import { log } from '../utility';

import app from '..';
import {
  adminEmail, adminPassword, userEmail, userPassword, jwtKey,
} from '../config';

chai.use(chaiJWT);
chai.use(chaiMATCH);
const should = chai.should();

moment().format();

const admin = {
  email: adminEmail,
  password: adminPassword,
};

const user = {
  email: userEmail,
  password: userPassword,
};

let adminToken;
let userToken;

describe('POST /trips', () => {
  before('Get adminToken for the test', (done) => {
    request(app)
      .post('/api/v1/auth/signin')
      .send(admin)
      .end((err, res) => {
        adminToken = res.body.data.token;

        done();
      });
  });

  before('Get token for the test', (done) => {
    request(app)
      .post('/api/v1/auth/signin')
      .send(user)
      .end((err, res) => {
        userToken = res.body.data.token;

        done();
      });
  });

  it('should successfully create a new trip', (done) => {
    const newTrip = {
      bus_id: 4,
      origin: 'Coker',
      destination: 'Epic Towers',
      fare: 1200,
    };
    request(app)
      .post('/api/v1/trips')
      .send(newTrip)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(201);
        res.body.should.be.an('object');
        res.body.should.haveOwnProperty('status');
        res.body.should.haveOwnProperty('data');
        const { data } = res.body;
        res.body.status.should.be.a('string');
        res.body.status.should.be.equal('success');
        data.should.be.an('object');
        data.should.haveOwnProperty('id');
        data.should.haveOwnProperty('bus_id');
        data.should.haveOwnProperty('origin');
        data.should.haveOwnProperty('destination');
        data.should.haveOwnProperty('trip_date');
        data.should.haveOwnProperty('fare');
        data.should.haveOwnProperty('status');
        const {
          id, bus_id, origin, destination, trip_date, fare, status,
        } = data;

        id.should.be.a('number');
        bus_id.should.be.a('number');
        origin.should.be.a('string');
        origin.should.match(/^[a-zA-Z0-9\s,'-]*$/);
        destination.should.be.a('string');
        destination.should.match(/^[a-zA-Z0-9\s,'-]*$/);
        trip_date.should.be.a('string');
        moment().isValid(trip_date).should.equal(true);
        fare.should.be.a('number');
        status.should.be.a('string');
        status.should.equal('active');

        done();
      });
  });

  it('should throw an error if the bus is unavailable', (done) => {
    const newTrip = {
      bus_id: 1,
      origin: 'Mile 2',
      destination: 'Surulere',
      fare: 1400,
    };
    request(app)
      .post('/api/v1/trips')
      .send(newTrip)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(409);
        res.body.should.be.an('object');
        res.body.should.haveOwnProperty('status');
        res.body.should.haveOwnProperty('error');
        const { status, error } = res.body;
        status.should.be.a('string');
        status.should.be.equal('error');
        error.should.be.a('string');
        error.should.equal('The bus is unavailable');

        done();
      });
  });

  it('should throw error if bus ID is missing', (done) => {
    const newTrip = {
      origin: 'CMS',
      destination: 'Obalande',
      fare: 1900,
    };
    request(app)
      .post('/api/v1/trips')
      .send(newTrip)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(400);
        res.body.should.be.an('object');
        res.body.should.haveOwnProperty('status');
        res.body.should.haveOwnProperty('error');
        const { status, error } = res.body;
        status.should.be.a('string');
        status.should.be.equal('error');
        error.should.be.a('string');
        error.should.equal('bus_id: Please enter a valid bus id. The bus_id should be an integer between 1 and "number of buses" inclusive.');

        done();
      });
  });

  it('should throw error if bus ID is not an integer', (done) => {
    const newTrip = {
      bus_id: 2.78,
      origin: 'Akwa Ibom',
      destination: 'Owerri',
      fare: 15000,
    };
    request(app)
      .post('/api/v1/trips')
      .send(newTrip)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(400);
        res.body.should.be.an('object');
        res.body.should.haveOwnProperty('status');
        res.body.should.haveOwnProperty('error');
        const { status, error } = res.body;
        status.should.be.a('string');
        status.should.be.equal('error');
        error.should.be.a('string');
        error.should.equal('bus_id: Please enter a valid bus id. The bus_id should be an integer between 1 and "number of buses" inclusive.');

        done();
      });
  });

  it('should throw error if origin is missing', (done) => {
    const newTrip = {
      bus_id: 5,
      destination: 'Obalande',
      fare: 1900,
    };
    request(app)
      .post('/api/v1/trips')
      .send(newTrip)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(400);
        res.body.should.be.an('object');
        res.body.should.haveOwnProperty('status');
        res.body.should.haveOwnProperty('error');
        const { status, error } = res.body;
        status.should.be.a('string');
        status.should.be.equal('error');
        error.should.be.a('string');
        error.should.equal('origin: Please enter the  origin. It should be at least 2 or at most 30 characters');

        done();
      });
  });

  it('should throw error if origin is too short', (done) => {
    const newTrip = {
      bus_id: 5,
      origin: 'M',
      destination: 'Orile',
      fare: 2000,
    };
    request(app)
      .post('/api/v1/trips')
      .send(newTrip)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(400);
        res.body.should.be.an('object');
        res.body.should.haveOwnProperty('status');
        res.body.should.haveOwnProperty('error');
        const { status, error } = res.body;
        status.should.be.a('string');
        status.should.be.equal('error');
        error.should.be.a('string');
        error.should.equal('origin: Please enter the  origin. It should be at least 2 or at most 30 characters');

        done();
      });
  });

  it('should throw error if destination is missing', (done) => {
    const newTrip = {
      bus_id: 5,
      origin: 'Abuja',
      fare: 1676.80,
    };
    request(app)
      .post('/api/v1/trips')
      .send(newTrip)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(400);
        res.body.should.be.an('object');
        res.body.should.haveOwnProperty('status');
        res.body.should.haveOwnProperty('error');
        const { status, error } = res.body;
        status.should.be.a('string');
        status.should.be.equal('error');
        error.should.be.a('string');
        error.should.equal('destination: Please enter the  destination. It should be at least 2 or at most 30 characters');

        done();
      });
  });

  it('should throw error if destination is too short', (done) => {
    const newTrip = {
      bus_id: 5,
      origin: 'Okoko',
      destination: 'S',
      fare: 4400,
    };
    request(app)
      .post('/api/v1/trips')
      .send(newTrip)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(400);
        res.body.should.be.an('object');
        res.body.should.haveOwnProperty('status');
        res.body.should.haveOwnProperty('error');
        const { status, error } = res.body;
        status.should.be.a('string');
        status.should.be.equal('error');
        error.should.be.a('string');
        error.should.equal('destination: Please enter the  destination. It should be at least 2 or at most 30 characters');

        done();
      });
  });

  it('should throw error if fare is missing', (done) => {
    const newTrip = {
      bus_id: 5,
      origin: 'Mile 2',
      destination: 'Lekki',
    };
    request(app)
      .post('/api/v1/trips')
      .send(newTrip)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(400);
        res.body.should.be.an('object');
        res.body.should.haveOwnProperty('status');
        res.body.should.haveOwnProperty('error');
        const { status, error } = res.body;
        status.should.be.a('string');
        status.should.be.equal('error');
        error.should.be.a('string');
        error.should.equal('fare: Please enter the fare. It should be at least 500');

        done();
      });
  });

  it('should throw error if fare is too small', (done) => {
    const newTrip = {
      bus_id: 5,
      origin: 'Mile 2',
      destination: 'Ikeja',
      fare: 450,
    };
    request(app)
      .post('/api/v1/trips')
      .send(newTrip)
      .set('Authorization', `Bearer ${adminToken}`)
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(400);
        res.body.should.be.an('object');
        res.body.should.haveOwnProperty('status');
        res.body.should.haveOwnProperty('error');
        const { status, error } = res.body;
        status.should.be.a('string');
        status.should.be.equal('error');
        error.should.be.a('string');
        error.should.equal('fare: Please enter the fare. It should be at least 500');

        done();
      });
  });
});

describe('GET /trips', () => {
  it('should successfully get all trips ', (done) => {
    request(app)
      .get('/api/v1/trips')
      .set('Authorization', `Bearer ${userToken}`)
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.body.should.be.an('object');
        res.body.should.haveOwnProperty('status');
        res.body.should.haveOwnProperty('data');
        const { data } = res.body;
        res.body.status.should.be.a('string');
        res.body.status.should.be.equal('success');
        data.should.be.an('array');
        const pos = parseInt(Math.random() * data.length, 10);
        data[pos].should.haveOwnProperty('id');
        data[pos].should.haveOwnProperty('bus_id');
        data[pos].should.haveOwnProperty('origin');
        data[pos].should.haveOwnProperty('destination');
        data[pos].should.haveOwnProperty('trip_date');
        data[pos].should.haveOwnProperty('fare');
        data[pos].should.haveOwnProperty('status');
        const {
          id, bus_id, origin, destination, trip_date, fare, status,
        } = data[pos];

        id.should.be.a('number');
        bus_id.should.be.a('number');
        origin.should.be.a('string');
        origin.should.match(/^[a-zA-Z0-9\s,'-]*$/);
        destination.should.be.a('string');
        destination.should.match(/^[a-zA-Z0-9\s,'-]*$/);
        trip_date.should.be.a('string');
        moment().isValid(trip_date).should.equal(true);
        fare.should.be.a('number');
        status.should.be.a('string');

        done();
      });
  });


  describe('GET /trips?query', () => {
    it('should get a trip with origin as stated by the query', (done) => {
      request(app)
        .get('/api/v1/trips?origin=Lagos')
        .set('Authorization', `Bearer ${userToken}`)
        .end((err, res) => {
          should.not.exist(err);
          res.status.should.equal(200);
          res.body.should.be.an('object');
          res.body.should.haveOwnProperty('status');
          res.body.should.haveOwnProperty('data');
          const { data } = res.body;
          res.body.status.should.be.a('string');
          res.body.status.should.be.equal('success');
          data.should.be.an('array');
          const pos = parseInt(Math.random() * data.length, 10);
          data[pos].should.haveOwnProperty('id');
          data[pos].should.haveOwnProperty('bus_id');
          data[pos].should.haveOwnProperty('origin');
          data[pos].should.haveOwnProperty('destination');
          data[pos].should.haveOwnProperty('trip_date');
          data[pos].should.haveOwnProperty('fare');
          data[pos].should.haveOwnProperty('status');
          const {
            id, bus_id, origin, destination, trip_date, fare, status,
          } = data[pos];

          id.should.be.a('number');
          bus_id.should.be.a('number');
          origin.should.be.a('string');
          origin.should.match(/^[a-zA-Z0-9\s,'-]*$/);
          destination.should.be.a('string');
          destination.should.match(/^[a-zA-Z0-9\s,'-]*$/);
          trip_date.should.be.a('string');
          moment().isValid(trip_date).should.equal(true);
          fare.should.be.a('number');
          status.should.be.a('string');

          done();
        });
    });

    it('should fail to get any trip if ther is none that leaves from this origin', (done) => {
      request(app)
        .get('/api/v1/trips?origin=Laos')
        .set('Authorization', `Bearer ${userToken}`)
        .end((err, res) => {
          should.not.exist(err);
          res.status.should.equal(404);
          res.body.should.be.an('object');
          res.body.should.haveOwnProperty('status');
          res.body.should.haveOwnProperty('error');
          const { status, error } = res.body;
          status.should.be.a('string');
          status.should.be.equal('error');
          error.should.be.a('string');
          error.should.equal('There is no available trip from this location');

          done();
        });
    });

    it('should get a trip with destination as stated by the query', (done) => {
      request(app)
        .get('/api/v1/trips?destination=Heaven')
        .set('Authorization', `Bearer ${adminToken}`)
        .end((err, res) => {
          should.not.exist(err);
          res.status.should.equal(200);
          res.body.should.be.an('object');
          res.body.should.haveOwnProperty('status');
          res.body.should.haveOwnProperty('data');
          const { data } = res.body;
          res.body.status.should.be.a('string');
          res.body.status.should.be.equal('success');
          data.should.be.an('array');
          const pos = parseInt(Math.random() * data.length, 10);
          data[pos].should.haveOwnProperty('id');
          data[pos].should.haveOwnProperty('bus_id');
          data[pos].should.haveOwnProperty('origin');
          data[pos].should.haveOwnProperty('destination');
          data[pos].should.haveOwnProperty('trip_date');
          data[pos].should.haveOwnProperty('fare');
          data[pos].should.haveOwnProperty('status');
          const {
            id, bus_id, origin, destination, trip_date, fare, status,
          } = data[pos];

          id.should.be.a('number');
          bus_id.should.be.a('number');
          origin.should.be.a('string');
          origin.should.match(/^[a-zA-Z0-9\s,'-]*$/);
          destination.should.be.a('string');
          destination.should.match(/^[a-zA-Z0-9\s,'-]*$/);
          trip_date.should.be.a('string');
          moment().isValid(trip_date).should.equal(true);
          fare.should.be.a('number');
          status.should.be.a('string');

          done();
        });
    });
  });

  describe('GET /trips: No available trip error', () => {
    before((done) => {
      pool.query('TRUNCATE ONLY trips RESTART IDENTITY CASCADE', (err, res) => {
        if (err) console.error(err);
        if (res) console.log('Truncation is successful.');
      });
      done();
    });
    it('should return an error if no trips are available', (done) => {
      request(app)
        .get('/api/v1/trips').set('Authorization', `Bearer ${adminToken}`)
        .end((err, res) => {
          should.not.exist(err);
          res.status.should.equal(404);
          res.body.should.be.an('object');
          res.body.should.haveOwnProperty('status');
          res.body.should.haveOwnProperty('error');
          const { status, error } = res.body;
          status.should.be.a('string');
          status.should.be.equal('error');
          error.should.be.a('string');
          error.should.equal('There is no available trip');

          done();
        });
    });
  });
});
