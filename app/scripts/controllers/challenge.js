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
    var challengers = null; // $firebase(challengersFB).$asArray();
    //$scope.challengers = $firebase(challengersFB).$asArray();

    var defendersFB = new Firebase(firebaseUrl + '/defenders');
    var defenders = null; //$firebase(defendersFB).$asObject();
    //$scope.defenders = $firebase(defendersFB).$asObject();


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

      //we only store the player id and use that to look up the full object from the rivl request
      //this makes all the object references the same
      defenders = $firebase(defendersFB).$asObject();
      challengers = $firebase(challengersFB).$asArray();

      function loadedErrorFunc(error){
        console.error("Error:", error);
      }

      //function buildChallengers (eventData){
      //  //find the players from the rivl data
      //  //$scope.challengers = [];
      //  //$scope.$apply();
      //
      //  //figure out what position it was added
      //  if(eventData.event === 'child_added'){
      //    var addedIndex = challengers.$indexFor(eventData.key);
      //    var addedRecord = challengers.$getRecord(eventData.key);
      //
      //    $scope.challengers.splice(addedIndex, 0, {
      //      player1: getPlayerById(addedRecord.player1.competitor_id),
      //      player2: getPlayerById(addedRecord.player2.competitor_id)
      //    })
      //  }
      //
      //
      //}

      defenders.$loaded()
        .then(function() {
          $scope.defendersLoaded = true;
          $scope.defenders.player1 = getPlayerById(defenders.player1.competitor_id);
          $scope.defenders.player2 = getPlayerById(defenders.player2.competitor_id);
          $scope.defenders.wins = defenders.wins;

          //need to do the challengers after the defenders so we can calculate the elo correctly
          challengers.$loaded()
            .then(function(){
              challengers.forEach(function(team){
                $scope.challengers.push(
                  {
                    player1: getPlayerById(team.player1.competitor_id),
                    player2: getPlayerById(team.player2.competitor_id)
                  });
              });

              //calculate the elo based on the current rivl data
              $scope.challengers.forEach(function(team){
                team.handicap = handicapCalculator.getHandicapElo(team.player1.elo, team.player2.elo,
                  $scope.defenders.player1.elo, $scope.defenders.player2.elo, handicapCalculator.getMaxEloDiff($scope.competitors));

              });
            })
            .catch(loadedErrorFunc);

        })
        .catch(loadedErrorFunc);


      //challengers.$watch(buildChallengers)
    });


    function getPlayerById(playerId){
      var foundPlayer = null;
      $scope.competitors.some(function(player){
        if(player.competitor_id == playerId){
          foundPlayer = player;
          return true;
        }
        return false;
      });

      return foundPlayer;
    }

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

        defenders.player1 = $scope.defenders.player1;
        defenders.player2 = $scope.defenders.player2;
        defenders.save();
      } else {
        var eloHandicap = handicapCalculator.getHandicapElo(selectedPlayers[0].elo, selectedPlayers[1].elo,
          $scope.defenders.player1.elo, $scope.defenders.player2.elo, handicapCalculator.getMaxEloDiff($scope.competitors));

        var newTeam = {
          player1: selectedPlayers[0],
          player2: selectedPlayers[1],
          handicap: eloHandicap
        };

        $scope.challengers.push(newTeam);
        challengers.$add(newTeam);
      }

      selectedPlayers[0].selected = false;
      selectedPlayers[1].selected = false;
      selectedPlayers = [];
    };

    $scope.removeTeam = function(teamToRemove){
      var teamIndex = $scope.challengers.indexOf(teamToRemove);
      $scope.challengers.splice(teamIndex, 1);

      //need to remove by index as we lose the reference on reload
      //need to get the record and see if it exists
      var firebaeRecord = challengers.$getRecord(challengers.$keyAt(teamIndex));
      if(firebaeRecord.player1.competitor_id == teamToRemove.player1.competitor_id && firebaeRecord.player2.competitor_id == teamToRemove.player2.competitor_id){
        challengers.$remove(firebaeRecord);
      }
      
    };


    $scope.challengersWon = function(challengersTeam){
      //var currentChallengers = $scope.challengers[0];
      $scope.defenders.player1 = challengersTeam.player1;
      $scope.defenders.player2 = challengersTeam.player2;
      $scope.defenders.wins = 0;

      defenders.player1 = $scope.defenders.player1;
      defenders.player2 = $scope.defenders.player2;
      defenders.wins = 0;
      defenders.$save();

      $scope.removeTeam(challengersTeam);

      //There probably is a nice fancy $bind/$watch way of doing this
      $scope.challengers.forEach(function(team){
        team.handicap = handicapCalculator.getHandicapElo(team.player1.elo, team.player2.elo,
          $scope.defenders.player1.elo, $scope.defenders.player2.elo, handicapCalculator.getMaxEloDiff($scope.competitors))
      });


    };

    $scope.challengersLost = function(challengersTeam){
      $scope.defenders.wins++;
      defenders.wins = $scope.defenders.wins;
      defenders.$save();
      $scope.removeTeam(challengersTeam)
    }

  });
