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

      //only return the handicap for team one
      if(teamAElo < teamBElo) {
        return Math.round((teamBElo - teamAElo) / maxEloDiff * MAX_HANDICAP);
      }

      return 0;
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
    this.getTeamWinPercent = function(teamA, teamB){

    };
  });
