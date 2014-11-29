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
    $scope.defenders = {
      wins: 0
    };

    $scope.defendersLoaded = false;

    var challengersFB = new Firebase(firebaseUrl + '/challengers');
    $scope.challengers = $firebase(challengersFB).$asArray();

    var defendersFB = new Firebase(firebaseUrl + '/defenders');
    $scope.defenders = $firebase(defendersFB).$asObject();

    $scope.defenders.$loaded()
      .then(function() {
        $scope.defendersLoaded = true;
      })
      .catch(function(error) {
        console.error("Error:", error);
      });


    $http.get(rivlBaseUrl + 'vs_api/competition/competitors?competition_id=2').success(function(competitors){

      var activeCompetitors = [];
      competitors.forEach(function(player){
        if (player.activeRank) {
          player.playerImage = rivlBaseUrl + 'img/avatars/2_' + player.competitor_id + '_0.png';
          player.roundedElo = Math.round(parseFloat(player.elo));
          activeCompetitors.push(player);
        }
      });

      $scope.competitors = activeCompetitors.sort(function(a,b){ return a.activeRank - b.activeRank; });

    });

    //array to hold the selected players, this is updated when the user clicks a competitor
    var selectedPlayers = [];

    $scope.selectPlayer = function(player){
      if(player.selected){
        player.selected = false;
        selectedPlayers.splice(selectedPlayers.indexOf(player), 1);
      } else if(selectedPlayers.length < 2 && !player.selected){
        player.selected = true;
        selectedPlayers.push(player);
      }
    };


    $scope.addTeam = function(){

      //make sure to players are selected before adding a team
      if(selectedPlayers.length !== 2){
        return;
      }

      if(!$scope.defenders.player1){ //see if we have any data
        //$scope.defenders = newTeam; //cant do this as it will kill the firebase binding
        $scope.defenders.player1 = selectedPlayers[0];
        $scope.defenders.player2 = selectedPlayers[1];
        $scope.defenders.$save();
      } else {

        var eloHandicap = handicapCalculator.getHandicapElo(selectedPlayers[0].elo, selectedPlayers[1].elo,
          $scope.defenders.player1.elo, $scope.defenders.player2.elo, handicapCalculator.getMaxEloDiff($scope.competitors));

        var newTeam = {
          player1: selectedPlayers[0],
          player2: selectedPlayers[1],
          handicap: eloHandicap
        };

        $scope.challengers.$add(newTeam);
      }

      selectedPlayers[0].selected = false;
      selectedPlayers[1].selected = false;
      selectedPlayers = [];
    };

    $scope.removeTeam = function(teamToRemove){
      $scope.challengers.$remove(teamToRemove);
    };


    $scope.challengersWon = function(challengersTeam){
      //var currentChallengers = $scope.challengers[0];
      $scope.defenders.player1 = challengersTeam.player1;
      $scope.defenders.player2 = challengersTeam.player2;
      $scope.defenders.wins = 0;
      $scope.defenders.$save();

      $scope.removeTeam(challengersTeam);

      //TODO: need to re-calculate all the handicaps for the challengers as the defenders have changed
      //There probably is a nice fancy $bind/$watch way of doing it

      $scope.challengers.forEach(function(team){
        team.handicap = handicapCalculator.getHandicapElo(team.player1.elo, team.player2.elo,
          $scope.defenders.player1.elo, $scope.defenders.player2.elo, handicapCalculator.getMaxEloDiff($scope.competitors))
      });
    };

    $scope.challengersLost = function(challengersTeam){
      $scope.defenders.wins++;
      $scope.removeTeam(challengersTeam)
    }

  });
