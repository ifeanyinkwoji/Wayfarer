/**
 * @description Calculates the available seats left on a bus
 * @param {array} array Array of already booked seats
 * @param {Number} cap Bus capacity
 */
const freeSeats = (array, cap) => {
  const allSeats = Array.from({ length: cap }, (v, i) => i + 1);
  array.forEach((el) => {
    for (let i = 0; i < allSeats.length; i += 1) {
      if (allSeats[i] === el) {
        allSeats.splice(i, 1);
      }
    }
  });
  return allSeats;
};

module.exports = freeSeats;
