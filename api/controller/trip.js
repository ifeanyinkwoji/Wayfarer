import model from '../model';
import validator from '../middleware/validator';

class Trips {
  static tripModel() {
    return new model.Model('trips');
  }

  static busModel() {
    return new model.Model('buses');
  }

  static async createTrip(req, res) {
    console.log(req.body.token);
    const { error } = validator.tripValidator(req.body);
    if (error) {
      return res.status(400).json({
        status: 'error',
        error: error.details[0].message,
      });
    }
    const {
      bus_id, origin, destination, fare,
    } = req.body;
    const tripColumns = 'bus_id, origin, destination, status';
    const tripClause = `WHERE bus_id='${bus_id}'`;
    const columns = 'bus_id, origin, destination, fare';
    const values = `'${bus_id}', '${origin}', '${destination}', ${fare}`;
    const clause = 'RETURNING *';

    try {
      const availableBus = await Trips.busModel().select('*', `WHERE id='${bus_id}'`);
      if (!availableBus[0]) {
        return res.status(404).json({
          status: 'error',
          error: 'No bus with this id is found',
        });
      }
      const tripExist = await Trips.tripModel().select(tripColumns, tripClause);
      console.log(tripExist);
      if (tripExist[0] && tripExist[0].status === 'active') {
        return res.status(409).json({
          status: 'error',
          error: 'This trip has already been created',
        });
      }
      const createTrip = await Trips.tripModel().insert(columns, values, clause);
      const data = { ...createTrip[0] };
      data.fare = parseFloat(data.fare).toFixed(2);
      return res.status(201).json({
        status: 'success',
        data,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({
        status: 'error',
        error: 'Internal server error',
      });
    }
  }

  static async getAllTrips(req, res) {
    try {
      const data = await Trips.tripModel().select('*');
      if (!data[0]) {
        return res.status(404).json({
          status: 'error',
          error: 'There is no available trip',
        });
      }

      return res.status(200).json({
        status: 'success',
        data,
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        error: 'Internal server error',
      });
    }
  }
}

module.exports = Trips;
