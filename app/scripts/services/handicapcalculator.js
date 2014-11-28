'use strict';

/**
 * @ngdoc service
 * @name doublesShieldApp.handicapCalculator
 * @description
 * # handicapCalculator
 * Service in the doublesShieldApp.
 */
angular.module('doublesShieldApp')
  .service('handicapCalculator', function handicapCalculator() {
    // AngularJS will instantiate a singleton by calling "new" on this function

    //
    //var rivlBaseUrl = config.rivlUrl;
    //
    //$scope.rankHandicapA = 0;
    //$scope.rankHandicapB = 0;
    //$scope.eloHandicapA = 0;
    //$scope.eloHandicapB = 0;
    //$scope.winPercentA = '-';
    //$scope.winPercentB = '-';
    //
    //$scope.teamA = [];
    //$scope.teamB = [];
    //
    //$scope.maxHandicap = 7; //don't want to exceed 8 as a max handicap
    //$scope.maxRank;
    //$scope.maxRankDiff;
    //$scope.maxEloDiff;
    //
    //$http.get(rivlBaseUrl + 'vs_api/competition/competitors?competition_id=2').success(function(competitors){
    //
    //  var activeCompetitors = [];
    //  competitors.forEach(function(player){
    //    if (player.activeRank) {
    //      player.playerImage = rivlBaseUrl + 'img/avatars/2_' + player.competitor_id + '_0.png';
    //      activeCompetitors.push(player);
    //    }
    //  });
    //
    //  $scope.teamA = activeCompetitors.sort(function(a,b){ return a.activeRank - b.activeRank; });
    //
    //  $scope.teamB = angular.copy(activeCompetitors);
    //
    //  //calculate max rank and elo diffs (assume $scope.teamA is already ordered by rank and has more than 2 active players)
    //  $scope.maxRank = $scope.teamA.length;
    //  $scope.maxRankDiff = ($scope.maxRank + $scope.maxRank - 1) - (1+2) + 1;
    //  $scope.maxEloDiff = (parseFloat($scope.teamA[0].elo) + parseFloat($scope.teamA[1].elo))
    //  - (parseFloat($scope.teamA[$scope.maxRank-2].elo) + parseFloat($scope.teamA[$scope.maxRank-1].elo) - 100);
    //
    //});
    //
    //
    //$scope.selectPlayer = function(competitors, player){
    //
    //  var count = 0;
    //  function canSelectedFunc(player){
    //    //only allow
    //    return player.selected && ++count === 2;
    //  }
    //
    //  if(player.selected){
    //    player.selected = false;
    //
    //  } else {
    //    if(competitors === 1){
    //      player.selected = !$scope.teamA.some(canSelectedFunc);
    //    } else {
    //      player.selected = !$scope.teamB.some(canSelectedFunc);
    //    }
    //  }
    //
    //
    //
    //  if(allSelectedFunc()){
    //    calculateHandicap();
    //    fetchCompetitorDetail();
    //  } else {
    //    $scope.handicap = null;
    //    $scope.handicapedTeam = '';
    //    $scope.winPercentA = '-';
    //    $scope.winPercentB = '-';
    //  }
    //};
    //
    //
    //function allSelectedFunc(){
    //  var count = 0;
    //
    //  function countSelected(player){
    //    if(player.selected) { count++; }
    //  }
    //
    //  $scope.teamA.some(countSelected);
    //  $scope.teamB.some(countSelected);
    //
    //  return count === 4;
    //}
    //
    //
    //
    //function getSelectedPlayers(player) {
    //  return player.selected;
    //}
    //
    //function fetchCompetitorDetail() {
    //  var competitor1 = false;
    //  var competitor2 = false;
    //  var teamA = $scope.teamA.filter(getSelectedPlayers);
    //
    //  $http.get(rivlBaseUrl + 'vs_api/competitor_graph?competition_id=2&competitor_id=' + teamA[0].competitor_id).success(function(result){
    //    if (competitor2) calculateWinPercent(result, competitor2);
    //    competitor1 = result;
    //  });
    //  $http.get(rivlBaseUrl + 'vs_api/competitor_graph?competition_id=2&competitor_id=' + teamA[1].competitor_id).success(function(result){
    //    if (competitor1) calculateWinPercent(competitor1, result);
    //    competitor2 = result;
    //  });
    //}
    //
    //function calculateWinPercent(playerA1, playerA2){
    //
    //  var teamA = $scope.teamA.filter(getSelectedPlayers);
    //  var teamB = $scope.teamB.filter(getSelectedPlayers);
    //
    //  //normalise elo diff to somewhere between 0 and 1 where 0.5 means the two teams are even
    //  var teamAHandicap = 1 - ((($scope.eloHandicapA - $scope.eloHandicapB) / $scope.maxHandicap * 0.5) + 0.5);
    //  var winPercentA1vB1 = teamAHandicap;
    //  var winPercentA1vB2 = teamAHandicap;
    //  var winPercentA2vB1 = teamAHandicap;
    //  var winPercentA2vB2 = teamAHandicap;
    //
    //  playerA1.stat_details.stat_array.forEach(function(opponentStats) {
    //    if (opponentStats.opponent_id == teamB[0].competitor_id) {
    //      if (parseInt(opponentStats.win_num) + parseInt(opponentStats.loss_num) >= 5)
    //        winPercentA1vB1 = opponentStats.win_percent / 100;
    //    } else if (opponentStats.opponent_id == teamB[1].competitor_id) {
    //      if (parseInt(opponentStats.win_num) + parseInt(opponentStats.loss_num) >= 5)
    //        winPercentA1vB2 = opponentStats.win_percent / 100;
    //    }
    //  });
    //  playerA2.stat_details.stat_array.forEach(function(opponentStats) {
    //    if (opponentStats.opponent_id == teamB[0].competitor_id) {
    //      if (parseInt(opponentStats.win_num) + parseInt(opponentStats.loss_num) >= 5)
    //        winPercentA2vB1 = opponentStats.win_percent / 100;
    //    } else if (opponentStats.opponent_id == teamB[1].competitor_id) {
    //      if (parseInt(opponentStats.win_num) + parseInt(opponentStats.loss_num) >= 5)
    //        winPercentA2vB2 = opponentStats.win_percent / 100;
    //    }
    //  });
    //
    //  //get the diffs between handicap and actual win percent for each player combination and average them
    //  var teamAWinPercent = (winPercentA1vB1 + winPercentA1vB2 + winPercentA2vB1 + winPercentA2vB2) / 4;
    //  var teamWinPredictor = teamAWinPercent - teamAHandicap + 0.5;
    //  $scope.winPercentA = Math.round(teamWinPredictor * 100);
    //  $scope.winPercentB = Math.round((1 - teamWinPredictor) * 100);
    //
    //  console.log(teamA[0].name + ' v ' + teamB[0].name + ' winPercent: ' + winPercentA1vB1);
    //  console.log(teamA[0].name + ' v ' + teamB[1].name + ' winPercent: ' + winPercentA1vB2);
    //  console.log(teamA[1].name + ' v ' + teamB[0].name + ' winPercent: ' + winPercentA2vB1);
    //  console.log(teamA[1].name + ' v ' + teamB[1].name + ' winPercent: ' + winPercentA2vB2);
    //  console.log('TeamA winPercent: ' + $scope.winPercentA);
    //  console.log('TeamB winPercent: ' + $scope.winPercentB);
    //  console.log('TeamA handicap: ' + teamAHandicap);
    //}


    var MAX_HANDICAP = 7;

    function getHandicapRank(teamAPlayer1Rank, teamAPlayer2Rank, teamBPlayer1Rank, teamBPlayer2Rank, maxRankDiff){

      //TODO: error handling
      //assumes teams have already been sorted by rank
      var teamARank = teamAPlayer1Rank + teamAPlayer2Rank;
      var teamBRank = teamBPlayer1Rank + teamBPlayer2Rank;

      if(teamARank < teamBRank){
        return Math.round((teamBRank - teamARank) / maxRankDiff * MAX_HANDICAP);
      } else {
        return Math.round((teamARank - teamBRank) / maxRankDiff * MAX_HANDICAP);
      }
    }

    this.getHandicapElo = function(teamAPlayer1Elo, teamAPlayer2Elo, teamBPlayer1Elo, teamBPlayer2Elo, maxEloDiff){

      teamAPlayer1Elo = parseFloat(teamAPlayer1Elo);
      teamAPlayer2Elo = parseFloat(teamAPlayer2Elo);
      teamBPlayer1Elo = parseFloat(teamBPlayer1Elo);
      teamBPlayer2Elo = parseFloat(teamBPlayer2Elo);


      var teamAElo = (teamAPlayer1Elo * 1) + (teamAPlayer2Elo * 1);
      var teamBElo = (teamBPlayer1Elo * 1) + (teamBPlayer2Elo * 1);

      if(teamAElo > teamBElo){
        return Math.round((teamAElo - teamBElo) / maxEloDiff * MAX_HANDICAP);
      } else {
        return Math.round((teamBElo - teamAElo) / maxEloDiff * MAX_HANDICAP);
      }

    };

    function getMaxRankDiff(totalPlayers){
      return (totalPlayers + totalPlayers - 1) - (1+2) + 1;
    }

    this.getMaxEloDiff = function (playerList){
      //assumes sorted
      var top2Players = playerList.slice(0, 2);
      var bottom2Players = playerList.slice(-2);

      return (parseFloat(top2Players[0].elo) + parseFloat(top2Players[1].elo))
      - (parseFloat(bottom2Players[0].elo) + parseFloat(bottom2Players[1].elo) - 100);
    };

    function getTeamWinPercent(teamA, teamB){

    }
  });