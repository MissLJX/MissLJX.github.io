/**
 * Created by s_lei on 2017/1/3.
 */

template.helper('formatPrice', function (price) {
    if (price) {
        return price.unit + price.amount;
    }
    return '';
});

template.helper('subtotal', function (price, qty) {
    if (price && qty) {
        return price.unit + (price.amount * qty).toFixed(2);
    }
    return '';
});

template.helper('getShippingField', function (shipping , field) {
    if(!shipping)
        return '';
    return shipping[field];
});

template.helper('getCoponAmount', function (coupon) {
    return coupon.amount.indexOf('%') >= 0 ? coupon.amount : '$' + coupon.amount;
});

var ShoppingCartModule = ModuleBase.extend({
    EVENTS: {
        '#ninimour-select-coupon': {
            'click': function (self, _this, e) {
                ninimour.event.stop(e);
                ShoppingCart.showCoupons();
            }
        },
        '.ninimour-shipping-method': {
            'click': function (self, _this, e) {
                ninimour.event.stop(e);
                var method = $(_this).data('method');
                self.selectShippingMethod(method, function (data) {
                    self.fire('REFRESH-SHOPPING-CART');
                });
            }
        },
        '#ninimour-coupon-unuse': {
            'click': function (self, _this, e) {
                ninimour.event.stop(e);
                self.unUseCoupon(function(data){
                    self.fire('REFRESH-SHOPPING-CART');
                });
            }
        },
        '#ninimour-quick-pay': {
            'click': function (self, _this, e) {
                ninimour.event.stop(e);
                self.placePaypal('quick');
            }
        },

        '#ninimour-paypayl-pay': {
            'click': function(self , _this , e){
                ninimour.event.stop(e);
                self.placePaypal('normal');
            }
        },

        '#ninimour-ocean-pay': {
            'click':function(self , _this , e){
                var cart = self.get('_shopping_cart') , method = cart.payMethod;
                if(!cart.shippingDetail){
                    $('body,html').animate({scrollTop:0},0);
                    alert('Please confirm your shipping address!');
                    return;
                }
                ninimour.anchor.open(ninimour.base.ctx + '/shoppingcart/credit-card');
            }
        },


        '#ninimour-check-out': {
            'click': function(self , _this , e){
                ninimour.event.stop(e);
                ninimour.anchor.open(ninimour.base.ctx + '/shoppingcart/authc');
            }
        },

        '#ninimour-place-order':{
            'click': function(self, _this, e){
                ninimour.event.stop(e);
                ninimour.anchor.open(ninimour.base.ctx + '/shoppingcart/pay/checkout');
            }
        },

        '#ninimour-choose-address-btn':{
            'click': function(self , _this , e){
                ninimour.event.stop(e);
                $('#ninimour-address').hide();
                $('#ninimour-shipping-addressed-wrapper').slideDown();
            }
        },
        '#ninimour-address-cancel':{
            'click': function(self , _this , e){
                ninimour.event.stop(e);
                $('#ninimour-shipping-addressed-wrapper').slideUp();
                $('#ninimour-address').show();
            }
        },
        '#ninimour-address-use':{
            'click': function(self , _this , e){
                ninimour.event.stop(e);
                var addressId = $('#ninimour-shipping-addresses li.active').data('address');
                if(addressId){
                    self.selectAddress(addressId , function(data){
                        self.fire('REFRESH-SHOPPING-CART');
                    });
                }

            }
        },
        '#ninimour-shipping-addresses li':{
            'click': function(self , _this , e){
                ninimour.event.stop(e);
                $(_this).addClass('active').siblings().removeClass('active');
            }
        },
        '.ninimour-cart-product-delete':{
            'click': function(self , _this , e){
                ninimour.event.stop(e);
                var variantId = $(_this).attr('variant-id');
                self.deleteVariant(variantId , function(data){
                    self.fire('REFRESH-SHOPPING-CART',data.result);
                });
            }
        },
        '.ninimour-reduce-quantity':{
            'click': function(self , _this , e){
                ninimour.event.stop(e);
                var variantId = $(_this).attr('variant-id') , quantity = $(_this).next().val();

                if(isNaN(quantity) || quantity <= 0){
                    quantity = 1;
                }else{
                    if(quantity > 1)
                        quantity--;
                }

                self.changeQuantity(variantId , quantity , function(data){
                    self.fire('REFRESH-SHOPPING-CART',data.result);
                });
            }
        },
        '.ninimour-add-quantity':{
            'click': function(self , _this , e){
                ninimour.event.stop(e);
                var variantId = $(_this).attr('variant-id') , quantity = $(_this).prev().val();

                if(isNaN(quantity)){
                    quantity = 1;
                }else{
                    quantity++;
                }

                self.changeQuantity(variantId , quantity , function(data){
                    self.fire('REFRESH-SHOPPING-CART',data.result);
                });
            }
        }

    },
    setUp: function () {
        var self = this;
        self.loaddingPaypalUrl();
        this.loadShoppingCart(function (cart) {

            cart = self.prepare(cart);
            self.render(cart);
            if (cart.coupon) {
                ShoppingCart.loadCoupons(cart.coupon.id);
            }

            self.on('REFRESH-SHOPPING-CART', function (shoppingcart) {

                if (shoppingcart) {
                    self.reSet(shoppingcart);
                } else {
                    self.loadShoppingCart(function (cart) {
                        self.reSet(cart);
                    });
                }

            });

            self.afterInit();

        });
    },
    reSet: function (shoppingcart) {
        var self = this;
        shoppingcart = self.prepare(shoppingcart);
        self.setChuckData(shoppingcart);
        self.fire('SHOPPING-CART-REFRESHED',shoppingcart);
        self.afterInit(true);
    },
    prepare: function (shoppingcart) {

        if(shoppingcart){
            shoppingcart['shoppingpath'] = shoppingpath;
            shoppingcart['staticRefresh'] = staticRefresh;
        }else{
            shoppingcart = {empty:true};
        }


        this.set('_shopping_cart', shoppingcart);
        return shoppingcart;
    },
    afterInit: function(isReset){
        //init country & state
        var self = this;
        var cart = self.get('_shopping_cart');
        var shipping = cart.shippingDetail;
        var selectedCountry = shipping?shipping.country : null;
        var countryHtmls = [];
        self.loadDictionary('country',function(data){
            var countries = data.result;
            if(countries && countries.length > 0){
                var country;
                for(var i = 0 , len = countries.length ; i < len ; i++){
                    country = countries[i];

                    if(selectedCountry && selectedCountry.value && selectedCountry.value == country.value){
                        countryHtmls.push('<option selected  value="'+country.value+'">'+country.label+'</option>');
                    }else{
                        countryHtmls.push('<option  value="'+country.value+'">'+country.label+'</option>');
                    }
                }
            }

            if(countryHtmls.length > 0){
                $('#country').append(countryHtmls.join(''));
            }
        });



        function createState(changedCountry){
            if(changedCountry && changedCountry!='-1'){
                var stateHtmls = [];
                var selectedState = shipping?shipping.state:null;
                self.loadDictionary('state-'+changedCountry,function(data){
                    var states = data.result;
                    if(states && states.length > 0){
                        stateHtmls.push('<select id="state">');
                        stateHtmls.push('<option value="-1">State*</option>');
                        var state;
                        for(var i = 0 , len = states.length ; i < len ; i++){
                            state = states[i];


                            if(selectedState && selectedState.value && selectedState.value == state.value){
                                stateHtmls.push('<option selected  value="'+state.value+'">'+state.label+'</option>');
                            }else{
                                stateHtmls.push('<option  value="'+state.value+'">'+state.label+'</option>');
                            }

                        }

                        stateHtmls.push('</select>');
                    }

                    if(stateHtmls.length > 0){
                        $('#state-selector').empty().append(stateHtmls.join(''));
                    }else{
                        $('#state-selector').empty().append('<input class="x-input" type="text" placeholder="State" id="state">');
                    }

                });
            }else{
                $('#state-selector').empty().append('<input class="x-input" type="text" placeholder="State" id="state">');
            }
        }

        createState(selectedCountry?selectedCountry.value:null);

        if(!isReset){
            $(document).on('change','#country',function(event){
                ninimour.event.stop(event);
                createState($(this).val());
            });


            $(document).on('submit','#caddress-form',function(event){
                ninimour.event.stop(event);
                self.addressSave(function(data){
                    self.fire('REFRESH-SHOPPING-CART');
                });
                return false;

            });
        }

        if(shipping){
            if(shoppingpath == '2'){
                self.loadShippingDetails(shipping);
            }
        }

    },

    selectAddress:function(addressId , callBack){
        var self = this;
        ninimour.http.get(ninimour.base.ctx + ninimour.base.vpath + '/customer/'+addressId+'/set-default-shipping-detail' , {} , callBack);
    },

    addressSave:function(callBack){
        var self = this , token = $('#token').val(),
            name = $('#name').val(),
            country = $('#country').val(),
            state = $('#state').val(),
            city = $('#city').val(),
            unit = $('#unit').val(),
            zipCode = $('#zipCode').val(),
            phoneNumber = $('#phoneNumber').val(),
            streetAddress1 = $('#streetAddress1').val();

        staticRefresh = true;

        if(state == '-1'){
            alert('State is required');
            return false;
        }


        ninimour.http.post(ninimour.base.ctx + ninimour.base.vpath + '/paypal2/anon/shipping-details-save',{
            token : token ,
            name : name,
            country : country,
            state : state,
            city : city,
            unit : unit,
            zipCode : zipCode,
            phoneNumber : phoneNumber,
            streetAddress1 : streetAddress1
        },callBack,function(data){
            alert(data.result);
        });

    },





    placePaypal:function(method){
        var self = this ,  paypalCkeckoutUrl = self.get('paypalCkeckoutUrl');
        var cart = self.get('_shopping_cart');
        var url = ninimour.base.ctx + '/shoppingcart/pay/paypal/pay?method='+method;


        if(!cart.shippingDetail){
            $('body,html').animate({scrollTop:0},0);
            alert('Please confirm your shipping address!');
            return;
        }


        ninimour.http.get(url,{},function(data){

            var token = data.result.TOKEN;
            var successed = data.result.success , transationId = data.result.transactionId;

            if(successed && transationId && !token){
                ninimour.anchor.open(ninimour.base.ctx + ninimour.vpath + '/order/confirm/free?transationId='+transationId);
                return;
            }

            var ack = data.result.ACK;

            if(ack == 'Failure'){
                alert(data.result.L_LONGMESSAGE0);
                return;
            }

            if (token && paypalCkeckoutUrl) {
                window.location.href = paypalCkeckoutUrl + token;
            }

        },function(data){
            alert(data.result);
        });
    },


    loadShoppingCart: function (callBack) {
        var self = this;
        ninimour.http.loadingGet(ninimour.base.ctx + ninimour.base.vpath + '/shopping-cart/show', {}, function (data) {
            callBack(data.result);
        }, function () {

        });

    },
    selectShippingMethod: function (method, callBack) {
        ninimour.http.get(ninimour.base.ctx + ninimour.base.vpath + '/shopping-cart/anon/' + method + '/update-shipping-method', {}, function (data) {
            callBack(data);
        }, function () {

        });
    },
    unUseCoupon: function (callBack) {

        ninimour.http.get(ninimour.base.ctx + ninimour.base.vpath + '/shopping-cart/anon/unuse-coupon', {}, function (data) {
            callBack(data);
        }, function () {

        });

    },
    loaddingPaypalUrl: function () {
        var self = this;
        ninimour.http.get(ninimour.base.ctx + ninimour.base.vpath + '/paypal/anon/client-get-url', {}, function (data) {
            self.set('paypalCkeckoutUrl', data.result);
        });
    },
    loadDictionary:function(typeCode,callBack){
        ninimour.http.get(ninimour.base.ctx + '/dictionary/anon/get',{'typeCode':typeCode},callBack);
    },
    loadShippingDetails:function(defaultAddress){

        var self = this;

        var getStr = function(obj){
            if(!obj)
                return '';
            return obj.label?obj.label:obj.value;
        }


        var createShipping = function(address){

            return [
                '<li data-address="'+address.id+'" class="' + (defaultAddress.id == address.id ? 'active' : '') +'">',
                '	<div class="x-table x-full-width">',
                '	    <div class="x-cell">',
                '	        <span class="x-radio"></span>',
                '	    </div>',
                '	    <div class="x-cell">',
                '	        <div class="address">',
                '	            <div>'+address.name+'('+address.phoneNumber+')</div>',
                '	            <div>'+address.streetAddress1+','+address.unit+'</div>',
                '	            <div>'+address.zipCode+','+address.city+','+getStr(address.state)+','+getStr(address.country)+'</div>',
                '	        </div>',
                '	    </div>',
                '	    <div class="x-cell">',
                '	        <span class="x-btn edit-btn li-address-edit" data-shipping="'+address.id+'">Edit</span>',
                '	    </div>',
                '	</div>',
                '</li>'
            ].join('');
        }

        var createAddressSelectores = function(addresses){
            var html = [];
            if(addresses && addresses.length > 0){
                var address;
                for(var i = 0 , len = addresses.length ; i < len ; i++){
                    address = addresses[i];

                    if(address.id == defaultAddress.id){
                        html.unshift(createShipping(address));
                    }else{
                        html.push(createShipping(address));
                    }

                }
            }
            $('#ninimour-shipping-addresses').append(html.join(''));


            function getAddress(addressId){
                if(addresses && addresses.length > 0){
                    var address;
                    for(var i = 0 , len = addresses.length ; i < len ; i++){
                        address = addresses[i];
                        if(addressId = address.id)
                            return address;
                    }
                }
                return null;
            }

            $('#ninimour-shipping-addresses .li-address-edit').off().on('click',function(){
                var selectedAddress = getAddress($(this).data('shipping'));
                ninimour.windows.addressWindow.editAddress(selectedAddress , true , function(data){
                    module.fire('REFRESH-SHOPPING-CART');
                });
            });
        };


        ninimour.http.get(ninimour.base.ctx+ninimour.base.vpath+'/customer/get-shipping-details' , {} , function(data){
            createAddressSelectores(data.result);
            self.set('shippingdetaillist' , data.result);
        });

    },
    unUseCoupon:function(callBack){
        ninimour.http.get(ninimour.base.ctx + ninimour.base.vpath + '/shopping-cart/anon/unuse-coupon' , {} , callBack);
    },

    openPoints:function(open , callBack){
        ninimour.http.get(ninimour.base.ctx + ninimour.base.vpath + '/shopping-cart/set-point/'+open , {} , callBack);
    },

    deleteVariant: function(variantId , callBack){
        ninimour.http.loadingGet(ninimour.base.ctx + ninimour.base.vpath + '/shopping-cart/' + variantId + '/remove' , {} , callBack);
    },

    changeQuantity: function(variantId , quantity , callBack){
        ninimour.http.loadingGet(ninimour.base.ctx + ninimour.base.vpath + '/shopping-cart/'+variantId+'/'+quantity+'/update' , {} , callBack);
    }
});

var ShoppingCart = (function () {


    var _getCouponAmount = function (coupon) {
        var amount = coupon.amount;
        if (amount) {
            return amount.indexOf('%') < 0 ? ('$' + amount) : amount;
        }

        return '';
    }

    var _createCoupon = function (couponVO, selectedId) {
        var coupon = couponVO.coupon, isAvailable = couponVO.isAvailable

        var getSelectBtn = function () {
            if (selectedId == coupon.id) {
                return '<span class="select-btn ninimour-coupon-select selected">Selected</span>';
            }
            if (isAvailable)
                return '<span data-coupon="' + coupon.id + '" class="select-btn ninimour-coupon-select">Select</span>';
            return '<span class="select-btn ninimour-coupon-select disabled">Select</span>';
        };

        return [
            '<li class="s-coupon-element">',
            '   <div>',
            '       <span class="coupon-name">' + _getCouponAmount(coupon) + '</span>',
            '       <span class="coupon-off">OFF</span>',
            '       <span class="coupon-code">' + coupon.code + '</span>',
            '   </div>',
            '   <div>',
            '       <span>'+coupon.name+'</span>',
            '   </div>',
            '   <div>',
            '       <span class="coupon-date">2013.06.09 - 2014.45.55</span>',
            '   </div>',
            getSelectBtn(),
            '</li>'
        ].join('');
    };

    var _createCouponAlert = function (couponVos, selectedId) {
        var $alert = $('<div id="ninimour-coupon-alert" class="s-coupon-alert">');
        var $hd = $('<div class="hd"><span>Select Coupon</span><span class="cls"></span></div>');
        var $bd = $('<div class="bd">');
        var $coupons = $('<ul class="s-coupons">');

        for (var i = 0, len = couponVos.length; i < len; i++) {
            $coupons.append(_createCoupon(couponVos[i], selectedId));
        }


        $bd.append($coupons);
        $alert.append($hd).append($bd);

        $('body').append($alert);

        $('#ninimour-coupon-alert .cls').click(function (event) {
            ninimour.event.stop(event);
            ninimour.fixedwindow.close($('#ninimour-coupon-alert'));
        });

        $('.ninimour-coupon-select').click(function (event) {
            ninimour.event.stop(event);

            var couponId = $(this).data('coupon');

            ninimour.http.get(ninimour.base.ctx + ninimour.base.vpath + '/shopping-cart/anon/use-coupon/'+couponId, {}, function (data) {
                ninimour.fixedwindow.close($('#ninimour-coupon-alert'));
                module.fire('REFRESH-SHOPPING-CART');
            });



        });
    };

    var _loadCoupons = function (selectedId) {
        ninimour.http.get(ninimour.base.ctx + ninimour.base.vpath + '/coupon/anon/get-coupon-selections', {}, function (data) {
            var coupons = data.result;
            if (coupons && coupons.length > 0)
                _createCouponAlert(data.result, selectedId);
        });
    };

    var _refreshCoupons = function (selectedId) {
        $('#ninimour-coupon-alert .cls').off('click');
        $('.ninimour-coupon-select').off('click');
        $('#ninimour-coupon-alert').remove();
        _loadCoupons(selectedId);
    }


    return {
        loadCoupons: function (selectedId) {
            _loadCoupons(selectedId);
        },
        rereshCoupoons: function (selectedId) {
            _refreshCoupons(selectedId);
        },
        showCoupons: function () {
            ninimour.fixedwindow.open($('#ninimour-coupon-alert'));
        }

    };
})();


var module;

$(function () {
    module = new ShoppingCartModule({
        tpl: 'tpl-shoppingcart',
        parentNode: $('#shoppingcart')
    });
    module.setUp();


    module.on('SHOPPING-CART-REFRESHED',function(cart){
        ShoppingCart.rereshCoupoons(cart.coupon ? cart.coupon.id : null);
    });

    $(document).on('click','#ninimour-edit-paypal-address',function(event){
        ninimour.event.stop(event);
        $(this).hide();
        $('#ninimour-address').hide();
        $('#ninimour-edit-address').show();
    });



});