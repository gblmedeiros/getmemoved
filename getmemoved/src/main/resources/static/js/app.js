angular.module('app', ['ngRoute', 'subscription', 'questions', 'answers'])

.config(function($routeProvider, $httpProvider) {
    $routeProvider
	  .when('/subscription', { templateUrl: "templates/subscription.html", controller: "subsCtrl" })
      .when("/welcome", { templateUrl: "templates/questions.html", controller: "questionsCtrl" })
      .when("/view-answers", { templateUrl: "templates/answers.html", controller: "answersCtrl" })      
	  .otherwise( { redirectTo: "/subscription" });
	  
})


.config(['$locationProvider', function($locationProvider) {
 	$locationProvider.hashPrefix('');
}])  
.controller('mainCtrl', ['$scope', function ($scope) {
	
}]);