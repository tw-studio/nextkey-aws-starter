//
// models › NextKeyBenefit.js
//
const { Model } = require('objection')

const knex = require('../db/knex')

Model.knex(knex)

class NextKeyBenefit extends Model {
  static get tableName() {
    return 'nextkey_benefit_data'
  }

  static get idColumn() {
    return ['fk_nextkey_benefit_id', 'attribute']
  }

  static get relationMappings() {
    const NextKeyBenefitMeta = require('./NextKeyBenefitMeta')

    return {
      userMetadata: {
        relation: Model.BelongsToOneRelation,
        modelClass: NextKeyBenefitMeta,
        join: {
          from: 'nextkey_benefit_data.fk_nextkey_benefit_id',
          to: 'nextkey_benefit_meta.nextkey_benefit_id',
        },
      },
    }
  }
}

module.exports = NextKeyBenefit
