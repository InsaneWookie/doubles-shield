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

    //var rivlBaseUrl = 'http://localhost:8090/';
    //var rivlBaseUrl = 'http://localhost/rivl/';
    var rivlBaseUrl = 'http://rivl.kitomba.net/';

    $scope.rankHandicapA = 0;
    $scope.rankHandicapB = 0;
    $scope.eloHandicapA = 0;
    $scope.eloHandicapB = 0;
    $scope.winPercentA = 0;
    $scope.winPercentB = 0;

    $scope.teamA = [];
    $scope.teamB = [];

    $http.get(rivlBaseUrl + 'vs_api/competition/competitors?competition_id=2').success(function(competitors){

      var activeCompetitors = [];
      competitors.forEach(function(player){
        if (player.activeRank) {
            player.playerImage = rivlBaseUrl + 'img/avatars/2_' + player.competitor_id + '_0.png';
            activeCompetitors.push(player);
        }
      });

      $scope.teamA = activeCompetitors.sort(function(a,b){ return a.activeRank - b.activeRank; });

      $scope.teamB = angular.copy(activeCompetitors);
    });


    $scope.selectPlayer = function(team, player){

      var count = 0;
      function canSelectedFunc(player){
        //only allow
        return player.selected && ++count === 2;
      }

      if(player.selected){
        player.selected = false;

      } else {
        if(team === 1){
          player.selected = !$scope.teamA.some(canSelectedFunc);
        } else {
          player.selected = !$scope.teamB.some(canSelectedFunc);
        }
      }



      if(allSelectedFunc()){
        calculateHandicap();
        fetchCompetitorDetail();
      } else {
        $scope.handicap = null;
        $scope.handicapedTeam = '';
      }
    };


    function allSelectedFunc(){
      var count = 0;

      function countSelected(player){
        if(player.selected) { count++; }
      }

      $scope.teamA.some(countSelected);
      $scope.teamB.some(countSelected);

      return count === 4;
    }

    function calculateHandicap(){

      var teamARank = 0;
      var teamBRank = 0;
      var teamAElo = 0;
      var teamBElo = 0;
      var maxHandicap = 6; //don't want to exceed 6 as a max handicap

      //calculate max rank and elo diffs (assume $scope.teamA is already ordered by rank and has more than 2 active players)
      var maxRank = $scope.teamA.length;
      var maxRankDiff = (maxRank+maxRank-1) - (1+2);
      var maxEloDiff = (parseFloat($scope.teamA[0].elo) + parseFloat($scope.teamA[1].elo))
                            - (parseFloat($scope.teamA[maxRank-2].elo) + parseFloat($scope.teamA[maxRank-1].elo));

      $scope.teamA.forEach(function sumRank(player){
        teamARank += (player.selected) ? player.activeRank : 0;
        teamAElo += (player.selected) ? parseFloat(player.elo) : 0;
      });

      $scope.teamB.forEach(function sumRank(player){
        teamBRank += (player.selected) ? player.activeRank : 0;
        teamBElo += (player.selected) ? parseFloat(player.elo) : 0;
      });

      if(teamARank < teamBRank){
        $scope.rankHandicapB = Math.round((teamBRank - teamARank) / maxRankDiff * maxHandicap);
        $scope.rankHandicapA = 0;
      } else {
        $scope.rankHandicapA = Math.round((teamARank - teamBRank) / maxRankDiff * maxHandicap);
        $scope.rankHandicapB = 0;
      }
      if(teamAElo > teamBElo){
        $scope.eloHandicapB = Math.round((teamAElo - teamBElo) / maxEloDiff * maxHandicap);
        $scope.eloHandicapA = 0;
      } else {
        $scope.eloHandicapA = Math.round((teamBElo - teamAElo) / maxEloDiff * maxHandicap);
        $scope.eloHandicapB = 0;
      }

    }

    function getSelectedPlayers(player) {
        return player.selected;
    }

    function fetchCompetitorDetail() {
      var competitor1 = false;
      var competitor2 = false;
      var teamA = $scope.teamA.filter(getSelectedPlayers);

      $http.get(rivlBaseUrl + 'vs_api/competitor_graph?competition_id=2&competitor_id=' + teamA[0].competitor_id).success(function(result){
        if (competitor2) calculateWinPercent(result, competitor2);
        competitor1 = result;
      });
      $http.get(rivlBaseUrl + 'vs_api/competitor_graph?competition_id=2&competitor_id=' + teamA[1].competitor_id).success(function(result){
        if (competitor1) calculateWinPercent(competitor1, result);
        competitor2 = result;
      });
    }

    function calculateWinPercent(playerA1, playerA2){

        var teamB = $scope.teamB.filter(getSelectedPlayers);

        console.log('stats for: ' + playerA1.playerName);
        playerA1.stat_details.stat_array.forEach(function(opponentStats) {
            if (opponentStats.opponent_id == teamB[0].competitor_id || opponentStats.opponent_id == teamB[1].competitor_id) {
                console.log(opponentStats.opponent_name + ": " + opponentStats.gamePercent);
            }
        });
        console.log('stats for: ' + playerA2.playerName);
        playerA2.stat_details.stat_array.forEach(function(opponentStats) {
            if (opponentStats.opponent_id == teamB[0].competitor_id || opponentStats.opponent_id == teamB[1].competitor_id) {
                console.log(opponentStats.opponent_name + ": " + opponentStats.gamePercent);
            }
        });
    }

  });
