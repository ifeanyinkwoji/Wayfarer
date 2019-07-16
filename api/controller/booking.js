import model from '../model';
import freeSeats from '../helper/seats';
import validator from '../middleware/validator';

/**
 * @description describes the methods for all booking endpoints
 */
class Bookings {
  /**
   * @description Creates the bookings, trips,
   * users and buses Model instance
   */
  static bookModel() {
    return new model.Model('bookings');
  }

  static tripModel() {
    return new model.Model('trips');
  }

  static userModel() {
    return new model.Model('users');
  }

  static busModel() {
    return new model.Model('buses');
  }

  /**
   * @description Creates a booking on a trip
   * @param {object} req request object
   * @param {object} res response object
   * @returns {object} JSON response
   */
  static async bookTrip(req, res) {
    const { error } = validator.bookTripValidator(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        error: error.details[0].message,
      });
    }

    let { trip_id, seat_number } = req.body;
    const { id, email } = req.user;
    seat_number = Number(seat_number);
    const tripColumns = 'id, bus_id, trip_date';
    const bookClause = `WHERE trip_id='${trip_id}'`;
    const idEqTripId = `WHERE id='${trip_id}'`;

    const idEqId = `WHERE id='${id}'`;
    const seatClause = `WHERE trip_id='${trip_id}' AND seat_number=${seat_number}`;
    const mbColumns = 'trip_id, user_id, seat_number';
    const mbValues = `'${trip_id}','${id}', ${seat_number}`;
    const mbClause = 'RETURNING id, trip_id, user_id, seat_number';
    const userColumn = 'first_name, last_name';


    try {
      // Check if the trip exists

      const trip = await Bookings.tripModel().select(tripColumns, idEqTripId);
      if (!trip[0]) {
        return res.status(404).json({
          status: 'error',
          error: 'This trip is unavailable',
        });
      }
      const { bus_id, trip_date } = trip[0];
      const idEqBusId = `WHERE id='${bus_id}'`;
      const bookExists = await Bookings.bookModel().select('*', bookClause);

      const booked = bookExists.find(el => el.user_id === id);
      if (booked) {
        return res.status(409).json({
          status: 'error',
          error: 'You are already booked for this trip',
        });
      }
      const user = await Bookings.userModel().select(userColumn, idEqId);

      const { first_name, last_name } = user[0];
      switch (false) {
        case !seat_number: {
          const seatExists = await Bookings.bookModel().select('*', seatClause);
          if (!booked && seatExists[0]) {
            const occupiedSeats = bookExists.map(book => book.seat_number);
            const busCap = await Bookings.busModel().select('capacity', idEqBusId);
            const { capacity } = busCap[0];
            const availableSeats = freeSeats(occupiedSeats, capacity);
            if (availableSeats.length === 0) {
              return res.status(404).json({
                status: 'error',
                error: 'All the seats on this trip are already booked',
              });
            }
            return res.status(409).json({
              status: 'error',
              error: `Seat is already booked. Available seat(s): (${availableSeats.join(', ')})`,
            });
          }
          const booking = await Bookings.bookModel().insert(mbColumns, mbValues, mbClause);
          const data = {
            id: booking[0].id,
            user_id: id,
            trip_id,
            bus_id,
            trip_date,
            seat_number,
            first_name,
            last_name,
            email,
          };
          return res.status(201).json({
            status: 'success',
            data,
          });
        }

        default: {
          const seats = await Bookings.bookModel().select(
            'seat_number',
            `WHERE trip_id='${trip_id}'`,
          );
          seat_number = seats.length + 1;
          const defaultValues = `'${trip_id}','${id}', ${seat_number}`;
          const booking = await Bookings.bookModel().insert(mbColumns, defaultValues, mbClause);
          const data = {
            id: booking[0].id,
            user_id: id,
            trip_id,
            bus_id,
            trip_date,
            seat_number,
            first_name,
            last_name,
            email,
          };

          return res.status(201).json({
            status: 'success',
            data,
          });
        }
      }
    } catch (err) {
      console.log(err.stack);
      return res.status(500).json({
        status: 'error',
        error: 'Internal server error',
      });
    }
  }
}

module.exports = Bookings;
