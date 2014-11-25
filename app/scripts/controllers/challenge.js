'use strict';

/**
 * @ngdoc function
 * @name doublesShieldApp.controller:ChallengeCtrl
 * @description
 * # ChallengeCtrl
 * Controller of the doublesShieldApp
 */
angular.module('doublesShieldApp')
  .controller('ChallengeCtrl', function ($scope, $http) {

    var rivlBaseUrl = 'http://localhost:8090/';

    //var rivlBaseUrl = 'http://localhost/rivl/';
    //var rivlBaseUrl = 'http://rivl.kitomba.net/';


    $scope.defenders = {
      player1: null,
      player2: null
    };

    $scope.challengers = [];


    $http.get(rivlBaseUrl + 'vs_api/competition/competitors?competition_id=2').success(function(competitors){

      var activeCompetitors = [];
      competitors.forEach(function(player){
        if (player.activeRank) {
          player.playerImage = rivlBaseUrl + 'img/avatars/2_' + player.competitor_id + '_0.png';
          activeCompetitors.push(player);
        }
      });

      $scope.team = activeCompetitors.sort(function(a,b){ return a.activeRank - b.activeRank; });

      $scope.defenders.player1 = competitors[0];
      $scope.defenders.player2 = competitors[1];

    });

    $scope.selectPlayer = function(player){

      var count = 0;
      function canSelectedFunc(player){
        //only allow
        return player.selected && ++count === 2;
      }

      if(player.selected){
        player.selected = false;

      } else {
          player.selected = !$scope.team.some(canSelectedFunc);
      }

    };


    $scope.addTeam = function(){

      var selectedPlayers = $scope.team.filter(function(player){
        return player.selected;
      });

      var newTeam = {
        player1: selectedPlayers[0],
        player2: selectedPlayers[1]
      };

      $scope.challengers.push(newTeam);
    }

  });
