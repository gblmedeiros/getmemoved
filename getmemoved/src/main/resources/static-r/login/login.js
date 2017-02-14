angular.module('loginMdl',[])

.factory("usuarioLogado", function (){
		
	return usuarioLogado = {};	
})

.service("loginService", function (usuarioLogado){

	this.getUsuario  = function(usuario){
        return usuarioLogado;
    };     

    this.setUsuario  = function(usuario){
        return usuarioLogado.login = usuario;
    }; 

    this.deslogarUsuario = function(){
    	return usuarioLogado = {};
    }

})

.controller("loginCtrl", function($scope, $location, $http, loginService) {
  
	var validaLogin = function(){
	
		if ($scope.logintxt === 'admin' &&
			$scope.passwordtxt === '123'){
			return true
		}
	
		return false;
	};
  

	var montaBody = function(){

		return {
			"login":  $scope.logintxt,		
			"password" : $scope.passwordtxt
		}
	};

	$scope.login1 =  function () {
	
		$http.get('http://server-vigilante.rhcloud.com/vigilante/login').success(function(response) {

				console.log("sucesso");
		        loginService.setUsuario($scope.logintxt);
				$location.path("/filtroMensagens");

	    }).error(function(e){

	    	console.error("Erro ao efetuar login!", e);
	    	//loginFake();
	    });		
		
	};


	$scope.login =  function () {

		var body = montaBody();

		console.log("entrei");
		loginService.setUsuario($scope.logintxt);
		$location.path("/filtroMensagens");
	
		/*$http.post('http://server-vigilante.rhcloud.com/vigilante/login', body).success(function(response) {

				console.log("sucesso");
		        loginService.setUsuario($scope.logintxt);
				$location.path("/filtroMensagens");

	    }).error(function(e){

	    	console.error("Erro ao efetuar login!", e);
	    	loginFake();
	    });		*/
		
	};

	var loginFake = function(){

		console.log('login fae enter');

		if (validaLogin()){

			loginService.setUsuario($scope.logintxt);
			$location.path("/filtroMensagens");
			
		} else {
			$scope.hasError = true;
			$scope.msgErro = decodeURI("Login ou senha inválidos");
		}			
	};

});