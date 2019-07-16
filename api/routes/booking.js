import express from 'express';
import Bookings from '../controller/booking';
import Authorization from '../middleware/authorization';

const router = express.Router();

/**
 * User can book a seat
 */
router.post('/bookings', Authorization.verifyUser, Bookings.bookTrip);

module.exports = router;
