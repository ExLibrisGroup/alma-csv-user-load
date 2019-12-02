export const Utils = {
  /** Maps object based on passed in function and returns object */
  objectMap: (object: Object, mapFn: Function) => Object.keys(object).reduce(function(result, key) {
      result[key] = mapFn(object[key])
      return result
    }, {})
}