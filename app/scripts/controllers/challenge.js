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
      name: null,
      wins: 0
    };

    $scope.defendersLoaded = false;

    var challengersFB = new Firebase(firebaseUrl + '/challengers');
    var challengers = null; // $firebase(challengersFB).$asArray();
    //$scope.challengers = $firebase(challengersFB).$asArray();

    var defendersFB = new Firebase(firebaseUrl + '/defenders');
    var defenders = null; //$firebase(defendersFB).$asObject();
    //$scope.defenders = $firebase(defendersFB).$asObject();

    var historyFB = new Firebase(firebaseUrl + '/history');
    var history = $firebase(historyFB).$asArray(); 


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

      defenders.$loaded()
        .then(function() {
          $scope.defendersLoaded = true;
          if(!defenders.player1){
            return;
          }
          $scope.defenders.player1 = getPlayerById(defenders.player1.competitor_id);
          $scope.defenders.player2 = getPlayerById(defenders.player2.competitor_id);
          $scope.defenders.wins = defenders.wins;
          $scope.defenders.name = defenders.name;

          //need to do the challengers after the defenders so we can calculate the elo correctly
          challengers.$loaded()
            .then(function(){
              challengers.forEach(function(team){
                $scope.challengers.push(
                  {
                    player1: getPlayerById(team.player1.competitor_id),
                    player2: getPlayerById(team.player2.competitor_id),
                    name: team.name
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
        //if the player is selected, deselect them and remove it from the selected players array
        player.selected = false;
        selectedPlayers.splice(selectedPlayers.indexOf(player), 1);
      } else if(selectedPlayers.length < 2 && !player.selected){
        player.selected = true;
        selectedPlayers.push(player);

        if(selectedPlayers.length === 2){
          //selected 2 to players so run the maths to show the handicap and expected win percent
          var def = $scope.defenders;
          var eloDiff = handicapCalculator.getMaxEloDiff($scope.competitors);
          $scope.eloHandicap = handicapCalculator.getHandicapElo(selectedPlayers[0].elo, selectedPlayers[1].elo, def.player1.elo, def.player2.elo, eloDiff);
          $scope.winPercent = 0;

          $http.get(rivlBaseUrl + 'vs_api/competitor_graph?competition_id=2&competitor_id=' + def.player1.competitor_id).success(function(defender1){
            $http.get(rivlBaseUrl + 'vs_api/competitor_graph?competition_id=2&competitor_id=' + def.player2.competitor_id).success(function(defender2){
              var defendersHandicap = ($scope.eloHandicap < 0) ? $scope.eloHandicap : 0;
              var challengersHandicap = ($scope.eloHandicap > 0) ? $scope.eloHandicap : 0;
              $scope.winPercent = handicapCalculator.getTeamWinPercent(defender1.stat_details, defender2.stat_details,
                selectedPlayers[0].competitor_id, selectedPlayers[1].competitor_id, defendersHandicap, challengersHandicap, eloDiff);
            });
          });

        }
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
        defenders.wins = 0;
        defenders.name = null;
        defenders.$save();
      } else {
        var eloHandicap = handicapCalculator.getHandicapElo(selectedPlayers[0].elo, selectedPlayers[1].elo,
          $scope.defenders.player1.elo, $scope.defenders.player2.elo, handicapCalculator.getMaxEloDiff($scope.competitors));

        var newTeam = {
          player1: selectedPlayers[0],
          player2: selectedPlayers[1],
          handicap: eloHandicap,
          name: null
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
      var firebaseRecord = challengers.$getRecord(challengers.$keyAt(teamIndex));
      if(firebaseRecord.player1.competitor_id == teamToRemove.player1.competitor_id
        && firebaseRecord.player2.competitor_id == teamToRemove.player2.competitor_id){
        challengers.$remove(firebaseRecord);
      }

    };


    $scope.challengersWon = function(challengersTeam){
      //var currentChallengers = $scope.challengers[0];

      addToGameHistory(challengersTeam, $scope.defenders).then(function(){
        $scope.defenders = challengersTeam;
        $scope.defenders.wins = 0;

        defenders.player1 = $scope.defenders.player1;
        defenders.player2 = $scope.defenders.player2;
        defenders.name = $scope.defenders.name;
        defenders.wins = 0;
        defenders.$save();


        $scope.removeTeam(challengersTeam);

        //There probably is a nice fancy $bind/$watch way of doing this
        $scope.challengers.forEach(function(team){
          team.handicap = handicapCalculator.getHandicapElo(team.player1.elo, team.player2.elo,
            $scope.defenders.player1.elo, $scope.defenders.player2.elo, handicapCalculator.getMaxEloDiff($scope.competitors))
        });
      });

    };

    $scope.challengersLost = function(challengersTeam){
      $scope.defenders.wins++;
      defenders.wins = $scope.defenders.wins;

      defenders.name = (!defenders.name) ? null : defenders.name;
      challengersTeam.name = (!challengersTeam.name) ? null : challengersTeam.name;

      defenders.$save();

      addToGameHistory(defenders, challengersTeam).then(function(){
        $scope.removeTeam(challengersTeam);
      });

      
    };


    function addToGameHistory(winningTeam, loosingTeam){
      var game = {
        winningTeam: winningTeam,
        loosingTeam: loosingTeam
      }

      return history.$add(game);
    }



    //challenger name edit actions

    $scope.enableEditor = function(team) {
      team.editorEnabled = true;
    };

    $scope.disableEditor = function(team) {
      team.editorEnabled = false;
    };

    $scope.save = function(team) {
      var teamIndex = $scope.challengers.indexOf(team);
      var firebaseRecord = challengers.$getRecord(challengers.$keyAt(teamIndex));
      firebaseRecord.name = team.name;
      challengers.$save(firebaseRecord);
      $scope.disableEditor(team);
    };



  });
