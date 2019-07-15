import express from 'express';
import Trips from '../controller/trip';
import Authorization from '../middleware/authorization';

const router = express.Router();

/**
 * Admin can create trips
 */
router.post('/trips', Authorization.verifyAdmin, Trips.createTrip);
router.get('/trips', Authorization.verifyUser, Trips.getAllTrips);

module.exports = router;
