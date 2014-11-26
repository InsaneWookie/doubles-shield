'use strict';

/**
 * @ngdoc function
 * @name doublesShieldApp.controller:ChallengeCtrl
 * @description
 * # ChallengeCtrl
 * Controller of the doublesShieldApp
 */
angular.module('doublesShieldApp')
  .controller('ChallengeCtrl', function ($scope, $http, $firebase) {

    //var rivlBaseUrl = 'http://localhost:8090/';
    //var rivlBaseUrl = 'http://localhost/rivl/';
    var rivlBaseUrl = 'http://rivl.kitomba.net/';

    var firebaseUrl = 'https://doubles-shield-dev.firebaseio.com';
    //var firebaseUrl = 'https://fiery-inferno-5661.firebaseio.com';

    //var defenders = {
    //  player1: null,
    //  player2: null
    //};

    $scope.challengers = [];

    var challengersFB = new Firebase(firebaseUrl + '/challengers');
    var challangersSync = $firebase(challengersFB);

    var challangers = challangersSync.$asArray();
    $scope.challengers = challangers;



    var ref = new Firebase(firebaseUrl + '/defenders');
    var sync = $firebase(ref);

    // download the data into a local object
    //$scope.defenders = sync.$asObject();
    // synchronize the object with a three-way data binding
    // click on `index.html` above to see it used in the DOM!
    //defenders.$bindTo($scope, "defenders");
    var obj = sync.$asObject();
    obj.$loaded()
      .then(function(data) {
        console.log(data); // true
      })
      .catch(function(error) {
        console.error("Error:", error);
      });

    $scope.defenders = obj;


    $http.get(rivlBaseUrl + 'vs_api/competition/competitors?competition_id=2').success(function(competitors){

      var activeCompetitors = [];
      competitors.forEach(function(player){
        if (player.activeRank) {
          player.playerImage = rivlBaseUrl + 'img/avatars/2_' + player.competitor_id + '_0.png';
          activeCompetitors.push(player);
        }
      });

      $scope.team = activeCompetitors.sort(function(a,b){ return a.activeRank - b.activeRank; });

      //$scope.defenders.player1 = competitors[0];
      //$scope.defenders.player2 = competitors[1];
      //
      //$scope.defenders.$save();

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

      if(!$scope.defenders.player1){ //see if we have any data
        //$scope.defenders = newTeam; //cant do this as it will kill the firebase binding
        $scope.defenders.player1 = selectedPlayers[0];
        $scope.defenders.player2 = selectedPlayers[1];
        $scope.defenders.$save();
      } else {
        $scope.challengers.$add(newTeam);
      }
    }

  });
