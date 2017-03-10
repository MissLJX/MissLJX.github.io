/**
 * Created by s_lei on 2016/12/26.
 */
var search = window.search || {};

search = (function () {

    var _ready = true;

    var searchProducts = new ninimour.products({
        skip: 0,
        limit: 40,
        data: {searchValue: ''},
        url: '/search/anon/{skip}/{limit}/products',
        container: $('#ninimour-search-result'),
        isScroll: true
    });

    var _createWordHtml = function (word) {
        return '<li class="ninimour-key-click" data-key="' + word + '">' + word + '</li>';
    };

    var _createKeyWords = function (words) {
        if (words && words.result) {
            var html = [];
            for (var i = 0, len = words.result.length; i < len; i++) {
                html.push(_createWordHtml(words.result[i]));
            }
            $('#search-suggest').text(words.result[0]);
            $('#key-list').empty().append(html.join('')).show();
        }
    }


    var _requestWords = function (key) {
        ninimour.http.get(ninimour.base.ctx + ninimour.base.vpath + '/search/anon/simple', {searchValue: key}, function (data) {
            if (data && _ready) {
                if (data.result && data.result.groupResult) {
                    _createKeyWords(data.result.groupResult.words);
                }
            }

        }, function () {

        });
    }

    var _requestProducts = function (key) {


        searchProducts.set('data', {searchValue: key});


        searchProducts.refresh();
    }


    return {


        request: function (key, productOnly) {
            if (!productOnly) {
                _requestWords(key);
            }
            _requestProducts(key);
        },


        clear: function () {
            _ready = false;
            $('#search-suggest').text($('#search-suggest').data('text'));
            $('#key-list').hide();
            $('#ninimour-search-result').empty();
        },

        ready: function () {
            _ready = true;
        }

    };
})();

$(function () {

    function query(searchValue, productOnly) {
        if (searchValue) {
            searchValue = searchValue.toLowerCase();
            $('#search-term').val(searchValue);
            $('#search-suggest').text(searchValue);

            $(this).val(searchValue);
            if (searchValue.length >= 3) {
                search.ready();
                search.request(searchValue, productOnly);
            }
        } else {
            search.clear();
        }
    }

    $(document).on('click', '.ninimour-key-click', function (event) {
        ninimour.event.stop(event);

        query($(this).data('key'), true);

        $('#key-list').hide();
    });


    $('#search-term').keyup(function (event) {

        ninimour.event.stop(event);

        var searchValue = $(this).val();
        query(searchValue);


    });


});
