/**
 * Created by s_lei on 2017/2/4.
 */



var listingreview = (function () {

    var _skip = 0 , _limit = 10;

    var _load = function(productId , callBack){
        ninimour.http.get(ninimour.base.ctx + '/comment/' + productId + '/'+_skip+'/'+_limit+'/show' , {} ,  function(data){
            _skip += _limit;
            callBack(data);
        });
    }

    var getStars = function (comment) {
        var score = comment.score, html = [];
        for (var i = 0, len = score; i < len; i++) {
            html.push('<li></li>');
        }
        return html.join('');
    }

    var _create = function (comment) {
        var html = [
            '<li class="p-review">',
            '   <div class="p-review-title">',
            '       <span class="p-r-user">' + comment.customerName + '</span>',
            '       <span class="p-r-time">' + comment.createTime + '</span>',
            '   </div>',
            '   <ol class="p-starts">',
            getStars(comment),
            '   </ol>',
            '   <p class="p-r-content">' + comment.content + '</p>',
            '</li>'
        ];

        return html.join('');
    }

    var _createreviews = function(comments){
        var html = [];
        for(var i = 0 , len = comments.length ; i < len ; i++){
            html.push(_create(comments[i]));
        }
        return html.join('');
    }

    return {
        createreview: _create ,
        addComments: function(productId){
            $('#ninimour-review-more').hide();
            _load(productId , function(data){
                if(data.result && data.result.length > 0){
                    var html = _createreviews(data.result);
                    $('#ninimour-comments').append(html);

                    if(data.result.length >= _limit){
                        $('#ninimour-review-more').show();
                    }


                }
            });
        },
        initComments: function(productId , callBack){
            $('#ninimour-review-more').hide();
            _load(productId , function(data){
                if(data.result && data.result.length > 0){
                    var html = _createreviews(data.result);
                    $('#ninimour-comments').append(html);

                    if(data.result.length >= _limit){
                        $('#ninimour-review-more').show();
                    }


                }else{
                    $('#ninimour-review-contanier').hide();
                }
            });
        }
    };
})();

var pintrestUrl , facebookUrl;
$(function () {
    $('.p-acc .hd').click(function (event) {
        ninimour.event.stop(event);
        $(this).parent('.p-acc').toggleClass('active');
    });

    $('.ninimour-size-select').click(function (event) {
        $('.ninimour-size-select').removeClass('active');
        $(this).addClass('active');

        var variantId = $(this).data('variant');

        if(product && product.variants && product.variants.length > 0){
            for(var i = 0 , len = product.variants.length ; i < len ; i++){
                if(variantId == product.variants[i].id && product.variants[i].description){
                    $('#ninimour-variant-msg').html(product.variants[i].description).show();
                    return;
                }
            }
        }
        $('#ninimour-variant-msg').html('').hide();
    });

    $('#ninimour-add-to-bag').click(function (event) {
        ninimour.event.stop(event);
        if(!product)
            return;
        var $sizeSelect = $('.ninimour-size-select.active') , $allSizes = $('.ninimour-size-select');
        if ($sizeSelect.length > 0 || $allSizes.length == 0) {
            var variantId;
            if($allSizes.length == 0){
                variantId = product.variants[0].id;
            }else{
                variantId = $sizeSelect.data('variant');
            }

            var quantity = $('#ninimour-product-quantity').val();

            if (isNaN(quantity) || quantity < 1) {
                quantity = 1;
            }

            ninimour.http.loadingGet(ninimour.base.ctx + ninimour.base.vpath + '/shopping-cart/add-product', {
                variantId: variantId,
                quantity: quantity
            }, function (data) {
                ninimour.shoppingcartutil.notify(true);
            });
        } else {
            alert('Size is required!');
        }


    });


    $('#ninimour-quantity-add').click(function (event) {
        var q = $('#ninimour-product-quantity').val();
        if (!isNaN(q)) {
            q++;
        } else {
            q = 1;
        }
        $('#ninimour-product-quantity').val(q);

    });


    $('#ninimour-quantity-reduce').click(function (event) {
        var q = $('#ninimour-product-quantity').val();
        if (!isNaN(q) && q > 1) {
            q--;
        } else {
            q = 1;
        }
        $('#ninimour-product-quantity').val(q);

    });

    ninimour.http.loadingGet(ninimour.base.ctx + ninimour.base.vpath + '/product/anon/' + productId + '/show', {}, function (data) {
        var productVO = data.result;
        if (productVO) {
            product = productVO.product;

            if(ninimour.productutil.promotion.isPromotion(product)){
                $('#ninimour-time-left').append('<span data-type="date" data-ms="'+(product.promotion.endTime - product.promotion.serverTime)+'"></span>');
            }


            //init share url
            ninimour.utils.shareutil.getProductUrl(product.id, 'p', function (data) {
                pintrestUrl = data.result;
            });

            ninimour.utils.shareutil.getProductUrl(product.id, 'f', function (data) {
                facebookUrl = data.result;
            });

            var description = product.description2 ? product.description2 : product.description;
            description = description.replace(/[\r\n]/g, "<br>");
            $('#ninimour-dsc-content').html(description);

            try {
                ninimour.apis.facebook.track.viewproduct(productId , ninimour.productutil.promotion.isPromotion(product) , ninimour.base.currency);
            } catch (e){
                console.error(e);
            }


        }
    });


    $('#ninimour-pin').on('click', function () {
        if (pintrestUrl) {

            var shareData = {
                url: ninimour.utils.urlutil.getBaseUrl('p/' + pintrestUrl),
                media: ninimour.base.getOriginalImage(product.pcMainImage, '/'),
                description: product.name
            };


            ninimour.apis.pintrest.pin(shareData);


            ninimour.utils.shareutil.shareBack(product.id, 'pintrest');

        }
    });

    $('#ninimour-facebook').on('click', function () {
        if (facebookUrl) {
            var shareData = {
                href: ninimour.utils.urlutil.getBaseUrl('p/' + facebookUrl),
                title: product.name,
                picture: ninimour.base.getOriginalImage(product.pcMainImage, '/'),
                description: product.name,
                callBack: function(data){
                    ninimour.utils.shareutil.shareBack(product.id, 'facebook');
                }
            };
            ninimour.apis.facebook.share(shareData);
        }
    });


    listingreview.initComments(productId);



    $(document).on('click','#ninimour-review-more',function(data){
        listingreview.addComments(productId);
    });

    $("#ninimour-product-images").flexslider({
        directionNav: false, animation: "slide", controlNav: false, after: function () {

        }
    });


    $(window).scroll(function (event) {
        ninimour.event.stop(event);

        var scrollTop = $(window).scrollTop(),
            scrollHeight = $(document).height(),
            windowHeight = $(window).height();

        var buyrect = $('#ninimour-buy-banner')[0].getBoundingClientRect();
        if(buyrect.top < 0){
            $('#ninimour-buy-fixed-banner').show();
        }else{
            $('#ninimour-buy-fixed-banner').hide();
        }


    });


    $('#ninimour-quick-buy-btn').click(function(event){
        ninimour.event.stop(event);
        ninimour.productutil.buyer.createBuyer(productId , groupId);
    });


});