
// tslint:disable-next-line:no-namespace
declare namespace jasmine {
  interface Matchers<T> {
    /** Expect an array to contain an object with the specified attributes */
    toContainObject(expected: any, expectationFailOutput?: any): boolean;
  }
}