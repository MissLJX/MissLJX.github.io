/**
 * Created by s_lei on 2017/2/6.
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

template.helper('getShippingField', function (shipping, field) {
    if (!shipping)
        return '';
    return shipping[field];
});

template.helper('getCoponAmount', function (coupon) {
    return coupon.amount.indexOf('%') >= 0 ? coupon.amount : '$' + coupon.amount;
});

var ShoppingCartModule = ModuleBase.extend({
    EVENTS: {
        '#ninimour-edit-address': {
            'click': function (self, _this, e) {
                ninimour.event.stop(e);
                ShoppingCart.showAddressList();
            }
        },

        '#ninimour-temp-address': {
            'click': function (self, _this, e) {
                ninimour.event.stop(e);
                var cart = self.get('_shopping_cart'), shipping = cart.shippingDetail;

                ninimour.windows.addressWindow.tokenAddress(shipping, token, function () {
                    ninimour.windows.addressWindow.close();
                    self.fire('REFRESH-SHOPPING-CART');
                })
            }
        },

        '.ninimour-shipping-list-method': {
            'click': function (self, _this, e) {
                ninimour.event.stop(e);
                var method = $(_this).data('method');
                self.selectShippingMethod(method, function (data) {
                    self.fire('REFRESH-SHOPPING-CART');
                });
            }
        },
        '#ninimour-select-shipping-method': {
            'click': function (self, _this, e) {
                ninimour.event.stop(e);
                $('#ninimour-shipping-method-window').addClass('active');
            }
        },
        '#ninimour-shipping-method-window .s-cancel': {
            'click': function (self, _this, e) {
                ninimour.event.stop(e);
                $('#ninimour-shipping-method-window').removeClass('active');
            }
        },
        '#ninimour-quick-pay': {
            'click': function (self, _this, e) {
                ninimour.event.stop(e);
                self.placePaypal('quick');
            }
        },

        '#ninimour-paypayl-pay': {
            'click': function (self, _this, e) {
                ninimour.event.stop(e);
                self.placePaypal('normal');
            }
        },
        '#ninimour-ocean-pay': {
            'click': function (self, _this, e) {
                ninimour.event.stop(e);
                ShoppingCart.showCreditBannel();
            }
        },
        '#ninimour-place-order':{
            'click': function(self, _this, e){
                ninimour.event.stop(e);
                ninimour.anchor.open(ninimour.base.ctx + '/shoppingcart/pay/paypal/checkout');
            }
        },


    },

    setUp: function () {
        var self = this;
        self.loaddingPaypalUrl();
        this.loadShoppingCart(function (cart) {
            cart = self.prepare(cart);
            self.render(cart);
            self.afterInit();
        });

        self.on('REFRESH-SHOPPING-CART', function (shoppingcart) {

            if (shoppingcart) {
                self.reSet(shoppingcart);
            } else {
                self.loadShoppingCart(function (cart) {
                    self.reSet(cart);
                });
            }
        });
    },

    reSet: function (shoppingcart) {
        var self = this;
        shoppingcart = self.prepare(shoppingcart);
        self.setChuckData(shoppingcart);
        self.fire('SHOPPING-CART-REFRESHED', shoppingcart);
        self.afterInit(true);
    },

    prepare: function (shoppingcart) {
        if (shoppingcart) {
            shoppingcart['shoppingpath'] = shoppingpath;
//    	     shoppingcart['staticRefresh'] = staticRefresh;
        } else {
            shoppingcart = {empty: true};
        }
        this.set('_shopping_cart', shoppingcart);
        return shoppingcart;
    },

    afterInit: function () {
        var cart = this.get('_shopping_cart');
        if (cart && cart.coupon) {
            ShoppingCart.loadCoupons(cart.coupon.id);
        }
    },


    loadShoppingCart: function (callBack) {
        var self = this;
        ninimour.http.loadingGet(ninimour.base.ctx + ninimour.base.vpath + '/shopping-cart/show', {}, function (data) {
            callBack(data.result);
        }, function () {

        });

    },

    selectShippingMethod: function (method, callBack) {
        ninimour.http.loadingGet(ninimour.base.ctx + ninimour.base.vpath + '/shopping-cart/anon/' + method + '/update-shipping-method', {}, function (data) {
            callBack(data);
        });
    },

    loaddingPaypalUrl: function () {
        var self = this;
        ninimour.http.get(ninimour.base.ctx + ninimour.base.vpath + '/paypal/anon/client-get-url', {}, function (data) {
            self.set('paypalCkeckoutUrl', data.result);
        });
    },

    placePaypal: function (method) {
        var self = this, paypalCkeckoutUrl = self.get('paypalCkeckoutUrl');
        var cart = self.get('_shopping_cart');
        var url = ninimour.base.ctx + '/shoppingcart/pay/paypal/pay?method=' + method;

        ninimour.http.get(url, {}, function (data) {

            var token = data.result.TOKEN;
            var successed = data.result.success, transationId = data.result.transactionId;

            if (successed && transationId && !token) {
                ninimour.anchor.open(ninimour.base.ctx + ninimour.vpath + '/order/confirm/free?transationId=' + transationId);
                return;
            }

            var ack = data.result.ACK;

            if (ack == 'Failure') {
                alert(data.result.L_LONGMESSAGE0);
                return;
            }

            if (token && paypalCkeckoutUrl) {
                window.location.href = paypalCkeckoutUrl + token;
            }

        }, function (data) {
            alert(data.result);
        });
    },

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

        var getStatus = function () {
            if (selectedId == coupon.id) {
                return 'selected';
            }
            if (isAvailable)
                return '';
            return 'disabled';
        };

        return [
            '<li class="s-coupon ' + getStatus() + '">',
            '   <div class="x-table">',
            '       <div class="x-cell">',
            '           <div>',
            '               <strong class="x-red"><span class="s-coupon-percent">' + _getCouponAmount(coupon) + '</span> OFF</strong>',
            '               <strong class="s-coupon-code">' + coupon.code + '</strong>',
            '           </div>',
            '           <div class="s-coupon-name">' + coupon.name + '</div>',
            '           <div class="s-coupon-time">Dec 16,2016 - Mar 1,2017</div>',
            '       </div>',
            '       <div class="x-cell">',
            '           <span data-coupon="' + coupon.id + '" class="x-btn s-coupon-select">' + (selectedId == coupon.id ? 'Selected' : 'Select') + '</span>',
            '       </div>',
            '   </div>',
            '</li>'
        ].join('');
    };

    var _createCouponAlert = function (couponVos, selectedId) {
        var $alert = $('<div class="s-coupon-window" id="ninimour-coupon-window">');
        var $hd = $('<div class="hd"><h3>Coupons</h3><span class="s-cancel"></span></div>');
        var $bd = $('<div class="bd">');
        var $coupons = $('<ul class="s-coupons">');

        for (var i = 0, len = couponVos.length; i < len; i++) {
            $coupons.append(_createCoupon(couponVos[i], selectedId));
        }


        $bd.append($coupons);
        $alert.append($hd).append($bd);

        $('body').append($alert);

        $('#ninimour-coupon-window .s-cancel').click(function (event) {
            ninimour.event.stop(event);
            $('#ninimour-coupon-window').removeClass('active');
        });

        $('.ninimour-coupon-select').click(function (event) {
            ninimour.event.stop(event);
            var couponId = $(this).data('coupon');
            ninimour.http.get(ninimour.base.ctx + ninimour.base.vpath + '/shopping-cart/anon/use-coupon/' + couponId, {}, function (data) {
                $('#ninimour-coupon-window').removeClass('active');
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


    var _getStr = function (obj) {
        if (!obj)
            return '';
        return obj.label ? obj.label : obj.value;
    }


    var _addresses = [];

    //edit address
    var _loadShippingDetails = function (callBack) {
        ninimour.http.get(ninimour.base.ctx + ninimour.base.vpath + '/customer/get-shipping-details', {}, function (data) {
            _addresses = data.result;
            callBack(_addresses);
        });
    };

    var _createShipping = function (address) {
        return [
            '<li data-address="' + address.id + '" class="ninimour-list-address-select s-address ' + (address.isDefaultAddress ? 'active' : '') + '">',
            '    <div class="x-table">',
            '       <div class="x-cell">',
            '           <span class="s-right-gou"></span>',
            '       </div>',
            '       <div class="x-cell">',
            '           <address>',
            '               <div><strong>' + address.name + '</strong>(' + address.phoneNumber + ')</div>',
            '               <div>' + address.streetAddress1 + ', ' + address.unit + '</div>',
            '	            <div>' + address.zipCode + ', ' + address.city + ', ' + _getStr(address.state) + ', ' + _getStr(address.country) + '</div>',
            '           </address>',
            '       </div>',
            '       <div class="x-cell">',
            '           <span data-address="' + address.id + '" class="x-btn s-list-edit ninimour-address-list-eidt">Edit</span>',
            '       </div>',
            '   </div>',
            '</li>'
        ].join('');
    };

    var _createShippings = function (addresses) {
        var html = [];
        if (addresses && addresses.length > 0) {
            for (var i = 0, len = addresses.length; i < len; i++) {
                html.push(_createShipping(addresses[i]));
            }
        }
        return html.join('');
    };

    var _getAddress = function (addressId) {
        for (var i = 0, len = _addresses.length; i < len; i++) {
            if (addressId == _addresses[i].id)
                return _addresses[i];
        }
        return null;
    }


    var _selectAddress = function (addressId, callBack) {
        ninimour.http.loadingGet(ninimour.base.ctx + ninimour.base.vpath + '/customer/' + addressId + '/set-default-shipping-detail', {}, callBack);
    }


    //visa
    var _cards = [], _selectedcard;


    var _getcard = function (cardId) {
        if (_cards && _cards.length > 0) {
            for (var i = 0, len = _cards.length; i < len; i++) {
                if (_cards[i].quickpayRecord.id == cardId) {
                    return _cards[i];
                }
            }
        }
        return null;
    }


    var _loadcards = function (callBack) {
        ninimour.http.loadingGet(ninimour.base.ctx + '/quickpay-record/3/history', {}, function (data) {
            _cards = data.result;
            if (_cards && _cards.length > 0) {
                for (var i = 0, len = _cards.length; i < len; i++) {
                    if (_cards[i].isSelected) {
                        _selectedcard = _cards[i];
                        break;
                    }
                }
            }

            callBack(_cards);
        });
    }

    var _createselectedcard = function (card) {
        return [
            '<li class="s-card" id="ninimour-selected-card">',
            '   <div class="x-table">',
            '       <div class="x-cell x-v-middle">Card No ' + card.quickpayRecord.cardNumber + '</div>',
            '       <div class="x-cell x-text-right x-v-middle">',
            '           <span class="s-right-go"></span>',
            '       </div>',
            '   </div>',
            '</li>'
        ].join('');
    }

    var _createcard = function (card) {
        return [
            '<li data-card="' + card.quickpayRecord.id + '" class="s-card ninimour-card ' + (card.isSelected ? 'selected' : '') + '">',
            '   <div class="x-table">',
            '       <div class="x-cell x-v-middle">Card No ' + card.quickpayRecord.cardNumber + '</div>',
            '       <div class="x-cell x-text-right x-v-middle">',
            '           <span class="s-right-gou"></span>',
            '       </div>',
            '   </div>',
            '</li>'
        ].join('');
    }

    var _createframecard = function(card){
        return [
            '<li class="s-card ninimour-card">',
            '   <div class="x-table">',
            '       <div class="x-cell x-v-middle">Card No ' + card.quickpayRecord.cardNumber + '</div>',
            '       <div class="x-cell x-text-right x-v-middle">',
            '           <span class="s-credit-reduce"></span>',
            '       </div>',
            '   </div>',
            '</li>'
        ].join('');
    }

    var _createframecards = function(cards){
        var html = [];
        for (var i = 0, len = cards.length; i < len; i++) {
            html.push(_createframecard(cards[i]));
        }
        return html.join('');
    }

    var _createcards = function (cards) {
        var html = [];
        for (var i = 0, len = cards.length; i < len; i++) {
            html.push(_createcard(cards[i]));
        }
        return html.join('');
    }


    var _selectcard = function (cardId, callBack) {
        ninimour.http.loadingGet(ninimour.base.ctx + '/quickpay-record/' + cardId + '/use', {}, callBack);
    }


    var _createcardbanner = function (card, cards) {
        var html = [
            '<div class="s-credit-payer" id="ninimour-creditcart-payer">',
            '   <div class="s-credit-list-area-01 active" id="ninimour-credit-01">',
            '       <div class="hd">',
            '           <h3>Payment(VISA)</h3>',
            '           <span class="s-oper" id="ninimour-creditcart-close">Cancel</span>',
            '       </div>',
            '       <div class="bd">',
            '           <ul class="s-cards" id="ninimour-current-card">',
            _createselectedcard(card),
            '           </ul>',
            '           <div class="x-table s-credit-summary">',
            '               <div class="x-cell">',
            '                   <span>2</span> Items',
            '               </div>',
            '               <div class="x-cell x-text-right">',
            '                   <span class="s-total-price">$73.48</span>',
            '               </div>',
            '           </div>',
            '           <div class="s-trust">',
            '                <div id="ninimour-place-ocean" class="s-placeorder-pay">Place Order</div>',
            '           </div>',
            '       </div>',
            '   </div>',
            '   <div class="s-credit-list-area-02" id="ninimour-credit-02">',
            '       <div class="hd">',
            '           <h3>Select</h3>',
            '           <span class="s-oper" id="ninimour-credit-back">Back</span>',
            '       </div>',
            '       <div class="bd">',
            '           <ul class="s-cards">',
            _createcards(cards),
            '                <li class="s-card s-card-editor" id="ninimour-card-editor">',
            '                   <div class="x-table">',
            '                       <div class="x-cell x-v-middle">Edit your card(s)</div>',
            '                       <div class="x-cell x-text-right x-v-middle">',
            '                           <span class="s-credit-add"></span>',
            '                       </div>',
            '                   </div>',
            '               </li>',
            '           </ul>',
            '           <div class="x-table s-trust">',
            '               <div class="x-cell">',
            '                   <img src="https://dgzfssf1la12s.cloudfront.net/site/ninimour/msite/icon12.png">',
            '               </div>',
            '               <div class="x-cell">',
            '                   <p>We will not save your credit information. Trusted by over one millon shoppers in 50 countries.</p>',
            '               </div>',
            '           </div>',
            '       </div>',
            '   </div>',
            '</div>'
        ].join('');


        var mask = '<div class="x-mask" id="ninimour-creditcart-mask"></div>';

        $('body').append(html, mask);

        $('#ninimour-creditcart-payer').on('click', '.ninimour-card', function (event) {
            ninimour.event.stop(event);
            var $this = $(this), cardId = $this.data('card');
            _selectcard(cardId, function (data) {
                $this.addClass('selected').siblings().removeClass('selected');
                var card = _getcard(cardId);
                if (card) {
                    $('#ninimour-current-card').empty().append(_createselectedcard(card));
                    $('#ninimour-credit-02').removeClass('active').prev().addClass('active');
                }
            });
        });


        $('#ninimour-creditcart-payer').on('click', '#ninimour-credit-back', function (event) {
            ninimour.event.stop(event);
            $('#ninimour-credit-02').removeClass('active').prev().addClass('active');
        });

        $('#ninimour-creditcart-payer').on('click', '#ninimour-selected-card', function (event) {
            ninimour.event.stop(event);
            $('#ninimour-credit-01').removeClass('active').next().addClass('active');
        });

        $('#ninimour-creditcart-payer').on('click', '#ninimour-creditcart-close', function (event) {
            ninimour.event.stop(event);
            _closecardbanner();
        });

        $('#ninimour-creditcart-payer').on('click', '#ninimour-place-ocean', function (event) {
            ninimour.event.stop(event);
            _creditPay();
        });




        $('#ninimour-creditcart-payer').addClass('active');
    }

    var _closecardbanner = function () {
        $('#ninimour-creditcart-payer').off();
        $('#ninimour-creditcart-payer').removeClass('active');
        setTimeout(function () {
            $('#ninimour-creditcart-payer').remove();
            $('#ninimour-creditcart-mask').remove();
        }, 400);
    }

    var _creditPay = function(){
        var url = ninimour.base.ctx + ninimour.base.vpath + '/oceanpayment/pay';
        ninimour.http.get(url , {} , function(data){
            if(data.result.success){
                var transactionId = data.result.transactionId;
                ninimour.anchor.open(ninimour.base.ctx + '/shoppingcart/order-confirm/credit-card?transactionId='+transactionId);
            }else{
                alert(data.result.details + '\n' + data.result.solutions);
            }
        });

    }


    return {
        loadCoupons: function (selectedId) {
            _loadCoupons(selectedId);
        },
        rereshCoupoons: function (selectedId) {
            _refreshCoupons(selectedId);
        },
        showCoupons: function () {
            $('#ninimour-coupon-window').addClass('active');
        },
        showAddressList: function () {
            var self = this;
            var addressHtml = [
                '<div id="ninimour-address-list-window" class="s-address-list-window">',
                '    <div class="hd">',
                '       <h3>Addresses</h3>',
                '       <span class="s-cancel"></span>',
                '   </div>',
                '   <div class="bd">',
                '       <ul class="s-address-list" id="ninimour-address-list">',
                '       </ul>',
                '       <div class="x-text-center">',
                '           <span id="ninimour-add-new-address" class="s-add-new">Add a new address</span>',
                '       </div>',
                '   </div>',
                '</div>'
            ].join('');
            $('body').append(addressHtml);

            $('#ninimour-address-list-window').on('click', '.s-cancel', function (event) {
                ninimour.event.stop(event);
                self.closeAddressList();
            });

            $('#ninimour-address-list-window').on('click', '.ninimour-address-list-eidt', function (event) {
                ninimour.event.stop(event);

                var addressId = $(this).data('address');
                var address = _getAddress(addressId);
                ninimour.windows.addressWindow.editAddress(address, address.isDefaultAddress, function (data) {
                    var newAddress = data.result;
                    if (newAddress && newAddress.isDefaultAddress) {
                        module.fire('REFRESH-SHOPPING-CART');
                        self.removeAddressList();
                    } else {
                        self.refreshAddress();
                    }

                    ninimour.windows.addressWindow.close();
                })
            });
            // _selectAddress
            $('#ninimour-address-list-window').on('click', '.ninimour-list-address-select', function (event) {
                ninimour.event.stop(event);
                var addressId = $(this).data('address');
                _selectAddress(addressId, function (data) {
                    module.fire('REFRESH-SHOPPING-CART');
                    self.removeAddressList();
                });
            });


            // ninimour-add-new-address
            $('#ninimour-address-list-window').on('click', '#ninimour-add-new-address', function (event) {
                ninimour.event.stop(event);
                ninimour.windows.addressWindow.addAddress(true, function (data) {
                    module.fire('REFRESH-SHOPPING-CART');
                    self.removeAddressList();
                    ninimour.windows.addressWindow.close();
                });
            });


            _loadShippingDetails(function (addresses) {
                var shippingsHtml = _createShippings(addresses);
                $('#ninimour-address-list').append(shippingsHtml);
                ninimour.fixedwindow.up($('#ninimour-address-list-window'));
            });


        },

        refreshAddress: function () {
            _loadShippingDetails(function (addresses) {
                var shippingsHtml = _createShippings(addresses);
                var $currNode = $('<ul class="s-address-list" id="ninimour-address-list">' + shippingsHtml + '</ul>');
                $('#ninimour-address-list').replaceWith($currNode);
            });
        },


        removeAddressList: function () {
            $('#ninimour-address-list-window').remove();
        },
        closeAddressList: function () {
            ninimour.fixedwindow.down($('#ninimour-address-list-window'));
            var self = this;
            setTimeout(function () {
                self.removeAddressList();
            }, 1000);
        },
        showCreditBannel: function () {
            _loadcards(function (cards) {
                _createcardbanner(_selectedcard, _cards);

                $('#ninimour-frame-cards').append(_createframecards(_cards));
            });
        },
        closeCreditBannel: _closecardbanner,
        creditpay:_creditPay

    };
})();


var module;
$(function () {


    module = new ShoppingCartModule({
        tpl: 'tpl-shoppingcart',
        parentNode: $('#shoppingcart')
    });
    module.setUp();


    $(document).on('click', '#ninimour-card-editor', function (event) {
        ninimour.event.stop(event);
        $('#ninimour-credit-edit-window').addClass('active');
    });


    $(document).on('click', '#ninimour-credit-edit-close', function (event) {
        ninimour.event.stop(event);
        $('#ninimour-credit-edit-window').removeClass('active');
    });

    $(document).on('click', '#ninimour-select-coupon', function (event) {
        $('#ninimour-coupon-window').addClass('active');
    });
});


function triggerPlace(){
    ShoppingCart.creditpay();
}

function triggerFalse(){
    $('#oceanframe').attr('src', ninimour.base.ctx + '/shoppingcart/ocean-frame');
}