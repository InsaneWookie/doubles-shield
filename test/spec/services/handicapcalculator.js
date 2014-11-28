'use strict';

describe('Service: handicapCalculator', function () {

  // load the service's module
  beforeEach(module('doublesShieldApp'));

  // instantiate service
  var handicapCalculator;
  beforeEach(inject(function (_handicapCalculator_) {
    handicapCalculator = _handicapCalculator_;
  }));

  it('should do something', function () {
    expect(!!handicapCalculator).toBe(true);
  });

});
