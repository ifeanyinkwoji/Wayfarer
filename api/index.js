import '@babel/polyfill';
import bodyparser from 'body-parser';
import express from 'express';
import morgan from 'morgan';
import routes from './routes';
import { resSuccess, resNull } from './utility/response';
import { log } from './utility';
import { port } from './config';

const app = express();
app.use(morgan('dev'));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.use('/api/v1', routes);

// Home page route
app.get('/api/v1', (req, res) => resSuccess(res, 200, { message: 'Welcome to Wayfarer' }));

app.disable('x-powered-by');

// Handle non-existent route with with a proper message
app.all('*', (req, res) => {
  log(req.url, ' is not valid');
  return resNull(res, 'Wrong request. Route does not exist');
});

const PORT = port || 5000;

app.listen(PORT, () => {
  log(`listening to server on port ${PORT}`);
});

module.exports = app;
