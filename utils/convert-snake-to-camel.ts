////
///
// utils › convert-snake-to-camel

export default function convertSnakeToCamel(str: string): string {
  return str.replace(/_([a-zA-Z])/g, (_, char) => char.toUpperCase())
}
