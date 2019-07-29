import { Router } from 'express';
import auth from './user';
import trips from './trip';
import bookings from './booking';

const routes = Router();

routes.use('/auth', auth);
routes.use('/trips', trips);
routes.use('/bookings', bookings);

export default routes;
