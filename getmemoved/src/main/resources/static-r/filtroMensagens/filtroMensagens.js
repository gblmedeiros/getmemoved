angular.module('filtroMensagensMdl', ['mensagemDetalheMdl'])

.controller("filtroMensagensCtrl", function($scope, $http, $timeout, loginService) {
  
	$scope.cidades = [];
	$scope.estadosCidades = [];
	
	$http.get('assets/json/cidades_estados.json', 
		{
			header : 
				{
					'Content-Type' : 'application/json; charset=UTF-8',
					'dataType' : 'json'
					}
		}).
	success(function(response) {
         $scope.estadosCidades = response;
    });
  
	$scope.mensagens = [];
	
	$scope.carregarCidades = function(){

		$scope.cidade = '';
		for (var i in $scope.estadosCidades){
			var estado = $scope.estadosCidades[i];

			if (estado.nome === $scope.estado){

				$scope.existeEstado = true;
				$scope.cidades = estado.cidades;
				break;
			}
		}		
	};

	$scope.usuario = loginService.getUsuario();

	$scope.setCurrentPage = function(page){

		$scope.currentPage = page.currentPage;
	};

	$scope.setCurrentPage2 = function(currentPage){

		$scope.currentPage = currentPage;
	};
	
	$scope.msgSelecionada = [];	
	$scope.exibirDetalheMsg = function(m){
		$scope.msgSelecionada.push(m);
	};

	$scope.callback = function() {
		$scope.msgSelecionada = [];	
	};
	
	$scope.trataPaginacaoMensagem = function() {
		var begin = (($scope.currentPage - 1) * $scope.itemsPerPage),
		end = begin + $scope.itemsPerPage;

		$scope.filteredMensagens = $scope.mensagens.slice(begin, end);

		$timeout(function() {
			$('#paginacao').find('a:first').html('Anterior');
			$('#paginacao').find('a:last').html('Próximo');
		});
		
	};

	$scope.currentPage = 1;
	var iniciaPaginacao = function(){
	
		$scope.totalItems = $scope.mensagens.length;
		$scope.itemsPerPage = 10;
		$scope.maxSize = 5;
		$scope.numPages = Math.ceil($scope.mensagens.length / $scope.itemsPerPage);
		$scope.currentPage = $scope.currentPage !== 1 ? $scope.currentPage : 1;
		
		$scope.denFim = $scope.currentPage * $scope.itemsPerPage;
		$scope.denIni = $scope.currentPage > 1 ? ($scope.currentPage - 1) * $scope.itemsPerPage : 1;
		$scope.denFim = $scope.denFim > $scope.mensagens.length ? $scope.mensagens.length : $scope.denFim;
		$scope.trataPaginacaoMensagem();
	};
	
	var trataMensagemMaiorPermitido = function(){
		
		var numPermitido = 100;
		$scope.mensagens.map(function(ele){
			
			ele.mensagemTrunk = ele.mensagem.substring(0, numPermitido - 1);
			
			return ele;
		});
	};
	
	$scope.exportXls = function(){
		var excelFile = $("#tabelaExport").battatech_excelexport({
            containerid: "tabelaExport",
            datatype: 'table'
        });

        var blob = b64toBlob(excelFile, "data:application/vnd.ms-excel;base64");
        var file = saveAs(blob, "exportarMensagens.xls");
	};
	
	var b64toBlob = function(b64Data, contentType, sliceSize){
	
        contentType = contentType || '';
        sliceSize = sliceSize || 512;

        var byteCharacters = atob(b64Data);
        var byteArrays = [];

        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);

            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            byteArrays.push(byteArray);
        }

        var blob = new Blob(byteArrays, {type: contentType});
        return blob;
    };

	$scope.exportDoc = function(){
		$("#tabelaExport").wordExport('mensagens');
	};

	$scope.urlAnexo = 'http://server-vigilante.rhcloud.com/vigilante/denuncia/anexo?idDenuncia=';	
	
	var removeDenuncia = function(denuncia){
		
		var idx = $scope.mensagens.indexOf(denuncia);
		$scope.mensagens.splice(idx, 1);
		
		/*idx = $scope.filteredMensagens.indexOf(denuncia);
		$scope.filteredMensagens.splice(idx, 1);*/
		
		iniciaPaginacao();
	};
	
	$scope.excluirDenuncia = function(denuncia){
	
		var decisao = confirm("Deseja realmente excluir a denúncia?");
		if (!decisao){
			return;
		}
	
		$http.delete('http://server-vigilante.rhcloud.com/vigilante/denuncia?idDenuncia=' + denuncia.id, 
			{
				header : 
					{
						'Content-Type' : 'application/json; charset=UTF-8',
						'dataType' : 'jsonp'					
						}
			}).success(function(response) {
	         
				removeDenuncia(denuncia);
			}).error(function(e){
			
				console.error("erro ao remover a denuncia!", e);
			});		
	};	

	$scope.carregarCorporacao = function(){
	
		$http.get('http://server-vigilante.rhcloud.com/vigilante/corporacao', 
			{
				header : 
					{
						'Content-Type' : 'application/json; charset=UTF-8',
						'dataType' : 'json'
						}
			}).success(function(response) {

				$scope.corporacoes = response;

			}).error(function(e){

				console.error("erro ao consultar as corporações!", e);

			});
	};	

	$scope.carregarNatureza = function(){

		$http.get('http://server-vigilante.rhcloud.com/vigilante/natureza', 
			{
				header : 
					{
						'Content-Type' : 'application/json; charset=UTF-8',
						'dataType' : 'json'					
						}
			}).success(function(response) {

	         	$scope.naturezas = response;

	    	}).error(function(e){

				console.error("erro ao consultar as naturezas!", e);

			});	
	};

	var montaBody = function(){

		return {
			"estado" :  $scope.estado,		
			"nomeCidade" : $scope.cidade,
			"idCorporacao" : $scope.corporacao,
			"idNatureza" : $scope.natureza,
			"dataInicio" : $scope.dtInicio,
			"dataFim" : $scope.dtFim
		}
	};

	$scope.consultarDados = function(){

		montaJson();
		trataMensagemMaiorPermitido();
		iniciaPaginacao();
		
		/*var body = montaBody();
		$scope.currentPage = 1;

		$http.post('http://server-vigilante.rhcloud.com/vigilante/denuncia/list', body,
			{
				header : 
					{
						'Content-Type' : 'application/json; charset=UTF-8',
						'dataType' : 'json'					
						}
			}).
		success(function(response) {
		
			if (response && response.length > 0){
		        $scope.hasError = false;
				$scope.mensagens = response;
				trataMensagemMaiorPermitido();
				iniciaPaginacao();
			} else {
				
				$scope.hasError = true;
				$scope.msgErro = "Não foram encontrados dados para os filtros escolhidos!";
				$scope.mensagens = [];				
				iniciaPaginacao();
			}
			
	    }).error(function(e){
	    	console.error("erro na consulta", e);
			//consultarSucesso();
	    });*/
	};

	$scope.carregarCorporacao();
	$scope.carregarNatureza();

	var options = {
		dateFormat: 'dd/mm/yy',
		dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
		dayNamesMin: ['D','S','T','Q','Q','S','S','D'],
		dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb','Dom'],
		monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
		monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
		nextText: 'Próximo',
		prevText: 'Anterior'
	};
		
	$("#dtInicio").datepicker(options);
	$("#dtFim").datepicker(options);

	var montaJson = function(){
		$scope.mensagens = [
			{
				"mensagem" : "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},
						{
				"mensagem" : "texto2",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},
			{
				"mensagem" : "texto3",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto4",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto5",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto6",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto7",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto8",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto9",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto10",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto11",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto12",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto13",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto14",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto15",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto16",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto17",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto18",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto19",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto20",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto21",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto22",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto23",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto24",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto25",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto26",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto27",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto28",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto29",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto30",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto31",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto32",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto33",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto34",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},
						{
				"mensagem" : "texto35",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto36",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto37",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto38",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto39",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto40",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto41",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto42",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto43",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto44",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto45",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto46",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},
						{
				"mensagem" : "texto47",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto48",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto49",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},
						{
				"mensagem" : "texto50",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},
						{
				"mensagem" : "texto51",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto52",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},
			{
				"mensagem" : "texto53",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},
						{
				"mensagem" : "texto54",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto55",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto56",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto57",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto58",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto59",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto60",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto61",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto62",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto63",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto64",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto65",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto66",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			},

						{
				"mensagem" : "texto67",
				"estado" : "SP",
				"cidade" : "piracicaba",
				"dtDenuncia" : "20/07/2016",
				"dtOcorrencia" : "17/07/2016",
				"anexo" : "bla"
			}
		];	
	}
});
