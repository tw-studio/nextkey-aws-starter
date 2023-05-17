//
// utils › epoch
//

/**
 * Converts JavaScript date object into seconds since Unix epoch.
 * 
 * @param {Object} date Instance of JavaScript date object
 * 
 * @returns {number} Seconds since Unix epoch
 */
function epoch(date) {
  return Math.floor(date.getTime() / 1000)
}

module.exports = epoch
