import chai from 'chai';
import chaiJWT from 'chai-jwt';
import chaiMATCH from 'chai-match';
import assert from 'assert';
import request from 'supertest';

import app from '..';
import { userPassword, jwtKey } from '../config';

chai.use(chaiJWT);
chai.use(chaiMATCH);
const should = chai.should();

describe('POST auth/signup', () => {
  it('should successfully register a user', (done) => {
    const newUser = {
      first_name: 'Mack',
      last_name: 'Ten',
      email: 'mack10@bullets.com',
      password: userPassword,
      confirmPassword: userPassword,
    };
    request(app)
      .post('/api/v1/auth/signup')
      .send(newUser)
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(201);
        res.body.should.be.an('object');
        res.body.should.haveOwnProperty('status');
        res.body.should.haveOwnProperty('data');
        const { status, data } = res.body;
        status.should.be.a('string');
        status.should.be.equal('success');
        data.should.be.an('object');
        data.should.haveOwnProperty('token');
        data.should.haveOwnProperty('id');
        data.should.haveOwnProperty('first_name');
        data.should.haveOwnProperty('last_name');
        data.should.haveOwnProperty('email');
        data.should.haveOwnProperty('is_admin');
        const {
          token, id, first_name, last_name, email, is_admin,
        } = data;
        token.should.be.a('string');
        token.should.be.a.jwt;
        token.should.be.signedWith(jwtKey);
        id.should.be.a('number');
        email.should.be.a('string');
        email.should.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        first_name.should.be.a('string');
        last_name.should.be.a('string');
        is_admin.should.be.a('boolean');

        done();
      });
  });

  it('should fail to register a user that already exists on the database', (done) => {
    const newUser = {
      first_name: 'Loki',
      last_name: 'Odinson',
      email: 'loki@ragnarok.com',
      password: userPassword,
      confirmPassword: userPassword,
    };
    request(app)
      .post('/api/v1/auth/signup')
      .send(newUser)
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
        error.should.equal('A user with this email already exists');

        done();
      });
  });

  it('should fail to register a user if first name is missing', (done) => {
    const newUser = {
      last_name: 'Cube',
      email: 'ice@cube.com',
      password: userPassword,
      confirmPassword: userPassword,
    };
    request(app)
      .post('/api/v1/auth/signup')
      .send(newUser)
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
        error.should.equal('first_name: Enter firstname. It must be alphanumerical');

        done();
      });
  });

  it('should fail to register a user if last name is missing', (done) => {
    const newUser = {
      first_name: 'Ice',
      email: 'ice@cube.com',
      password: userPassword,
      confirmPassword: userPassword,
    };
    request(app)
      .post('/api/v1/auth/signup')
      .send(newUser)
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
        error.should.equal('last_name: Enter lastname. It must be alphanumerical');

        done();
      });
  });

  it('should fail to register a user if email is missing', (done) => {
    const newUser = {
      first_name: 'Ice',
      last_name: 'Cube',
      password: userPassword,
      confirmPassword: userPassword,
    };
    request(app)
      .post('/api/v1/auth/signup')
      .send(newUser)
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
        error.should.equal('email: Please enter a valid email address.\nExample 1: "orlando@gmail.com"');

        done();
      });
  });

  it('should fail to register a user if password is missing', (done) => {
    const newUser = {
      first_name: 'Ice',
      last_name: 'Cube',
      email: 'ice@cube.com',
      confirmPassword: userPassword,
    };
    request(app)
      .post('/api/v1/auth/signup')
      .send(newUser)
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
        error.should.equal('password: Password must be 6-20 characters long including at least 1 upper or lower alpha, and 1 digit\nExample: Oglocke245\nconfirmPassword: "confirmPassword" must match password');

        done();
      });
  });
});

describe('POST auth/signin', () => {
  it('should signin successfully', (done) => {
    const user = {
      email: 'thor@ragnarok.com',
      password: userPassword,
    };
    request(app)
      .post('/api/v1/auth/signin')
      .send(user)
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(200);
        res.body.should.be.an('object');
        res.body.should.haveOwnProperty('status');
        res.body.should.haveOwnProperty('data');
        const { status, data } = res.body;
        status.should.be.a('string');
        status.should.be.equal('success');
        data.should.be.an('object');
        data.should.haveOwnProperty('token');
        data.should.haveOwnProperty('id');
        data.should.haveOwnProperty('first_name');
        data.should.haveOwnProperty('last_name');
        data.should.haveOwnProperty('email');
        data.should.haveOwnProperty('is_admin');
        const {
          token, id, first_name, last_name, email, is_admin,
        } = data;
        token.should.be.a('string');
        token.should.be.a.jwt;
        token.should.be.signedWith(jwtKey);
        id.should.be.a('number');
        email.should.be.a('string');
        email.should.match(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
        first_name.should.be.a('string');
        last_name.should.be.a('string');
        is_admin.should.be.a('boolean');

        done();
      });
  });

  it('should fail to signin a user that does not exist on the database', (done) => {
    const user = {
      email: 'kratos@olympus.com',
      password: 'spearOfDestiny1000',
    };
    request(app)
      .post('/api/v1/auth/signin')
      .send(user)
      .end((err, res) => {
        should.not.exist(err);
        res.status.should.equal(401);
        res.body.should.be.an('object');
        res.body.should.haveOwnProperty('status');
        res.body.should.haveOwnProperty('error');
        const { status, error } = res.body;
        status.should.be.a('string');
        status.should.be.equal('error');
        error.should.be.a('string');
        error.should.equal('Invalid Signin Details');

        done();
      });
  });

  it('should fail to signin if email is missing', (done) => {
    const user = {
      password: userPassword,
    };
    request(app)
      .post('/api/v1/auth/signin')
      .send(user)
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
        error.should.equal('email: Please enter a valid email address.\nExample 1: "orlando@gmail.com"');

        done();
      });
  });

  it('should fail to signin if email is invalid', (done) => {
    const user = {
      email: 'thor@ragnarokcom',
      password: userPassword,
    };
    request(app)
      .post('/api/v1/auth/signin')
      .send(user)
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
        error.should.equal('email: Please enter a valid email address.\nExample 1: "orlando@gmail.com"');

        done();
      });
  });

  it('should fail to signin if password is missing', (done) => {
    const user = {
      email: 'thor@ragnarok.com',
    };
    request(app)
      .post('/api/v1/auth/signin')
      .send(user)
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
        error.should.equal('password: Please Input your password!');

        done();
      });
  });
});
