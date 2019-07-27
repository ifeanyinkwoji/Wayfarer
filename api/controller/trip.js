import { Model } from '../model';
import {
  resConflict,
  resInternalServer,
  resSuccess,
  resNull,
  resBadRequest,
} from '../utility/response';
import Validator from '../middleware/validator';

const { tripValidator } = Validator;

class Trips {
  static tripModel() {
    return new Model('trips');
  }

  static busModel() {
    return new Model('buses');
  }

  static async createTrip(req, res) {
    const { error } = tripValidator(req.body);
    if (error) {
      const errMessage = error.details.map(err => `${err.path}: ${err.message}`).join('\n');
      return resBadRequest(res, errMessage);
    }
    const { bus_id, origin, destination, fare } = req.body;
    const tripCols = 'bus_id, origin, destination, status';
    const tripClause = `WHERE bus_id=${bus_id}`;
    const columns = 'bus_id, origin, destination, fare';
    const values = `${bus_id}, '${origin}', '${destination}', ${fare}`;
    const clause = 'RETURNING *';

    try {
      const busExist = await Trips.busModel().select('*', `WHERE id=${bus_id}`);
      if (!busExist[0]) return resNull(res, 'The bus does not exist on our database');
      const tripWithBusIdExist = await Trips.tripModel().select(tripCols, tripClause);
      if (tripWithBusIdExist[0] && tripWithBusIdExist[0].status === 'active') {
        return resConflict(res, 'The bus is unavailable');
      }
      const makeTrip = await Trips.tripModel().insert(columns, values, clause);
      return resSuccess(res, 201, { ...makeTrip[0] });
    } catch (errors) {
      return resInternalServer(res);
    }
  }

  static async getTrips(req, res) {
    try {
      const { origin, destination } = req.query;
      if (origin) {
        const data = await Trips.tripModel().select('*', `WHERE origin='${origin}'`);
        if (!data[0]) return resNull(res, 'There is no available trip from this location');
        return resSuccess(res, 200, data);
      }
      if (destination) {
        const data = await Trips.tripModel().select('*', `WHERE destination='${destination}'`);
        if (!data[0]) return resNull(res, 'There is no available trip to this destination');
        return resSuccess(res, 200, data);
      }

      const data = await Trips.tripModel().select('*');
      if (!data[0]) return resNull(res, 'There is no available trip');
      return resSuccess(res, 200, data);
    } catch (error) {
      return resInternalServer(res);
    }
  }
}

export default Trips;
