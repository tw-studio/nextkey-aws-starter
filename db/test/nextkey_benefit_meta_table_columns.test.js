/* eslint-disable */
//
// nextkey_benefit_meta_table_columns.test.js
// Test nextkey_benefit_meta table columns
//
const knex = require('../knex')

describe('nextkey_benefit_meta table', () => {
  
  // Set up test suite
  
  const schemaName = 'public'
  const tableName = 'nextkey_benefit_meta'

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

    it('should have column "nextkey_benefit_id"', () => {
      expect(Object.keys(columnInfo)).toContain('nextkey_benefit_id')
    })

    it('should have column "created_at"', () => {
      expect(Object.keys(columnInfo)).toContain('created_at')
    })

    describe('nextkey_benefit_id column', () => {

      const nextkeyBenefitId = 'nextkey_benefit_id'

      it('should be type uuid', () => {
        expect(columnInfo[nextkeyBenefitId].type).toEqual('uuid')
      })

      it('should have no max length', () => {
        expect(columnInfo[nextkeyBenefitId].maxLength).toBeNull()
      })

      it('should not be nullable', () => {
        expect(columnInfo[nextkeyBenefitId].nullable).toBeFalse()
      })

      it('should have a default value', () => {
        expect(columnInfo[nextkeyBenefitId].defaultValue).not.toBeNull()
      })
    })

    describe('created_at column', () => {

      const createdAt = 'created_at'

      it('should be type timestamp with time zone', () => {
        expect(columnInfo[createdAt].type).toEqual('timestamp with time zone')
      })

      it('should have no max length', () => {
        expect(columnInfo[createdAt].maxLength).toBeNull()
      })
      
      it('should not be nullable', () => {
        expect(columnInfo[createdAt].nullable).toBeFalse()
      })

      it('should have a default value', () => {
        expect(columnInfo[createdAt].defaultValue).not.toBeNull()
      })
    })
  })
})
