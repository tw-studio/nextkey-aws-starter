/* eslint-disable */
//
// nextkey_benefit_data_table_columns.test.js
// Test nextkey_benefit_data table columns
//
const knex = require('../knex')

describe('nextkey_benefit_data table', () => {
  
  // Set up test suite
  
  const schemaName = 'public'
  const tableName = 'nextkey_benefit_data'

  afterAll(() => {
    knex.destroy()
  })

  it('should exist in schema "public"', () => {
    return expect(knex.schema.withSchema(schemaName).hasTable(tableName)).resolves.toBeTrue()
  })

  describe('columns', () => {

    let columnInfo
    
    beforeAll(async () => {
      columnInfo = await knex(tableName).columnInfo()
    })

    it('should have column "fk_nextkey_benefit_id"', () => {
      expect(Object.keys(columnInfo)).toContain('fk_nextkey_benefit_id')
    })

    it('should have column "attribute"', () => {
      expect(Object.keys(columnInfo)).toContain('attribute')
    })
    
    it('should have column "value"', () => {
      expect(Object.keys(columnInfo)).toContain('value')
    })

    describe('fk_nextkey_benefit_id column', () => {

      const fkNextkeyBenefitId = 'fk_nextkey_benefit_id'

      it('should be type uuid', () => {
        expect(columnInfo[fkNextkeyBenefitId].type).toEqual('uuid')
      })

      it('should have no max length', () => {
        expect(columnInfo[fkNextkeyBenefitId].maxLength).toBeNull()
      })

      it('should not be nullable', () => {
        expect(columnInfo[fkNextkeyBenefitId].nullable).toBeFalse()
      })

      it('should not have a default value', () => {
        expect(columnInfo[fkNextkeyBenefitId].defaultValue).toBeNull()
      })
    })

    describe('attribute column', () => {

      const attribute = 'attribute'

      it('should be type text', () => {
        expect(columnInfo[attribute].type).toEqual('text')
      })

      it('should have no max length', () => {
        expect(columnInfo[attribute].maxLength).toBeNull()
      })
      
      it('should not be nullable', () => {
        expect(columnInfo[attribute].nullable).toBeFalse()
      })

      it('should not have a default value', () => {
        expect(columnInfo[attribute].defaultValue).toBeNull()
      })
    })

    describe('value column', () => {

      const value = 'value'

      it('should be type jsonb', () => {
        expect(columnInfo[value].type).toEqual('jsonb')
      })

      it('should have no max length', () => {
        expect(columnInfo[value].maxLength).toBeNull()
      })
      
      it('should not be nullable', () => {
        expect(columnInfo[value].nullable).toBeFalse()
      })

      it('should not have a default value', () => {
        expect(columnInfo[value].defaultValue).toBeNull()
      })
    })
  })
})
