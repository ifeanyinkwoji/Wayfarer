import chai from 'chai';
import assert from 'assert';
import request from 'supertest';
import faker from 'faker';
import app from '..';
import config from '../config';

const { expect } = chai;
const should = chai.should();

const newUser = {
  email: faker.internet.email(),
  first_name: faker.fake('{{name.firstName}}'),
  last_name: faker.fake('{{name.firstName}}'),
  password: 'Redrum39494',
  confirmPassword: 'Redrum39494',
};

describe('user signup no error', () => {
  it('should successfully signup a user with valid details', (done) => {
    request(app)
      .post('/api/v1/auth/signup')
      .send(newUser)
      .end((err, res) => {
        res.should.haveOwnProperty('status');
        res.status.should.equal(201);
        res.should.haveOwnProperty('headers');
        res.headers.should.be.an('object');
        res.headers.should.haveOwnProperty('authorization');
        res.headers.authorization.should.be.a('string');
        const { body } = res;
        body.should.haveOwnProperty('status');
        body.status.should.equal(201);
        body.should.haveOwnProperty('data');
        const { data } = body;
        data.should.be.an('object');
        data.should.haveOwnProperty('token');
        data.token.should.be.a('string');
        data.should.haveOwnProperty('id');
        data.id.should.be.a('string');
        data.should.haveOwnProperty('email');
        data.email.should.be.a('string');
        data.should.haveOwnProperty('first_name');
        data.first_name.should.be.a('string');
        data.should.haveOwnProperty('last_name');
        data.last_name.should.be.a('string');
        data.should.haveOwnProperty('is_admin');
        data.is_admin.should.be.a('boolean');

        done();
      });
  });
});

describe('user signup email already registered error', () => {
  it('should unsuccessfully signup a user with a registered email', (done) => {
    request(app)
      .post('/api/v1/auth/signup')
      .send(newUser)
      .send(newUser)
      .end((err, res) => {
        const { body } = res;
        expect(res).to.haveOwnProperty('status');
        expect(res.status).to.be.a('number');
        expect(res.status).to.be.equal(409);
        expect(body).to.be.an('object');
        expect(body).to.haveOwnProperty('status');
        expect(body.status).to.be.a('number');
        expect(body.status).to.be.equal(409);
        expect(body).to.haveOwnProperty('error');
        expect(body.error).to.be.equal(`A user has already registered with this email!
Please use another email`);

        done();
      });
  });
});

describe('user signup error invalid last name', () => {
  it('should unsuccessfully signup a user with invalid last name', (done) => {
    newUser.lastName = `. ..@ 
                         \n'''''....`;
    request(app)
      .post('/api/v1/auth/signup')
      .send(newUser)
      .end((err, res) => {
        const { body } = res;
        expect(res).to.haveOwnProperty('status');
        expect(res.status).to.be.a('number');
        expect(res.status).to.be.equal(400);
        expect(body).to.be.an('object');
        expect(body).to.haveOwnProperty('status');
        expect(body.status).to.be.a('number');
        expect(body.status).to.be.equal(400);
        expect(body).to.haveOwnProperty('error');

        done();
      });
  });
});

describe('user signup error improper password', () => {
  it('should unsuccessfully signup a user with improper password', (done) => {
    newUser.password = 're';
    request(app)
      .post('/api/v1/auth/signup')
      .send(newUser)
      .end((err, res) => {
        const { body } = res;
        expect(res).to.haveOwnProperty('status');
        expect(res.status).to.be.a('number');
        expect(res.status).to.be.equal(400);
        expect(body).to.be.an('object');
        expect(body).to.haveOwnProperty('status');
        expect(body.status).to.be.a('number');
        expect(body.status).to.be.equal(400);
        expect(body).to.haveOwnProperty('error');
        expect(body.error).to.be
          .equal(`Password must be 6-20 characters long including at least 1 upper or lower alpha, and 1 digit
Example: Oglocke245`);

        done();
      });
  });
});

describe('user signup error invalid email', () => {
  it('should unsuccessfully signup a user with invalid email', (done) => {
    newUser.email = 'Orlandomynigga';
    request(app)
      .post('/api/v1/auth/signup')
      .send(newUser)
      .end((err, res) => {
        const { body } = res;
        expect(res).to.haveOwnProperty('status');
        expect(res.status).to.be.a('number');
        expect(res.status).to.be.equal(400);
        expect(body).to.be.an('object');
        expect(body).to.haveOwnProperty('status');
        expect(body.status).to.be.a('number');
        expect(body.status).to.be.equal(400);
        expect(body).to.haveOwnProperty('error');
        expect(body.error).to.be.equal(`Please enter a valid email address.
Example 1: "orlando@gmail.com"`);

        done();
      });
  });
});

describe('user signin no error', () => {
  it('should successfully signin a user with a registered email and valid password', (done) => {
    request(app)
      .post('/api/v1/auth/signin')
      .send({ email: config.user, password: config.userPassword })
      .end((err, res) => {
        expect(res).to.be.an('object');
        res.should.haveOwnProperty('status');
        res.status.should.equal(200);
        res.should.haveOwnProperty('headers');
        res.headers.should.be.an('object');
        res.headers.should.haveOwnProperty('authorization');
        res.headers.authorization.should.be.a('string');
        res.headers.authorization.split(' ')[0].should.equal('Bearer');
        const { body } = res;
        body.should.haveOwnProperty('status');
        body.status.should.equal(200);
        body.should.haveOwnProperty('data');
        const { data } = body;
        data.should.be.an('object');
        data.should.haveOwnProperty('token');
        data.token.should.be.a('string');
        data.should.haveOwnProperty('id');
        data.id.should.be.a('string');
        data.should.haveOwnProperty('email');
        data.email.should.be.a('string');
        data.should.haveOwnProperty('is_admin');
        data.is_admin.should.be.a('boolean');

        done();
      });
  });
});

describe('user signin error unregistered email', () => {
  it('should unsuccessfully signin a user with unregistered email', (done) => {
    request(app)
      .post('/api/v1/auth/signin')
      .send({ email: 'martian@gmail.com', password: 'Insane2030' })
      .end((err, res) => {
        expect(res).to.haveOwnProperty('status');
        expect(res.status).to.be.a('number');
        expect(res.status).to.be.equal(401);
        const { body } = res;
        expect(body).to.be.an('object');
        expect(body).to.haveOwnProperty('status');
        expect(body.status).to.be.a('number');
        expect(body.status).to.be.equal(401);
        expect(body).to.haveOwnProperty('error');
        expect(body.error).to.be.equal('Unauthorized access!');

        done();
      });
  });
});

describe('user signin error wrong password', () => {
  it('should unsuccessfully signin a user with a registered email but a wrong password', (done) => {
    request(app)
      .post('/api/v1/auth/signin')
      .send({ email: config.user, password: 'Insane2030' })
      .end((err, res) => {
        const { body } = res;
        expect(res).to.haveOwnProperty('status');
        expect(res.status).to.be.a('number');
        expect(res.status).to.be.equal(401);
        expect(body).to.be.an('object');
        expect(body).to.haveOwnProperty('status');
        expect(body.status).to.be.a('number');
        expect(body.status).to.be.equal(401);
        expect(body).to.haveOwnProperty('error');
        expect(body.error).to.be.equal('Unauthorized access!');

        done();
      });
  });
});

