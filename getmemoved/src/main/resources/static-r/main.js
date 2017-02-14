angular.module('mainApp', ['ngRoute', 'ui.bootstrap', 'loginMdl', 'filtroMensagensMdl'])

.config(function($routeProvider, $httpProvider) {
    $routeProvider.
	  when('/', { templateUrl: "login/login.html", controller: "loginCtrl" }).
      when("/login", { templateUrl: "login/login.html", controller: "loginCtrl" }).      
	  when("/filtroMensagens", { templateUrl: "filtroMensagens/filtroMensagens.html", controller: "filtroMensagensCtrl" }).
	  otherwise( { redirectTo: "/login" });
	  
})

.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        $httpProvider.defaults.headers.common = 'Content-Type: application/json';
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
])

.run(function($rootScope, $location, loginService) {

    $rootScope.$on( "$routeChangeStart", function(event, next, current) {
		
		if (!loginService.getUsuario().login) {
			$location.url("/login");
		}

    });
  })
  
.controller('mainCtrl', ['$scope', function ($scope) {
	
}]);