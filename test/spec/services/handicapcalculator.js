'use strict';

describe('Service: handicapCalculator', function () {

  // load the service's module
  beforeEach(module('doublesShieldApp'));

  // instantiate service
  var handicapCalculator;
  beforeEach(inject(function (_handicapCalculator_) {
    handicapCalculator = _handicapCalculator_;
  }));

  it('higher elo challenging team should get a zero handicap', function () {
    expect(!!handicapCalculator).toBe(true);

    var actualHandicap = handicapCalculator.getHandicapElo(3000, 4000, 1000, 2000, 4000);

    expect(actualHandicap).toBe(0);
  });

});
