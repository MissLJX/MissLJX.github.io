/**
 * Created by s_lei on 2016/12/21.
 */


var listingReview = function (cfg) {
    this.limit = cfg.limit || 20;
    this.skip = cfg.skip || 0;
    this.url = cfg.url;
    this.scroller = cfg.scroller;
    this.container = cfg.container;
}

ninimour.extends(listingReview, ninimour.listing);


listingReview.prototype.createElement = function (comment) {

    var getStars = function () {
        var score = comment.score, html = [];
        for (var i = 0, len = score; i < len; i++) {
            html.push('<li></li>');
        }
        return html.join('');
    }

    var html = [
        '<li>',
        '   <div class="x-cell">',
        '       <div class="p-customer-name">' + comment.customerName + '</div>',
        '       <ol class="p-stars">',
        getStars(),
        '       </ol>',
        '   </div>',
        '   <div class="x-cell">',
        '       <div class="p-review-date">' + comment.createTime + '</div>',
        '       <p class="p-review-content">',
        comment.content,
        '       </p>',
        '   </div>',
        '</li>'
    ];

    return html.join('');
}


$(function () {
    var product;
    var pintrestUrl;

    var currIndex = 0;

    $('.ninimou-displayer').on('click', function () {
        var $this = $(this);
        $('.ninimou-displayer').removeClass('active');
        $this.addClass('active');
        currIndex = $('.ninimou-displayer').index(this);
        ninimour.fixedwindow.open($('#ninimour-show-products img').attr('src', $this.attr('src')).parent());
    });

    $('#ninimour-show-products img').on('click', function () {
        ninimour.fixedwindow.close($(this).parent('#ninimour-show-products'));
    });

    $('#ninimour-show-products .next').on('click', function () {

        var len = $('.ninimou-displayer').length;
        currIndex = (currIndex + 1) >= len ? 0 : (currIndex + 1);

        var image = $('.ninimou-displayer').eq(currIndex).addClass('active').attr('src');
        $('#ninimour-show-products img').attr('src', image);
    });


    $('#ninimour-show-products .prev').on('click', function () {

        var len = $('.ninimou-displayer').length;
        currIndex = currIndex - 1;
        if (currIndex < 0) {
            currIndex = len - 1;
        }

        var image = $('.ninimou-displayer').eq(currIndex).addClass('active').attr('src');
        $('#ninimour-show-products img').attr('src', image);
    });

    $('.ninimour-size-select').click(function (event) {
        ninimour.event.stop(event);
        $('.ninimour-size-select').removeClass('active');
        $(this).addClass('active');
    });


    $('#ninimour-add-to-bag').click(function (event) {
        ninimour.event.stop(event);
        var $sizeSelect = $('.ninimour-size-select.active');
        if ($sizeSelect.length > 0) {
            var variantId = $sizeSelect.data('variant');
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


    // ninimour.http.loadingGet(ninimour.base.ctx + ninimour.base.vpath + '/product/anon/' + productId + '/show', {}, function (data) {
    //     var productVO = data.result;
    //     if (productVO) {
    //         product = productVO.product;
    //
    //         //init share url
    //         ninimour.utils.shareutil.getProductUrl(product.id, 'p', function (data) {
    //             pintrestUrl = data.result;
    //         });
    //
    //
    //         var description = product.description;
    //         description = description.replace(/[\r\n]/g, "<br>");
    //         $('#ninimour-dsc-content').html(description);
    //
    //     }
    // });


    var staticToolReat = $('#buy-tool')[0].getBoundingClientRect();

    $(window).scroll(function () {
        var imageListRect = $('#image-list')[0].getBoundingClientRect();
        if (imageListRect.bottom <= staticToolReat.bottom) {
            $('#buy-tool').css({top: (imageListRect.bottom - staticToolReat.bottom)});
        }else{
            $('#buy-tool').css({top: 0});
        }
    });


    // ninimour.http.get(ninimour.base.ctx + ninimour.base.vpath + '/product/anon/' + productId + '/get-product-comment', {}, function (data) {
    //     var summary = data.result;
    //     if (summary && summary.comments && summary.comments.length > 0) {
    //         $('#ninimour-review-btn').removeClass('disabled');
    //
    //         var comments = summary.comments, html = [];
    //         for (var i = 0, len = comments.length; i < len; i++) {
    //             html.push(listingReview.prototype.createElement(comments[i]));
    //         }
    //         $('#ninimour-comments').append(html.join(''));
    //
    //         $('#ninimour-view-more-comments').show().click(function (e) {
    //             ninimour.event.stop(e);
    //             $(this).hide();
    //             new listingReview({
    //                 skip: 3,
    //                 url: ninimour.base.ctx + '/comment/' + productId + '/{skip}/{limit}/show',
    //                 container: $('#ninimour-comments'),
    //                 scroller: $('#ninimour-review-scoller')
    //             }).init();
    //         });
    //     }
    // });



    $(document).on('click' , '#ninimour-review-btn:not(.disabled)' , function(e){
        ninimour.event.stop(e);
        ninimour.fixedwindow.open($('#ninimour-review-window'));
    });


    $('#ninimour-review-window .cls').on('click', function (e) {
        ninimour.event.stop(e);
        ninimour.fixedwindow.close($('#ninimour-review-window'));
    });


    $('#ninimour-description-btn').click(function (e) {
        ninimour.event.stop(e);
        ninimour.fixedwindow.open($('#ninimour-description-window'));
    });

    $('#ninimour-description-window .cls').on('click', function (e) {
        ninimour.event.stop(e);
        ninimour.fixedwindow.close($('#ninimour-description-window'));
    });
    $('#ninimour-shipping-btn').click(function (e) {
        ninimour.event.stop(e);
        ninimour.fixedwindow.open($('#ninimour-shipping-window'));
    });

    $('#ninimour-shipping-window .cls').on('click', function (e) {
        ninimour.event.stop(e);
        ninimour.fixedwindow.close($('#ninimour-shipping-window'));
    });




});