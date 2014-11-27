'use strict';

/**
 * @ngdoc overview
 * @name doublesShieldApp
 * @description
 * # doublesShieldApp
 *
 * Main module of the application.
 */
angular
  .module('doublesShieldApp', ['ngRoute', 'firebase', 'config'])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      })
      .when('/challenge', {
        templateUrl: 'views/challenge.html',
        controller: 'ChallengeCtrl'
      });
  }]);

