/* eslint-disable no-unused-vars */
//
// utils › image-loader-fix
//

/**
 * Replacement for Next's image loader to avoid undesirable url tampering.
 * 
 * @param {string} src Image url
 * 
 * @returns {string} Untampered same image url
 */
export default function imageLoaderFix({ src }) {
  return src
}
