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

    var MAX_HANDICAP = 7;

    this.getHandicapRank = function(teamAPlayer1Rank, teamAPlayer2Rank, teamBPlayer1Rank, teamBPlayer2Rank, maxRankDiff){

      //TODO: error handling
      //assumes teams have already been sorted by rank
      var teamARank = teamAPlayer1Rank + teamAPlayer2Rank;
      var teamBRank = teamBPlayer1Rank + teamBPlayer2Rank;

      if(teamARank < teamBRank){
        return Math.round((teamBRank - teamARank) / maxRankDiff * MAX_HANDICAP);
      } else {
        return Math.round((teamARank - teamBRank) / maxRankDiff * MAX_HANDICAP);
      }
    };

    this.getHandicapElo = function(teamAPlayer1Elo, teamAPlayer2Elo, teamBPlayer1Elo, teamBPlayer2Elo, maxEloDiff){

      teamAPlayer1Elo = parseFloat(teamAPlayer1Elo);
      teamAPlayer2Elo = parseFloat(teamAPlayer2Elo);
      teamBPlayer1Elo = parseFloat(teamBPlayer1Elo);
      teamBPlayer2Elo = parseFloat(teamBPlayer2Elo);


      var teamAElo = (teamAPlayer1Elo * 1) + (teamAPlayer2Elo * 1);
      var teamBElo = (teamBPlayer1Elo * 1) + (teamBPlayer2Elo * 1);

      return Math.round((teamBElo - teamAElo) / maxEloDiff * MAX_HANDICAP);
    };

    this.getMaxRankDiff = function(totalPlayers){
      return (totalPlayers + totalPlayers - 1) - (1+2) + 1;
    };

    this.getMaxEloDiff = function (playerList){
      //assumes sorted
      var top2Players = playerList.slice(0, 2);
      var bottom2Players = playerList.slice(-2);

      return (parseFloat(top2Players[0].elo) + parseFloat(top2Players[1].elo))
      - (parseFloat(bottom2Players[0].elo) + parseFloat(bottom2Players[1].elo) - 100);
    };

    //TODO:
    this.getTeamWinPercent = function(defender1StatsDetails, defender2StatsDetails, challenger1Id, challenger2Id,
                                      eloHandicapTeamA, eloHandicapTeamB, maxEloHandicap){
      //var teamA = $scope.teamA.filter(getSelectedPlayers);
      //var teamB = $scope.teamB.filter(getSelectedPlayers);

      //normalise elo diff to somewhere between 0 and 1 where 0.5 means the two teams are even
      var teamAHandicap = 1 - (((eloHandicapTeamA - eloHandicapTeamB) / maxEloHandicap * 0.5) + 0.5);
      var winPercentA1vB1 = teamAHandicap;
      var winPercentA1vB2 = teamAHandicap;
      var winPercentA2vB1 = teamAHandicap;
      var winPercentA2vB2 = teamAHandicap;

      defender1StatsDetails.stat_array.forEach(function(opponentStats) {
        if (opponentStats.opponent_id == challenger1Id) {
          if (parseInt(opponentStats.win_num) + parseInt(opponentStats.loss_num) >= 5)
            winPercentA1vB1 = opponentStats.recent_win_percent / 100;
        } else if (opponentStats.opponent_id == challenger2Id) {
          if (parseInt(opponentStats.win_num) + parseInt(opponentStats.loss_num) >= 5)
            winPercentA1vB2 = opponentStats.recent_win_percent / 100;
        }
      });
      defender2StatsDetails.stat_array.forEach(function(opponentStats) {
        if (opponentStats.opponent_id == challenger1Id) {
          if (parseInt(opponentStats.win_num) + parseInt(opponentStats.loss_num) >= 5)
            winPercentA2vB1 = opponentStats.recent_win_percent / 100;
        } else if (opponentStats.opponent_id == challenger2Id) {
          if (parseInt(opponentStats.win_num) + parseInt(opponentStats.loss_num) >= 5)
            winPercentA2vB2 = opponentStats.recent_win_percent / 100;
        }
      });

      //get the diffs between handicap and actual win percent for each player combination and average them
      var teamAWinPercent = (winPercentA1vB1 + winPercentA1vB2 + winPercentA2vB1 + winPercentA2vB2) / 4;
      var teamWinPredictor = teamAWinPercent - teamAHandicap + 0.5;
      //$scope.winPercentA = Math.round(teamWinPredictor * 100);
      //$scope.winPercentB = Math.round((1 - teamWinPredictor) * 100);

      return Math.round((1 - teamWinPredictor) * 100);
      //
      //console.log(teamA[0].name + ' v ' + teamB[0].name + ' winPercent: ' + winPercentA1vB1);
      //console.log(teamA[0].name + ' v ' + teamB[1].name + ' winPercent: ' + winPercentA1vB2);
      //console.log(teamA[1].name + ' v ' + teamB[0].name + ' winPercent: ' + winPercentA2vB1);
      //console.log(teamA[1].name + ' v ' + teamB[1].name + ' winPercent: ' + winPercentA2vB2);
      //console.log('TeamA winPercent: ' + $scope.winPercentA);
      //console.log('TeamB winPercent: ' + $scope.winPercentB);
      //console.log('TeamA handicap: ' + teamAHandicap);
    };

  });
