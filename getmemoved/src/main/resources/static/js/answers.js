angular.module('answers', [])

.controller("answersCtrl", function($scope, $http, $location, SubsService) {
  	$scope.answers = {};
	$scope.getAnswers = function() {	
		$http.get('/answers')
		.then(function(response) {			
			$scope.answers = response.data;			
		});
	};	
	$scope.getAnswers();	

});

