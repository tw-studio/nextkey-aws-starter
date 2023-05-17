/* eslint prefer-destructuring: ["error", {"object": true, "array": false}] */
//
// models › NextKeyBenefit.test.js
// test model NextKeyBenefit from table nextkey_benefit_data
//
import NextKeyBenefit from './NextKeyBenefit'

describe('NextKeyBenefit model', () => {

  describe('static properties', () => {

    describe('tableName', () => {

      it('should return "nextkey_benefit_data"', () => {
        expect(NextKeyBenefit.tableName).toEqual('nextkey_benefit_data')
      })
    })

    describe('idColumn', () => {

      it('should return "fk_nextkey_benefit_id"', () => {
        expect(NextKeyBenefit.idColumn).toEqual(['fk_nextkey_benefit_id', 'attribute'])
      })
    })
  })

  describe('columns', () => {

    let tableMetadata

    beforeEach(async () => {
      tableMetadata = await NextKeyBenefit.fetchTableMetadata()
    })

    it('should have three columns', async () => {
      expect(tableMetadata.columns.length).toEqual(3)
    })

    it('should have column "fk_nextkey_benefit_id"', () => {
      expect(tableMetadata.columns).toContain('fk_nextkey_benefit_id')
    })

    it('should have column "attribute"', () => {
      expect(tableMetadata.columns).toContain('attribute')
    })

    it('should have column "value"', () => {
      expect(tableMetadata.columns).toContain('value')
    })
  })

  // describe('WHEN queried', () => {

  //   let queryResult

  //   beforeAll(async () => {
  //     queryResult = await NextKeyBenefit.query()
  //   })

  //   it('should return at least one record (with test data)', () => {
  //     expect(queryResult).not.toBeNull()
  //   })

  //   describe('first record', () => {

  //     let firstRecord

  //     beforeAll(() => {
  //       firstRecord = queryResult[0]
  //     })
  //   })
  // })
})
