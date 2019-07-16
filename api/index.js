import '@babel/polyfill';
import morgan from 'morgan';
import express from 'express';
import bodyparser from 'body-parser';
import config from './config';
import routes from './routes';

const { port } = config;

const app = express();

app.use(morgan('dev'));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());


// Home page route
app.get('/api/v1', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      message: 'Welcome to Wayfarer',
    },
  });
});


app.disable('x-powered-by');

/**
 * API routes
 */
app.use('/api/v1', routes.user);
app.use('/api/v1', routes.trip);
app.use('/api/v1', routes.booking);

// Handle non-existent route with with a proper message
app.all('*', (req, res) => {
  console.log(req.url, ' is not valid');
  res.status(404).json({
    status: 'error',
    error: 'Wrong request. Route does not exist',
  });
});

const PORT = port || 5000;

app.listen(PORT, () => {
  console.log(`listening to server on port ${PORT}`);
});

module.exports = app;
