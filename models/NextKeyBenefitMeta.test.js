/* eslint prefer-destructuring: ["error", {"object": true, "array": false}] */
//
// models › NextKeyBenefitMeta.test.js
// test model NextKeyBenefitMeta from table nextkey_benefit_meta
//
import NextKeyBenefitMeta from './NextKeyBenefitMeta'

describe('NextKeyBenefitMeta model', () => {

  describe('static properties', () => {

    describe('tableName', () => {

      it('should return "nextkey_benefit_meta"', () => {
        expect(NextKeyBenefitMeta.tableName).toEqual('nextkey_benefit_meta')
      })
    })

    describe('idColumn', () => {

      it('should return "nextkey_benefit_id"', () => {
        expect(NextKeyBenefitMeta.idColumn).toEqual('nextkey_benefit_id')
      })
    })
  })

  describe('columns', () => {

    let tableMetadata

    beforeEach(async () => {
      tableMetadata = await NextKeyBenefitMeta.fetchTableMetadata()
    })

    it('should have two columns', async () => {
      expect(tableMetadata.columns.length).toEqual(2)
    })

    it('should have column "nextkey_benefit_id"', () => {
      expect(tableMetadata.columns).toContain('nextkey_benefit_id')
    })

    it('should have column "created_at"', () => {
      expect(tableMetadata.columns).toContain('created_at')
    })
  })

  // describe('WHEN queried', () => {

  //   let queryResult

  //   beforeAll(async () => {
  //     queryResult = await NextKeyBenefitMeta.query()
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
