//
// format-date-relative-to-now.js
//
import { DateTime, Interval } from 'luxon'

/**
 * Formats a past luxon DateTime as a friendly datetime string relative to now.
 * 
 * Requires DateTime and Interval from 'luxon'
 * @requires luxon
 * 
 * @param {Object} pastDateTime Earlier DateTime to format
 * 
 * @returns {string|undefined} Formatted relative datetime string defined as:
 *  - Day of week, e.g. Wed (within last week, including today)
 *  - Short datetime, e.g. Mar 8 (within last year)
 *  - Years ago, e.g. 2y ago (over a year ago)
 */
export default function formatDateRelativeToNow(pastDateTime) {
  
  // |0| Guard
  
  if (!DateTime.isDateTime(pastDateTime)) { return undefined }

  // |1| Calculate constants

  let formattedRelativeDateTime = ''
  const nowDateTime = DateTime.now()
  const interval = Interval.fromDateTimes(pastDateTime, nowDateTime)
  const intervalDurationInDays = interval.toDuration('days').toObject().days
  const intervalDurationInDaysFloat = parseFloat(intervalDurationInDays)
  const intervalDurationInYears = interval.toDuration('years').toObject().years
  const intervalDurationInYearsInt = parseInt(intervalDurationInYears, 10)

  // |2| Format differently by duration ago

  if (!intervalDurationInDaysFloat) { return undefined }
  if (intervalDurationInDaysFloat < 6) {
    formattedRelativeDateTime = pastDateTime.weekdayShort
  } else if (intervalDurationInDaysFloat < 364) {
    formattedRelativeDateTime = `${pastDateTime.monthShort} ${pastDateTime.day}`
  } else {
    formattedRelativeDateTime = `${Math.max(intervalDurationInYearsInt, 1)}y ago`
  }

  // |3| Return formatted string

  if (formattedRelativeDateTime === '') { return undefined }
  return formattedRelativeDateTime
}
