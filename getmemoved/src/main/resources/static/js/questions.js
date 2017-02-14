angular.module('questions', [])

.controller("questionsCtrl", function($scope, $http, $location, SubsService) {
  	$scope.formData = {};
	$scope.getQuestions = function() {	
		var subs = SubsService.getSubscription();
		var name = $location.search().name
		var email = $location.search().email
		
		if (subs == null && name != null && email != null) {
			subs = {
				name: name,
				email: email
			};
			SubsService.setSubscription(subs);
		}
		
		$http.get('/survey/new?name=' + name + '&email=' + email)
		.then(function(response) {			
			$scope.formData.questions = response.data.questions;			
		});
	};	
	$scope.getQuestions();
	
	$scope.submitQuestions = function() {
		console.log($scope);
		if (SubsService.getSubscription().email != null ) {
			var submission = {
				subscription: SubsService.getSubscription(),
				questions: $scope.formData.questions,
			} 		
			$http.post('/survey/submit', submission)
				.success(function(response) {
					$location.path("/subscription");				
	        });
		}
          
	}

});
