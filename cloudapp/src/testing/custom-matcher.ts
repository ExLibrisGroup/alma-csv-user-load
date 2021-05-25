import MatchersUtil = jasmine.MatchersUtil;
import CustomMatcherFactories = jasmine.CustomMatcherFactories;
import CustomEqualityTester = jasmine.CustomEqualityTester;
import CustomMatcher = jasmine.CustomMatcher;
import CustomMatcherResult = jasmine.CustomMatcherResult;

export const CustomMatchers: CustomMatcherFactories = {
  toContainObject: (util: MatchersUtil, customEqualityTester: CustomEqualityTester[]): CustomMatcher => ({
    compare: (received: any, argument: any): CustomMatcherResult => {
      const pass = util.equals(received, 
        jasmine.arrayContaining([
          jasmine.objectContaining(argument)
        ])
      )

      if (pass) {
        return {
          //message: `expected ${this.utils.printReceived(received)} not to contain object ${this.utils.printExpected(argument)}`,
          message: util.buildFailureMessage('toContainObject', true, received, argument),
          pass: true
        }
      } else {
        return {
          message: util.buildFailureMessage('toContainObject', false, received, argument),
          pass: false
        }
      }
    }
  })
}
