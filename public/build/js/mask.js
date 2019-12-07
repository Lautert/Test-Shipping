(function($){
	$(document).ready(function(){

		$('body').on('focus', '.phone', function(){
			var maskBehavior = function (val) {
				return val.replace(/\D/g, '').length === 11 ? '(00) 00000-0000' : '(00) 0000-00009';
			},
			options = {
				onKeyPress: function(val, e, field, options) {
					field.mask(maskBehavior.apply({}, arguments), options);
				}
			};
			$(this).mask(maskBehavior, options);
		});

		$('body').on('focus', '.mail', function(){
			$(this).mask("A", {
				translation: {
					"A": { pattern: /[\w@\-._]/, recursive: true }
				}
			});
		})

		$('body').on('focus', '.ncm', function(){
			$(this).mask('0000.0000');
		});
			
		$('body').on('focus', '.cep', function(){
			$(this).mask('00000-000');
		});

		$('body').on('focus', '.date', function(){
			$(this).mask('00/00/0000');
		});
		
		$('body').on('click', '.date', function(e){
			$(this).datepicker({
				showOtherMonths: true,
				showButtonPanel: true,
				selectOtherMonths: true,
				changeMonth: true,
				changeYear: true,
				language: 'pt'
			});
			$(this).datepicker("show");
		});
		
		$('body').on('focus', '.hora', function(){
			$(this).mask('00:00');
		});
		
		$('body').on('focus', '.cnpj', function(){
			$(this).mask('00.000.000/0000-00');
		});
		
		$('body').on('focus', '.cpf', function(){
			$(this).mask('000.000.000-00');
		});

		$('body').on('focus', '.rg', function(){
			$(this).mask("00.000.000-0");
		});

		$('body').on('focus', '.money', function(){
			$(this).mask('#.##0,00', {reverse: true});
		});
		
		$('body').on('focus', '.onlyNumber', function(){
			$(this).mask("#");
		});
	});	
}(jQuery));

// $('input[type="date"]').datetimepicker({
//     isRTL: false,
//     format: 'dd.mm.yyyy',
//     autoclose:true,
//     language: 'pt'
// });

// $("#datepicker").datepicker({
//     showOtherMonths: true,
//     selectOtherMonths: true,
//     dateFormat: 'dd-mm-yy',
//     dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
//     dayNamesMin: ['D', 'S', 'T', 'Q', 'Q', 'S', 'S', 'D'],
//     dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
//     monthNames: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
//     monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
//     nextText: 'Proximo',
//     prevText: 'Anterior'
// });