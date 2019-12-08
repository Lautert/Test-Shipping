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
			text: '(30%)',
			benefit: { subtotal: { reduce: { percentage: 30 } } },
		},
		{
			id: 3,
			name: 'C',
			text: 'Free Shipping',
			benefit: { shipping: { value: { fixed: 0 } } },
			conditions : [
				{ subtotal: { min: 300.50, max: 400 } }
			]
		},
		{
			id: 2,
			name: 'FOO',
			text: '$ 100',
			benefit: { total: { reduce: { fixed: 100 } } },
			conditions : [
				{ total: { min: 101 } }
			]
		},
	];

	var CouponCode = [
		{ code: '111', id: 1 },
		{ code: '222', id: 2 },
		{ code: '333', id: 3 },
	];

	var rules = [
		{
			rule: { shipping: { value: { fixed: 30 } } },
			conditions: [
				{ kg: { min: 1 } }
			]
		},
		{
			rule: { shipping: { addition: { fixed: 7 } } },
			conditions: [
				{ kg: { min: 10 } },
				{ kg: { mult: 5, recursive: true } },
			]
		},
		{
			rule: { shipping: { value: { fixed: 0 } } },
			conditions: [
				{ subtotal: { min: 400 } }
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
			Coupons.map(function(data){
				_this.coupons["_"+data.id] = false;
			});

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
						_this.products[id] = { amount:amount, total:total };
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
							if(!_this.coupons['_'+couponId]){
								coupon = Coupons.filter((data, key) => data.id == couponId)[0];

								_this.coupons['_'+couponId] = true;

								var curr = _this.elem.couponList.find('.model').clone();
								var input = curr.find('input[type="hidden"]');
								curr.removeClass('model');
								input.val(coupon.id);
								input.attr('name', 'coupon['+couponId+']');
								curr.find('.name').text('Coupon '+coupon.name);

								_this.elem.couponList.append(curr);
								_this.invoice();
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
					_this.coupons['_'+id] = false;
					currCoupon.remove();
					_this.invoice();
				});

				_this.elem.cart.on('submit', function(){
					var data = $(this).serializeArray();
					console.log(data);
				});
			},
			invoice: function(){
				var _this = this;

				var invoice = {
					subtotal: Object.values(_this.products).reduce((total, data) => total + data.total, 0),
					shipping: 0,
					amount: Object.values(_this.products).reduce((total, data) => total + data.amount, 0),
				}
				invoice.total = invoice.subtotal + invoice.shipping;

				function applyBenefit(values, benefit){
					var data = benefit;
					if(data.shipping){
						if(data.shipping.value){
							if(data.shipping.value.fixed !== undefined){
								values.shipping = data.shipping.value.fixed;
								values.total = values.subtotal + values.shipping;
							}
						}
						if(data.shipping.addition){
							if(data.shipping.addition.fixed !== undefined){
								values.shipping += data.shipping.addition.fixed;
								values.total = values.subtotal + values.shipping;
							}
						}
					}
					if(data.subtotal){
						if(data.subtotal.reduce){
							if(data.subtotal.reduce.percentage !== undefined){
								values.subtotal = values.subtotal - (values.subtotal * (data.subtotal.reduce.percentage / 100));
								values.total = values.subtotal + values.shipping;
							}
						}
					}
					if(data.total){
						if(data.total.reduce){
							if(data.total.reduce.fixed !== undefined){
								values.total = values.total - data.total.reduce.fixed;
							}
						}
					}
					return values;
				}

			// { === RULES =====
				rules.map(function(rule){
					var steps = [];
					var recursive = 1;
					rule.conditions.map(function(data){
						if(data.kg){
							if(data.kg.max){
								steps.push(invoice.amount <= data.kg.max);
							}
							if(data.kg.min){
								steps.push(invoice.amount >= data.kg.min);
							}
							if(data.kg.mult){
								steps.push((invoice.amount / data.kg.mult) > 2);
							}
							if(data.kg.recursive){
								var r = Math.ceil(invoice.amount / data.kg.mult) - 2;
								recursive = r > 0 ? r : 1;
							}
						}else
						if(data.subtotal){
							if(data.subtotal.min){
								steps.push(invoice.subtotal >= data.subtotal.min);
							}
						}
					});
					if(steps.reduce((bool, value) => bool && value)){
						for(var i = 0; i < recursive; i++){
							invoice = applyBenefit(invoice, rule.rule);
						}
					}
				});
			// } === END RULES =====

			// { === COUPON =====
				var coupons = [];
				for(var i in _this.coupons){
					if(_this.coupons[i]){
						coupons.push(i);
					}
				}

				coupons.map(function(id){
					id = id.replace(/\D/g, '');
					var coupon = Coupons.filter((data) => data.id == id)[0];
					
					var elemCoupon = _this.elem.couponList.find('input[type="hidden"][value="'+id+'"]').parents('.coupon:eq(0)');
					var couponText = coupon.text;
					if(id == 1){
						var valueReduce = (invoice.subtotal * (coupon.benefit.subtotal.reduce.percentage / 100));
						couponText = '$ -'+valueReduce+' '+couponText;
					}
					elemCoupon.find('.coupon-benefits').text(couponText);

					var steps = [];
					var recursive = 1;

					if(coupon.conditions){
						coupon.conditions.map(function(data){
							if(data.subtotal){
								if(data.subtotal.min){
									steps.push(invoice.subtotal >= data.subtotal.min);
								}
								if(data.subtotal.max){
									steps.push(invoice.subtotal < data.subtotal.max);
								}
							}
							if(data.total){
								if(data.total.min){
									steps.push(invoice.total >= data.total.min);
								}
							}
						});
					}else{
						steps.push(true);
					}
					if(steps.reduce((bool, value) => bool && value)){
						for(var i = 0; i < recursive; i++){
							invoice = applyBenefit(invoice, coupon.benefit);
						}
						elemCoupon.find('.coupon-benefits').removeClass('error');
					}else{
						elemCoupon.find('.coupon-benefits').addClass('error');
					}
				});
			// } === END COUPON =====

				_this.elem.subtotal.find('.value').text('$ '+invoice.subtotal);
				_this.elem.shipping.find('.value').text('$ '+invoice.shipping);
				_this.elem.total.find('.value').text('$ '+invoice.total);
			},
		}

		return shoppingCart;
	}(jQuery));

	new Cart('.form-content-cart');
});
