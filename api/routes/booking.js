import express from 'express';
import { Bookings } from '../controller';
import Authorization from '../middleware/authorization';

const router = express.Router();

const { verifyUser } = Authorization;
/**
 * User can book a seat
 */
router.post('/', verifyUser, Bookings.bookTrip);
router.get('/', verifyUser, Bookings.getBookings);

module.exports = router;
