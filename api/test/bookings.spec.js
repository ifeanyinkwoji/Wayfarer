import chai from 'chai';
import chaiJWT from 'chai-jwt';
import chaiMATCH from 'chai-match';
import moment from 'moment';
import assert from 'assert';
import request from 'supertest';
import { pool } from '../model';

import app from '..';
import {
  adminEmail, adminPassword, userEmail, user2Email, userPassword, jwtKey,
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

const user2 = {
  email: user2Email,
  password: userPassword,
};

let adminToken;
let userToken;
let user2Token;

describe('POST /bookings', () => {
  before('Get user token for the test', (done) => {
    request(app)
      .post('/api/v1/auth/signin')
      .send(user)
      .end((err, res) => {
        userToken = res.body.data.token;

        done();
      });
  });

  before('Get user2 token for the test', (done) => {
    request(app)
      .post('/api/v1/auth/signin')
      .send(user2)
      .end((err, res) => {
        user2Token = res.body.data.token;

        done();
      });
  });

  it('should successfully book a trip without specifying a seat number', (done) => {
    const newBooking = {
      trip_id: 1,
    };
    request(app)
      .post('/api/v1/bookings')
      .send(newBooking)
      .set('Authorization', `Bearer ${userToken}`)
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
        data.should.haveOwnProperty('booking_id');
        data.should.haveOwnProperty('user_id');
        data.should.haveOwnProperty('trip_id');
        data.should.haveOwnProperty('bus_id');
        data.should.haveOwnProperty('trip_date');
        data.should.haveOwnProperty('seat_number');
        data.should.haveOwnProperty('first_name');
        data.should.haveOwnProperty('last_name');
        data.should.haveOwnProperty('email');
        const {
          booking_id,
          user_id,
          trip_id,
          bus_id,
          trip_date,
          seat_number,
          first_name,
          last_name,
          email,
        } = data;

        booking_id.should.be.a('number');
        user_id.should.be.a('number');
        trip_id.should.be.a('number');
        bus_id.should.be.a('number');
        trip_date.should.be.a('string');
        moment()
          .isValid(trip_date)
          .should.equal(true);
        first_name.should.be.a('string');
        last_name.should.be.a('string');
        email.should.be.a('string');
        email.should.match(
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );

        done();
      });
  });

  it('should successfully book a trip with user specifying a seat number', (done) => {
    const newBooking = {
      trip_id: 2,
      seat_number: 1,
    };
    request(app)
      .post('/api/v1/bookings')
      .send(newBooking)
      .set('Authorization', `Bearer ${userToken}`)
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
        data.should.haveOwnProperty('booking_id');
        data.should.haveOwnProperty('user_id');
        data.should.haveOwnProperty('trip_id');
        data.should.haveOwnProperty('bus_id');
        data.should.haveOwnProperty('trip_date');
        data.should.haveOwnProperty('seat_number');
        data.should.haveOwnProperty('first_name');
        data.should.haveOwnProperty('last_name');
        data.should.haveOwnProperty('email');
        const {
          booking_id,
          user_id,
          trip_id,
          bus_id,
          trip_date,
          seat_number,
          first_name,
          last_name,
          email,
        } = data;

        booking_id.should.be.a('number');
        user_id.should.be.a('number');
        trip_id.should.be.a('number');
        bus_id.should.be.a('number');
        trip_date.should.be.a('string');
        moment()
          .isValid(trip_date)
          .should.equal(true);
        first_name.should.be.a('string');
        last_name.should.be.a('string');
        email.should.be.a('string');
        email.should.match(
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );

        done();
      });
  });

  it('should throw error if seat is already booked by another user', (done) => {
    const newBooking = {
      trip_id: 2,
      seat_number: 1,
    };
    request(app)
      .post('/api/v1/bookings')
      .send(newBooking)
      .set('Authorization', `Bearer ${user2Token}`)
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
        error.should.match(/This seat is already booked. Available seat\(s\): \((\d\,\s)*/);

        done();
      });
  });

  it('should throw error if user is booked on same trip', (done) => {
    const newBooking = {
      trip_id: 2,
      seat_number: 1,
    };
    request(app)
      .post('/api/v1/bookings')
      .send(newBooking)
      .set('Authorization', `Bearer ${userToken}`)
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
        error.should.equal('You are already booked for this trip');

        done();
      });
  });

  it('should throw error if trip_id is not specified', (done) => {
    const newBooking = {
      seat_number: 11,
    };
    request(app)
      .post('/api/v1/bookings')
      .send(newBooking)
      .set('Authorization', `Bearer ${userToken}`)
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
        error.should.equal('trip_id: Please enter a valid bus id. The trip_id should be an integer that equals 1 or is greater.');

        done();
      });
  });

  it('should throw error if seat_number is of the wrong format', (done) => {
    const newBooking = {
      trip_id: 2,
      seat_number: 'one',
    };
    request(app)
      .post('/api/v1/bookings')
      .send(newBooking)
      .set('Authorization', `Bearer ${userToken}`)
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
        error.should.equal('seat_number: Please enter the  seat number. The seat number should be an integer that equals 1 or is greater.');

        done();
      });
  });
});

describe('GET /bookings', () => {
  before('Get adminToken for the test', (done) => {
    request(app)
      .post('/api/v1/auth/signin')
      .send(admin)
      .end((err, res) => {
        adminToken = res.body.data.token;

        done();
      });
  });

  it('should successfully get all bookings', () => {
    request(app)
      .get('/api/v1/bookings')
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
        data[pos].should.haveOwnProperty('booking_id');
        data[pos].should.haveOwnProperty('user_id');
        data[pos].should.haveOwnProperty('trip_id');
        data[pos].should.haveOwnProperty('bus_id');
        data[pos].should.haveOwnProperty('trip_date');
        data[pos].should.haveOwnProperty('seat_number');
        data[pos].should.haveOwnProperty('first_name');
        data[pos].should.haveOwnProperty('last_name');
        data[pos].should.haveOwnProperty('email');
        const {
          booking_id,
          user_id,
          trip_id,
          bus_id,
          trip_date,
          seat_number,
          first_name,
          last_name,
          email,
        } = data[pos];

        booking_id.should.be.a('number');
        user_id.should.be.a('number');
        trip_id.should.be.a('number');
        bus_id.should.be.a('number');
        trip_date.should.be.a('string');
        moment()
          .isValid(trip_date)
          .should.equal(true);
        first_name.should.be.a('string');
        last_name.should.be.a('string');
        email.should.be.a('string');
        email.should.match(
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );
      });
  });

  it('should successfully get all bookings for a particular user', () => {
    request(app)
      .get('/api/v1/bookings')
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
        data[pos].should.haveOwnProperty('booking_id');
        data[pos].should.haveOwnProperty('user_id');
        data[pos].should.haveOwnProperty('trip_id');
        data[pos].should.haveOwnProperty('bus_id');
        data[pos].should.haveOwnProperty('trip_date');
        data[pos].should.haveOwnProperty('seat_number');
        data[pos].should.haveOwnProperty('first_name');
        data[pos].should.haveOwnProperty('last_name');
        data[pos].should.haveOwnProperty('email');
        const {
          booking_id,
          user_id,
          trip_id,
          bus_id,
          trip_date,
          seat_number,
          first_name,
          last_name,
          email,
        } = data[pos];

        booking_id.should.be.a('number');
        user_id.should.be.a('number');
        trip_id.should.be.a('number');
        bus_id.should.be.a('number');
        trip_date.should.be.a('string');
        moment()
          .isValid(trip_date)
          .should.equal(true);
        first_name.should.be.a('string');
        last_name.should.be.a('string');
        email.should.be.a('string');
        email.should.match(
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        );
      });
  });
});
