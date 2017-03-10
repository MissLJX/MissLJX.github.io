/**
 * Created by s_lei on 2016/12/20.
 */
var category = window.category || {};

category = (function () {
    var _filter = {}, _data = {}, _skip = 0, _limit = 36 , _loaded = true;
    var ddMaxCount = 15;
    var _createFilters = function (filterItems) {
        if (filterItems && filterItems.length > 0) {
            var dls = [], dl, item;
            for (var i = 0, len = filterItems.length; i < len; i++) {
                item = filterItems[i];
                var selections = item.selections, selection;
                dl = [];
                dl.push('<dl data-filter="' + item.fieldName + '" data-multi="' + item.isMultiSelect + '">');
                dl.push('<dt>' + item.fieldName + '</dt>');
                var ddcount = 0;
                for (var j = 0, jen = selections.length; j < jen; j++) {
                    selection = selections[j];
                    dl.push('<dd data-selection="' + selection.value + '">' + selection.label + '</dd>');
                    ddcount++;
                    if (ddMaxCount < ddcount && j < jen - 1) {
                        dl.push('</dl><dl data-filter="' + item.fieldName + '" data-multi="' + item.isMultiSelect + '" style="margin-top:30px">');
                        ddcount = 0;
                    }
                }
                dl.push('</dl>');
                dls.push(dl.join(''));
            }
            return dls.join('');
        }
        return '';
    }

    var _createProduct = function (product) {
        var productDom = [
            '<li class="x-product">',
            '    <a href="' + ninimour.url.getProductUrl(product) + '" title="' + product.name + '">',
            '        <figure class="x-image-area">',
            '            <img class="main" src="' + ninimour.base.getLargeImage(product.pcMainImage, '/') + '">',
            '            <img src="' + ninimour.base.getLargeImage(product.pcMainImage2 ? product.pcMainImage2 : product.pcMainImage, '/') + '">',
            '        </figure>',
            '        <figcaption class="x-product-caption">',
            '            <div class="x-table x-product-name">',
            '                <div class="x-cell x-v-middle x-text-center">',
            '                    <div class="x-product-line-height">' + product.name + '</div>',
            '                </div>',
            '            </div>',
            '            <div class="x-product-line-height">',
            '                <span>$15.99</span>',
            '                <span>$25.00</span>',
            '                <span>38% OFF</span>',
            '            </div>',
            '        </figcaption>',
            '    </a>',
            '</li>'
        ];

        return productDom.join('');
    };

    var _createProducts = function (products) {
        if (products && products.length > 0) {
            var html = [];
            for (var i = 0, len = products.length; i < len; i++) {
                html.push(_createProduct(products[i]));
            }
            return html.join('');
        }
        return '';
    };


    return {
        getFilters: function (categoryId) {
            ninimour.http.get(ninimour.base.ctx + ninimour.base.version + '/filter/anon/' + categoryId + '/get-by-product-category-id', {}, function (data) {
                _filter = data.result;
                var filterItems = _filter ? _filter.filterItems : [];
                $('#ninimour-filters').append(_createFilters(filterItems));
            });
        },
        getServiceFilter: function () {
            return _filter;
        },


        setQueryData: function (queryData) {
            _data = queryData;
            return this;
        },

        filterProducts: function (refresh) {
            if(_loaded){
                _loaded = false;
                $('#ninimour-product-loading').show();
                ninimour.http.request(ninimour.base.ctx + ninimour.base.version + '/product/anon/' + _skip + '/' + _limit + '/w-filter', JSON.stringify(_data), function (data) {
                    if (refresh) {
                        _skip = 0;
                        $('#ninimour-category-products').empty().append(_createProducts(data.result));
                    } else {
                        $('#ninimour-category-products').append(_createProducts(data.result));
                        _skip += _limit;
                    }
                    _loaded = true;
                    $('#ninimour-product-loading').hide();
                });
            }

        },
        scollFunc: function (event) {
            ninimour.event.stop(event);
            var scrollTop = $(window).scrollTop(),
                scrollHeight = $(document).height(),
                windowHeight = $(window).height();
            if (scrollTop + windowHeight >= scrollHeight - 300) {
                if (_data && _data.productCategoryId) {

                    this.filterProducts();
                }
            }
        },
        bindScoller:function(){
            var self = this;
            $(window).scroll(self.scollFunc.bind(self));
            return this;
        }



    };

})();


$(function () {
    $(document).on('click', '.nini-list-controller span[data-count]', function () {
        var count = $(this).data('count');
        $(this).parents('.nini-list-controller').next('.nini-lists').attr('data-count', count);
    });


    category.getFilters('1R4s3o7D0Y4Q9T9p5Z7K3P3T1D');

    $(document).on('click', '#ninimour-filters dl[data-multi=true] dd', function (event) {
        ninimour.event.stop(event);
        $(this).toggleClass('selected');
    });

    $(document).on('click', '#ninimour-filters dl[data-multi=false] dd', function (event) {
        ninimour.event.stop(event);
        var filter = $(this).parent().data('filter');
        $('[data-filter=' + filter + '] dd').removeClass('selected');
        $(this).toggleClass('selected');
    });

    $('#ninimour-filter').click(function (event) {
        ninimour.event.stop(event);
        $('#ninimour-filter-area').toggleClass('active');
    });

    $('#ninimour-filter-cancel').click(function (event) {
        ninimour.event.stop(event);
        $('#ninimour-filter-area').removeClass('active');
    });

    $('#ninimour-filter-clear').click(function (event) {
        ninimour.event.stop(event);
        $('#ninimour-filter-area dd').removeClass('selected');
    });


    $('#ninimour-filter-ok').click(function (event) {
        ninimour.event.stop(event);
        var serviceFilter = category.getServiceFilter();
        var clientFilter = {
            productCategoryId: serviceFilter.productCategoryId,
            filterItems: []
        };

        if (serviceFilter.filterItems && serviceFilter.filterItems.length > 0) {
            var $filterGrop, item, clitenItem;
            for (var i = 0, len = serviceFilter.filterItems.length; i < len; i++) {
                item = serviceFilter.filterItems[i];
                $filterGrop = $('#ninimour-filters dl[data-filter=' + item.fieldName + '] dd.selected');
                if ($filterGrop.length > 0) {
                    clitenItem = {
                        fieldName: item.fieldName,
                        selections: []
                    };
                    $filterGrop.each(function () {
                        var selectionValue = $(this).data('selection');
                        clitenItem.selections.push({value: selectionValue});
                    });
                    clientFilter.filterItems.push(clitenItem);
                }

            }

        }

        category.setQueryData(clientFilter).bindScoller().filterProducts(true);

    });
});