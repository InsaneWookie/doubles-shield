'use strict';

/**
 * @ngdoc function
 * @name doublesShieldApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the doublesShieldApp
 */
angular.module('doublesShieldApp')
  .controller('MainCtrl', function ($scope, $http) {
    
    $scope.competitors = [];

    $http.get('http://rivl.kitomba.net/vs_api/competition/competitors?competition_id=2').success(function(competitors){
    	$scope.competitors = competitors.sort(function(a,b){ return a.rank - b.rank });
    });

  });
