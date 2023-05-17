//
// guest.testcaferc.js
//
module.exports = {
  browsers: ['chrome:headless'],
  clientScripts: [
    { module: '@testing-library/dom/dist/@testing-library/dom.umd.js' },
  ],
  debugOnFail: true,
  screenshots: {
    path: 'config/testcafe/__screenshots__',
  },
  src: [
    'src/pages/_guest/**/*.spec.js',
    'src/pages/_guest/**/*.spec.ts',
  ],
}
