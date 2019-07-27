import { Model } from '../model';
import getFreeSeats from '../helper';
import {
  resConflict,
  resInternalServer,
  resSuccess,
  resNull,
  resBadRequest,
} from '../utility/response';
import Validator from '../middleware/validator';

const { bookTripValidator, getTripValidator } = Validator;

class Bookings {
  static busModel() {
    return new Model('buses');
  }

  static tripModel() {
    return new Model('trips');
  }

  static bookModel() {
    return new Model('bookings');
  }

  static userModel() {
    return new Model('users');
  }

  static async bookTrip(req, res) {
    const { error } = bookTripValidator(req.body);
    if (error) {
      const errMessage = error.details.map(err => `${err.path}: ${err.message}`).join('\n');
      return resBadRequest(res, errMessage);
    }

    let { trip_id, seat_number } = req.body;
    const { id, email } = req.user;
    seat_number = Number(seat_number);
    trip_id = Number(trip_id);
    const tripCols = 'id, bus_id, trip_date';
    const bookClause = `WHERE trip_id=${trip_id}`;
    let seatClause = `WHERE trip_id=${trip_id} AND seat_number=${seat_number}`;
    const newBookingsCols = 'trip_id, user_id, seat_number';
    let newBookingsValues = `${trip_id}, ${id}, ${seat_number}`;
    const newBookingsClause = 'RETURNING id, trip_id, user_id, seat_number';
    const userColumn = 'first_name, last_name';

    try {
      // Check if the trip exists
      const tripExist = await Bookings.tripModel().select(tripCols, `WHERE id=${trip_id}`);
      if (!tripExist[0]) {
        return resNull(res, 'Trip is unavailable');
      }
      const { bus_id, trip_date } = tripExist[0];

      // Confirm the uniqueness of the booking
      const bookingsForThisTrip = await Bookings.bookModel().select('*', bookClause);
      const prevBooked = bookingsForThisTrip.find(booking => booking.user_id === id);
      if (prevBooked) {
        return resConflict(res, 'You are already booked for this trip');
      }

      if (Number.isNaN(seat_number)) {
        // Get all booked seats
        const bookedSeats = bookingsForThisTrip.map(book => book.seat_number);
        // Get the capacity of the bus used for this trip
        const busCapacity = await Bookings.busModel().select('capacity', `WHERE id=${bus_id}`);
        const { capacity } = busCapacity[0];
        // Get the number of free seats available on a bus for this trip
        const freeSeats = getFreeSeats(bookedSeats, capacity);
        if (freeSeats.length === 0) {
          return resNull(res, 'There is no free seat on this bus.');
        }
        seat_number = freeSeats.shift();

        seatClause = `WHERE trip_id=${trip_id} AND seat_number=${seat_number}`;
        newBookingsValues = `${trip_id}, ${id}, ${seat_number}`;
      }

      // Check if the seat is available
      const seatAvailable = await Bookings.bookModel().select('*', seatClause);
      if (!prevBooked && seatAvailable[0]) {
        // Get all booked seats
        const bookedSeats = bookingsForThisTrip.map(book => book.seat_number);
        // Get the capacity of the bus used for this trip
        const busCapacity = await Bookings.busModel().select('capacity', `WHERE id=${bus_id}`);
        const { capacity } = busCapacity[0];
        // Get the number of free seats available on a bus for this trip
        const freeSeats = getFreeSeats(bookedSeats, capacity);
        if (freeSeats.length === 0) {
          return resNull(res, 'There is no free seat on this bus.');
        }
        return resConflict(
          res,
          `This seat is already booked. Available seat(s): (${freeSeats.join(', ')})`,
        );
      }
      // Get first_name and last_name
      const user = await Bookings.userModel().select(userColumn, `WHERE id=${id}`);
      const { first_name, last_name } = user[0];
      const booking = await Bookings.bookModel().insert(
        newBookingsCols,
        newBookingsValues,
        newBookingsClause,
      );
      const data = {
        booking_id: booking[0].id,
        user_id: id,
        trip_id,
        bus_id,
        trip_date,
        seat_number,
        first_name,
        last_name,
        email,
      };
      return resSuccess(res, 201, data);
    } catch (err) {
      return resInternalServer(res);
    }
  }

  static async getBookings(req, res) {
    const { error } = getTripValidator(req.body);
    if (error) {
      const errMessage = error.details.map(err => `${err.path}: ${err.message}`).join('\n');
      return resBadRequest(res, errMessage);
    }

    const { id, is_admin } = req.user;
    const columns = `b.id AS booking_id, trip_id, user_id, seat_number, 
    bus_id, trip_date, first_name, last_name, email`;
    const clause = `b
    inner join trips t ON t.id = trip_id
    inner join users u ON u.id = user_id`;

    try {
      if (!is_admin) {
        const data = await Bookings.bookModel().select(columns, `${clause} WHERE user_id=${id}`);
        if (!data[0]) {
          return resNull(res, 'You are not currently booked on any active trip.');
        }
        return resSuccess(res, 200, data);
      }
      const data = await Bookings.bookModel().select(columns, clause);
      if (!data[0]) {
        return resNull(res, 'There is, currently, no active booking on any trip.');
      }
      return resSuccess(res, 200, data);
    } catch (err) {
      return resInternalServer(res);
    }
  }
}

export default Bookings;
