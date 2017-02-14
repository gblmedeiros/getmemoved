angular.module('subscription', [])
.factory('SubsFactory', function() {
	var subscription = {};
	return subscription;
})
.service('SubsService', function(SubsFactory) {
	
	this.setSubscription = function(subs) {
		SubsFactory.subscription = subs;
	} 
    
    this.getSubscription = function() {
    	return SubsFactory.subscription;
    }
})
.controller('subsCtrl', function($scope, $http, $location, SubsService) {
	$scope.subscription = {}; //bind
	
	$scope.submitSubscription = function() {
		$http.post('/register', $scope.subscription)
			.success(function(response) {
				$scope.subscription = response;
				SubsService.setSubscription(response);
				$location.path('/welcome').search('name', response.name).search('email', response.email);				
        	}).error(function (data, status, headers) {
        		return status;
			});
          
	}
    
});