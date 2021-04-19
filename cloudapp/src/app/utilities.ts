import { FormGroup, FormArray, FormControl, AbstractControl } from '@angular/forms';

/** Maps object based on passed in function and returns object */
const mapObject = (object: Object, mapFn: Function) => Object.keys(object).reduce(function(result, key) {
    result[key] = mapFn(object[key])
    return result
  }, {});

/** Chunks array and returns array of arrays of specified size */
const chunk = <T>(inputArray: Array<T>, size:number): Array<Array<T>> => {
  return inputArray.reduce((all,one,i) => {
    const ch = Math.floor(i/size); 
    all[ch] = [].concat((all[ch]||[]),one); 
    return all;
  }, []);
};

/** Asynchronously executes the function for each element in the array */
const asyncForEach = async <T>(array: T[], callback: (item: T, i: number, a: T[]) => Promise<any>) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

/** Checks if object is empty */
const isEmptyObject = (obj: Object) => Object.keys(obj).length === 0 && obj.constructor === Object;

/** Handles either resolved or rejected Promise */
const reflect = p => p.then(v => ({v, status: "fulfilled" }), e => ({e, status: "rejected" }));

/** Downloads file */
const download = (filename: string, filetype: string, contents: string) => {
  var element = document.createElement('a');
  element.setAttribute('href', `data:${filetype};charset=utf-8,` + encodeURIComponent(contents));
  element.setAttribute('download', `${filename}`);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};

/** Safe JSON parse */
const tryParse = (val: string) => {
  try {
    return JSON.parse(val);
  } catch(e) {
    return null;
  }
};

export { mapObject, chunk, asyncForEach, isEmptyObject, reflect, download, tryParse };