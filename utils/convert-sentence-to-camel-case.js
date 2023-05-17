//
// utils › convertSentenceToCamelCase
//
/**
 * @param {string} inputSentence Text input in sentence case.
 * @returns {string} Sentence case input converted to camel case. 
 */
export default function convertSentenceToCamelCase(inputSentence) {
  if (typeof inputSentence !== 'string') { return '' }
  if (!inputSentence.slice(0, 1).match(/[A-Z]/)) { return '' }

  const words = inputSentence.split(' ')
  const wordsAllLowerCased = words.map((word) => (word.toLowerCase()))

  const wordsCamelCased = wordsAllLowerCased.map((word, index) => {
    if (index === 0) { return word.toLowerCase() }
    return `${word.charAt(0).toUpperCase()}${word.slice(1)}`
  })

  return wordsCamelCased.join('')
}
