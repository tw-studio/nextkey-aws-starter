//
// format-date-relative-to-now.test.js
//
import { DateTime, Duration } from 'luxon'

import formatDateRelativeToNow from './format-date-relative-to-now'

describe('formatDateRelativeToNow', () => {
  
  describe('WHEN given non-luxon DateTime object', () => {

    it('should return undefined', () => {
      expect(formatDateRelativeToNow(123)).toBe(undefined)
      expect(formatDateRelativeToNow(true)).toBe(undefined)
      expect(formatDateRelativeToNow('abc')).toBe(undefined)
      expect(formatDateRelativeToNow(['a', 'b'])).toBe(undefined)
      expect(formatDateRelativeToNow(() => {})).toBe(undefined)
      expect(formatDateRelativeToNow('2022-10-12')).toBe(undefined)
    })
  })

  describe('EVEN WHEN given postgresql datetime format string', () => {

    it('should return undefined', () => {
      expect(formatDateRelativeToNow('2019-12-23 14:39:53.662522-05')).toBe(undefined)
    })
  })

  describe('WHEN given luxon DateTime representing now', () => {

    let nowDateTime

    beforeAll(() => { nowDateTime = DateTime.now() }) // not robust for beforeEach
    afterAll(() => { nowDateTime = null })

    it('should return a string', () => {
      expect(typeof formatDateRelativeToNow(nowDateTime)).toBe('string')
    })

    it('should return a weekdayShort (e.g. Wed) (assumes en-US)', () => {
      expect(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
        .toContain(formatDateRelativeToNow(nowDateTime))
    })
  })

  describe('WHEN given DateTime of yesterday', () => {

    it('should return a weekdayShort (e.g. Tue) (assumes en-US)', () => {
      const yesterdayDateTime = DateTime.now().minus(Duration.fromObject({ days: 1 }))

      expect(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
        .toContain(formatDateRelativeToNow(yesterdayDateTime))
    })
  })

  describe('WHEN given DateTime of 5 days, 23 hours, 59 minutes ago', () => {

    it('should return a weekdayShort', () => {
      const almostSixDaysAgo = DateTime.now().minus(Duration.fromObject({
        days: 5,
        hours: 23,
        minutes: 59,
      }))

      expect(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
        .toContain(formatDateRelativeToNow(almostSixDaysAgo))
    })
  })

  describe('WHEN given DateTime of 6 days ago', () => {

    let sixDaysAgo

    beforeEach(() => {
      sixDaysAgo = DateTime.now().minus(Duration.fromObject({ days: 6 }))
    })
    afterEach(() => { sixDaysAgo = null })

    it('should return a string', () => {
      expect(typeof formatDateRelativeToNow(sixDaysAgo)).toBe('string')
    })

    it('should return a string with exactly one space', () => {
      expect((formatDateRelativeToNow(sixDaysAgo).match(/ /g) || []).length).toBe(1)
    })

    it('should return an alphabetical first word and numerical second word', () => {
      const regex = /^[A-Z][a-z][a-z] [1-9][0-9]?$/g
      expect(formatDateRelativeToNow(sixDaysAgo)).toMatch(regex)
    })

    it('should have a short month as its first word', () => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', // eslint-disable-line
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] // eslint-disable-line

      expect(months).toContain(formatDateRelativeToNow(sixDaysAgo).split(' ')[0])
    })

    it('should have a day of the month number (e.g. 23) as its second word', () => {
      expect([...Array(31).keys()])
        .toContain(parseInt(formatDateRelativeToNow(sixDaysAgo).split(' ')[1], 10))
    })
  })

  describe('WHEN given DateTime of 363 days, 23 hours, 59 minutes ago', () => {

    let almostOneYearAgo

    beforeEach(() => {
      almostOneYearAgo = DateTime.now().minus(Duration.fromObject({
        days: 363, hours: 23, minutes: 59,
      }))
    })
    afterEach(() => { almostOneYearAgo = null })

    it('should return an alphabetical first word and numerical second word', () => {
      const regex = /^[A-Z][a-z][a-z] [1-9][0-9]?$/g
      expect(formatDateRelativeToNow(almostOneYearAgo)).toMatch(regex)
    })

    it('should have a short month as its first word', () => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', // eslint-disable-line
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] // eslint-disable-line

      expect(months).toContain(formatDateRelativeToNow(almostOneYearAgo).split(' ')[0])
    })
    
    it('should have a day of the month number (e.g. 23) as its second word', () => {
      expect([...Array(31).keys()])
        .toContain(parseInt(formatDateRelativeToNow(almostOneYearAgo).split(' ')[1], 10))
    })
  })

  describe('WHEN given DateTime of 364 days ago', () => {

    it('should return "1y ago"', () => {
      const threeSixtyFourDaysAgo = DateTime.now().minus(Duration.fromObject({ days: 364 }))

      expect(formatDateRelativeToNow(threeSixtyFourDaysAgo)).toBe('1y ago')
    })
  })

  describe('WHEN given DateTime of 366 days ago', () => {

    it('should return "1y ago"', () => {
      const threeSixtySixDaysAgo = DateTime.now().minus(Duration.fromObject({ days: 364 }))

      expect(formatDateRelativeToNow(threeSixtySixDaysAgo)).toBe('1y ago')
    })
  })

  describe('WHEN given DateTime of 2 years ago', () => {

    it('should return "2y ago"', () => {
      const twoYearsAgo = DateTime.now().minus(Duration.fromObject({ years: 2 }))

      expect(formatDateRelativeToNow(twoYearsAgo)).toBe('2y ago')
    })
  })
})
