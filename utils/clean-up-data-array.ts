////
///
// util › clean-up-data-array

import { decodeHTML } from 'entities'

import { JSONObject, JSONArray } from '@/types'
import convertSnakeToCamel from '@utils/convert-snake-to-camel'

/**
 * Cleans up a JSON data array by transforming and aggregating its items based
 * on the provided `idAttribute`. If `idAttribute` is not provided, each item is
 * independently cleaned up. Also decodes HTML character entities.
 *
 * @param {JSONArray} data - The JSON data array to clean up.
 * @param {string} [idAttribute] - The attribute used for item aggregation.
 * @returns {JSONArray} The cleaned up JSON data array.
 */
export default function cleanUpDataArray(data: JSONArray, idAttribute?: string): JSONArray {
  
  // Utility function to convert object's keys from snake_case to camelCase
  function convertKeysToCamel(item: JSONObject): JSONObject {
    const cleanedItem: JSONObject = {}
    Object.entries(item).forEach(([key, value]) => {
      const camelKey = JSON.parse(convertSnakeToCamel(JSON.stringify(key)))
      cleanedItem[camelKey] = JSON.parse(JSON.stringify(value))
    })
    return cleanedItem
  }

  // First decode all HTML character entities
  const decodedData: JSONArray = JSON.parse(decodeHTML(JSON.stringify(data)))

  if (idAttribute) {
    // Case #1: idAttribute is provided
    // => Aggregate items with same idAttribute value
    
    // Create a map to aggregate items based on the idAttribute
    const aggregatedMap: Map<string, JSONObject> = new Map()
    const simplyCleanedItems: JSONObject[] = []

    decodedData.forEach((item) => {
      const idValue = JSON.parse(JSON.stringify(item[idAttribute]))

      // When idValue is not null, aggregate item by idAttribute
      if (idValue) {

        // Remove 'fk_' prefix from idAttribute if it exists
        const idAttributeKey = idAttribute.startsWith('fk_')
          ? convertSnakeToCamel(idAttribute.slice(3))
          : convertSnakeToCamel(idAttribute)

        if (!aggregatedMap.has(idValue)) {
          const newItem: JSONObject = {}
          newItem[idAttributeKey] = idValue
          aggregatedMap.set(idValue, newItem)
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const aggregatedItem = aggregatedMap.get(idValue)!
        let attributeKey: string | undefined
        let valueValue: JSONObject | undefined
        let didAggregate = false
        
        // Combine item's attribute and value into a single property
        Object.entries(item).forEach(([key, value]) => {
          if (didAggregate) return // Skip if item has already been aggregated

          if (key === 'attribute') {
            attributeKey = JSON.parse(convertSnakeToCamel(JSON.stringify(value)))
          } else if (key === 'value') {
            valueValue = JSON.parse(JSON.stringify(value))
          }
          
          if (attributeKey && valueValue) {
            aggregatedItem[attributeKey] = valueValue
            didAggregate = true
          }
        })
      } else {
        
        // When idValue is null, clean up item and add to array
        simplyCleanedItems.push(convertKeysToCamel(item))
      }
    })

    return Array.from(aggregatedMap.values()).concat(simplyCleanedItems)
  }

  // Case #2: idAttribute is not provided
  // => Convert object keys from snake_case to camelCase
  return decodedData.map((item) => convertKeysToCamel(item))
}
