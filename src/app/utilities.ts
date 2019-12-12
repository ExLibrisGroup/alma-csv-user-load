export const Utils = {
  /** Maps object based on passed in function and returns object */
  mapObject: (object: Object, mapFn: Function) => Object.keys(object).reduce(function(result, key) {
      result[key] = mapFn(object[key])
      return result
    }, {}),

  /** Chunks array and returns array of arrays of specified size */
  chunk: <T>(inputArray: Array<T>, size:number): Array<Array<T>> => {
    return inputArray.reduce((all,one,i) => {
      const ch = Math.floor(i/size); 
      all[ch] = [].concat((all[ch]||[]),one); 
      return all;
    }, []);
  },

  /** Asynchronously executes the function for each element in the array */
  asyncForEach: async <T>(array: T[], callback: (item: T, i: number, a: T[]) => Promise<any>) => {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array);
    }
  },

  /** Checks if object is empty */
  isEmptyObject: (obj: Object) => Object.keys(obj).length === 0 && obj.constructor === Object,

  /** Handles either resolved or rejected Promise */
  reflect: p => p.then(v => ({v, status: "fulfilled" }),
                            e => ({e, status: "rejected" })),
}