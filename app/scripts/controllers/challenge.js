'use strict';

/**
 * @ngdoc function
 * @name doublesShieldApp.controller:ChallengeCtrl
 * @description
 * # ChallengeCtrl
 * Controller of the doublesShieldApp
 */
angular.module('doublesShieldApp')
  .controller('ChallengeCtrl', function ($scope, $http, $firebase, config, handicapCalculator) {

    var rivlBaseUrl = config.rivlUrl;
    var firebaseUrl = config.firebaseUrl;

    $scope.challengers = [];
    $scope.defenders = {};

    var challengersFB = new Firebase(firebaseUrl + '/challengers');
    $scope.challengers = $firebase(challengersFB).$asArray();

    var defendersFB = new Firebase(firebaseUrl + '/defenders');
    $scope.defenders = $firebase(defendersFB).$asObject();

    $scope.defenders.$loaded()
      .then(function(data) {
        console.log(data); // true
      })
      .catch(function(error) {
        console.error("Error:", error);
      });


    $http.get(rivlBaseUrl + 'vs_api/competition/competitors?competition_id=2').success(function(competitors){

      var activeCompetitors = [];
      competitors.forEach(function(player){
        if (player.activeRank) {
          player.playerImage = rivlBaseUrl + 'img/avatars/2_' + player.competitor_id + '_0.png';
          activeCompetitors.push(player);
        }
      });

      $scope.competitors = activeCompetitors.sort(function(a,b){ return a.activeRank - b.activeRank; });

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
        player.selected = !$scope.competitors.some(canSelectedFunc);
      }

    };


    $scope.addTeam = function(){

      var selectedPlayers = $scope.competitors.filter(function(player){
        return player.selected;
      });

      if(selectedPlayers.length !== 2){
        return;
      }

      var newTeam = {
        player1: selectedPlayers[0],
        player2: selectedPlayers[1],
        handicap: handicapCalculator.getHandicapElo(selectedPlayers[0].elo, selectedPlayers[1].elo,
          $scope.defenders.player1.elo, $scope.defenders.player2.elo, handicapCalculator.getMaxEloDiff($scope.competitors))
      };

      if(!$scope.defenders.player1){ //see if we have any data
        //$scope.defenders = newTeam; //cant do this as it will kill the firebase binding
        $scope.defenders.player1 = selectedPlayers[0];
        $scope.defenders.player2 = selectedPlayers[1];
        $scope.defenders.$save();
      } else {
        $scope.challengers.$add(newTeam);
      }

      selectedPlayers[0].selected = false;
      selectedPlayers[1].selected = false;
    };

    $scope.removeTeam = function(teamToRemove){
      $scope.challengers.$remove(teamToRemove);
    };


    $scope.challengersWon = function(challengersTeam){
      //var currentChallengers = $scope.challengers[0];
      $scope.defenders.player1 = challengersTeam.player1;
      $scope.defenders.player2 = challengersTeam.player2;
      $scope.defenders.$save();

      $scope.removeTeam(challengersTeam);

      //TODO: need to re-calculate all the handicaps for the challengers as the defenders have changed
      //There probably is a nice fancy $bind/$watch way of doing it
    };

    $scope.challengersLost = function(challengersTeam){
      $scope.removeTeam(challengersTeam)
    }

  });
