import { Router } from 'express';
import { Trips } from '../controller';
import Authorization from '../middleware/authorization';

const router = Router();

const { createTrip, getTrips } = Trips;
const { verifyAdmin, verifyUser } = Authorization;

router.post('/', verifyAdmin, createTrip);

router.get('/', verifyUser, getTrips);

export default router;
