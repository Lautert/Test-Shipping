$(document).ready(function(){

	var Products = [
		{ id: 1, name: 'Apple', price: 20 },
		{ id: 2, name: 'Banana', price: 10 },
		{ id: 3, name: 'Orange', price: 30 },
	];

	var productList = $('.content-product-list ul');
	Products.map(function(data, key){

		var curr = productList.find('.model').clone();
		curr.removeClass('model');
		curr.find('input[type="hidden"]').val(data.id);
		curr.find('.name').text(data.name);
		curr.find('.unit').text('$ '+data.price);
		curr.find('.total').text('$ 0');
		curr.find('.amount-component input').attr('name', 'amount['+data.id+']');
		curr.find('.amount').AmountComponent();
		
		productList.append(curr);
	});

	var Coupons = [
		{
			id: 1,
			name: 'A',
			benefit: { subtotal: { reduce: { percentage: 30 } } }
		},
		{
			id: 2,
			name: 'FOO',
			benefit: { total: { reduce: { fixed: 100 } } }
		},
		{
			id: 3,
			name: 'C',
			benefit: { shipping: { value: { fixed: 0 } } },
			conditions : {
				min: 300.50
			}
		},
	];

	var CouponCode = [
		{ code: '111', id: 1 },
		{ code: '222', id: 2 },
		{ code: '333', id: 3 },
	];

	var rules = [
		{
			rule: { shipping: { value: { fixed: 0 } } },
			conditions: [
				{ total: { min: 400 } }
			]
		},
		{
			rule: { shipping: { value: { fixed: 30 } } },
			conditions: [
				{ kg: { max: 10 } }
			]
		},
		{
			rule: { shipping: { addition: { fixed: 7 } } },
			conditions: [
				{ kg: { min: 10 } },
				{ kg: { mult: 5 } },
			]
		},
	];


	var Cart = (function($){

		function shoppingCart(elem){
			var _this = this;

			var elem = $(elem);
			_this.elem = {
				cart		: elem,
				productList	: elem.find('.content-product-list'),
				couponList	: elem.find('.content-coupons-list ul'),
				subtotal	: elem.find('.subtotal'),
				shipping	: elem.find('.shipping'),
				total		: elem.find('.total'),
				couponApply	: elem.find('.coupon-apply'),
			};

			_this.products = {};
			_this.coupons = {};

			_this.subtotal	= 0;
			_this.shipping	= 0;
			_this.total		= 0;

			_this.events();
		}

		shoppingCart.prototype = {
			events: function(){
				var _this = this;

				_this.elem.productList.find('.product').on('change', 'input[type="text"]', function(){
					var currProduct = $(this).parents('.product:eq(0)');

					var id = currProduct.find('input[type="hidden"]').val();
					var amount = parseInt(currProduct.find('input[type="text"]').val());
					var price = Products.filter((data, key) => data.id == id)[0].price;

					var total = parseFloat(amount * price);
					if(total > 0){
						_this.products[id] = total;
					}else{
						delete _this.products[id];
					}
					currProduct.find('.total').text('$ '+total);

					_this.invoice();
				});

				_this.elem.couponApply.on('click', 'button', function(){
					var coupon = _this.elem.couponApply.find('input[type="text"]').val();
					if(coupon.length > 0){
						var data = CouponCode.filter((data, key) => data.code == coupon);
						if(data.length > 0){
							var couponId = data[0].id;
							if(Object.keys(_this.coupons).filter((value, key) => value == couponId).length == 0){
								coupon = Coupons.filter((data, key) => data.id == couponId)[0];

								_this.coupons[coupon.id] = true;

								var curr = _this.elem.couponList.find('.model').clone();
								curr.removeClass('model');
								curr.find('input[type="hidden"]').val(coupon.id);
								curr.find('.name').text('Coupon '+coupon.name);

								_this.elem.couponList.append(curr);
								_this.invoice();
							}else{
								console.log('coupon already used');
								// CRIAR MODAL COM ERRO DE CUPOM
							}
						}else{
							console.log('coupon not valid');
							// CRIAR MODAL COM ERRO DE CUPOM
						}
					}
				});

				_this.elem.couponList.on('click', '.coupon-remove', function(){
					var currCoupon = $(this).parents('.coupon:eq(0)');
					var id = currCoupon.find('input[type="hidden"]').val();
					delete _this.coupons[id];
					currCoupon.remove();
					_this.invoice();
				});
			},
			invoice: function(){
				console.log('change invoice');
			},
		}

		return shoppingCart;
	}(jQuery));

	new Cart('.form-content-cart');
});
