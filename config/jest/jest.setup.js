//
// jest.setup.js
//
import '@testing-library/jest-dom/extend-expect'
import util, { TextEncoder, TextDecoder } from 'util'

global.util = util
global.inspect = util.inspect
Object.assign(global, { TextDecoder, TextEncoder })
