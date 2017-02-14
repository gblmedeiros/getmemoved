angular.module('mensagemDetalheMdl', [])

.directive('mensagemDetalhe', function() {
  return {
      restrict: 'AE',
      replace: 'true',
      required: 'ngModel',
      templateUrl : 'filtroMensagens/mensagemDetalhe/mensagemDetalhe.html',
      scope: {
           ngModel : '=',
           callback : '&'
      },
      controller: 'mensagemDetalheCtrl'  
  };
})

.controller("mensagemDetalheCtrl", function($scope) {

	$scope.mensagemSelecionada = $scope.ngModel[0];

	$scope.fechar = function(){
		
		$scope.callback();
	};

});