import chai from 'chai';
import assert from 'assert';
import request from 'supertest';
import app from '../';

const { expect } = chai;
const should = chai.should();

describe('Home route', () => {
  it('should get home', (done) => {
    request(app)
      .get('/api/v1')
      .then((res) => {
        res.should.haveOwnProperty('status');
        res.status.should.equal(200);
        res.should.haveOwnProperty('body');
        const { body } = res;
        body.should.be.an('object');
        body.should.haveOwnProperty('status');
        body.status.should.be.a('string');
        body.status.should.equal('success');
        body.should.haveOwnProperty('data');
        const { data } = body;
        data.should.be.an('object');
        data.should.haveOwnProperty('message');
        data.message.should.equal('Welcome to Wayfarer');
 
        done();
      })
      .catch(err => done(err));
  });
});

describe('Home route error', () => {
  it('should return http err code 404', (done) => {
    request(app)
      .get('/api/v1/home')
      .then((res) => {
        res.status.should.equal(404);
        res.body.should.haveOwnProperty('error');
        res.body.error.should.equal('Wrong request. Route does not exist');

        done();
      })
      .catch(err => done(err));
  });
});