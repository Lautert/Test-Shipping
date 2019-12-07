var AmountComponent = (function($){

	function AmountComponent(elem){
		this.element = $(elem);
		this.callback = [];

		this.events();
	}

	AmountComponent.prototype = {
		addCallback: function(callback){
			this.callback.push(callback);
		},
		events: function(){
			var _this = this;
			_this.element.on('change', 'input', function(){
				var value = parseInt(this.value.replace(/[^\d+-]/g, ''));
				if(isNaN(value) || value < 0){
					this.value = 0;
				}
			});

			_this.element.on('click', '.up', function(){
				var input = _this.element.find('input');
				input.val(parseInt(input.val())+1);
				$(input).trigger('change');
			});

			_this.element.on('click', '.down', function(){
				var input = _this.element.find('input');
				input.val(parseInt(input.val())-1);
				$(input).trigger('change');
			});
		}
	}

	$.fn.AmountComponent = function(){
		new AmountComponent(this);
	}

	return AmountComponent;
}(jQuery));

$(document).ready(function(){
	$('.amount-component').map(function(key, elem){
		new AmountComponent(this);
	});
});