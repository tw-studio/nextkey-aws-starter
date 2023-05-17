//
// development.flags.js
//
// Flag names must start with 'FLAG_'
// Values must be 'on' or 'off'
//
const flagsDevelopment = {
  NEXT_PUBLIC_FLAG_DEBUG_FONTS: 'on',
  NEXT_PUBLIC_FLAG_DEBUG_MASTER: 'on',
  FLAG_INLINE_MORE: 'off',
  FLAG_TEST_ON_IN_PRODUCTION: 'off',
  FLAG_TEST_ON_IN_DEVELOPMENT: 'on',
  FLAG_TEST_ON_IN_TEST: 'off',
}

module.exports = flagsDevelopment