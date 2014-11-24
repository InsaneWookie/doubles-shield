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
    var rivlBaseUrl = 'http://rivl.kitomba.net/';

    $scope.handicap = null;
    $scope.handicapedTeam = "";

    $scope.team1 = [];
    $scope.team2 = [];

    $http.get(rivlBaseUrl + 'vs_api/competition/competitors?competition_id=2').success(function(competitors){

      competitors.forEach(function(player){
        player.playerImage = rivlBaseUrl + 'img/avatars/2_' + player.competitor_id + '_0.png';
      });

    	$scope.team1 = competitors.sort(function(a,b){ return a.rank - b.rank });

    	$scope.team2 = angular.copy(competitors);
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
          player.selected = !$scope.team1.some(canSelectedFunc);
        } else {
          player.selected = !$scope.team2.some(canSelectedFunc);
        }
      }



      if(allSelectedFunc()){
        calculateHandicap();
      } else {
        $scope.handicap = null;
        $scope.handicapedTeam = "";
      }
    };


    function allSelectedFunc(){
      var count = 0;

      function countSelected(player){
        if(player.selected) { count++; }
      }

      $scope.team1.some(countSelected);
      $scope.team2.some(countSelected);

      return count === 4;
    }

    function calculateHandicap(){

      var team1Rank = 0;
      var team2Rank = 0;
      $scope.team1.forEach(function sumRank(player){
        team1Rank += (player.selected) ? player.rank : 0;
      });

      $scope.team2.forEach(function sumRank(player){
        team2Rank += (player.selected) ? player.rank : 0;
      });

      if(team1Rank < team2Rank){
        $scope.handicap = Math.round((team2Rank - team1Rank) / 2);
        $scope.handicapedTeam = "1";
      } else {
        $scope.handicap = Math.round((team1Rank - team2Rank) / 2);
        $scope.handicapedTeam = "2";
      }

    }

  });
