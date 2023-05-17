//
// models › NextKeyBenefitMeta.js
//
const { Model } = require('objection')

const knex = require('../db/knex')

Model.knex(knex)

class NextKeyBenefitMeta extends Model {
  static get tableName() {
    return 'nextkey_benefit_meta'
  }

  static get idColumn() {
    return 'nextkey_benefit_id'
  }
  
  static get relationMappings() {
    const NextKeyBenefit = require('./NextKeyBenefit')

    return {
      nextKeyBenefitData: {
        relation: Model.HasManyRelation,
        modelClass: NextKeyBenefit,
        join: {
          from: 'nextkey_benefit_meta.user_id',
          to: 'nextkey_benefit_data.fk_user_id',
        },
      },
    }
  }
}

module.exports = NextKeyBenefitMeta
