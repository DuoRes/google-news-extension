export function findByXPath(xpath, parent = document) {
  const result = document.evaluate(xpath, parent, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
  return result.singleNodeValue
}
