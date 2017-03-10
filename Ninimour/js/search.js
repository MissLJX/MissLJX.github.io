/**
 * Created by s_lei on 2016/12/26.
 */
var search = window.search || {};

search = (function () {

    var _ready = true;

    var searchProducts = new ninimour.products({
        skip:0,
        limit:40,
        data:{searchValue:''},
        url:'/search/anon/{skip}/{limit}/products',
        container:$('#ninimour-search-result'),
        isScroll:true
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
        ninimour.http.get(ninimour.base.ctx + ninimour.base.version + '/search/anon/simple', {searchValue: key}, function (data) {
            if (data && _ready) {
                if (data.result && data.result.groupResult) {
                    _createKeyWords(data.result.groupResult.words);
                }
            }

        }, function () {

        });
    }

    var _requestProducts = function (key) {


        searchProducts.set('data' , {searchValue:key});



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

        ready:function(){
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

    $(document).on('click','.ninimour-key-click',function(event){
        ninimour.event.stop(event);

        query($(this).data('key') , true);

        $('#key-list').hide();
    });


    $('#search-term').keyup(function (event) {

        ninimour.event.stop(event);
        var firstTab = false;

        if (event.keyCode == '40') {

            var $currKey = $('#key-list > li.active');
            firstTab = false;
            if ($currKey && $currKey.length <= 0) {
                firstTab = true;
                $currKey = $($('#key-list > li')[0]);
            }

            if ($currKey && $currKey.length > 0) {
                var $nextKey = firstTab ? $currKey : $currKey.next();
                if ($nextKey && $nextKey.length > 0) {
                    $nextKey.siblings().removeClass('active').end().addClass('active');

                    query($nextKey.data('key'), true);
                }
            }

            return;

        } else if (event.keyCode == '38') {


            var $currKey = $('#key-list > li.active');


            if ($currKey && $currKey.length > 0) {
                var $prevKey = $currKey.prev();
                if ($prevKey && $prevKey.length > 0) {
                    $prevKey.siblings().removeClass('active').end().addClass('active');
                    $('#search-term').val($prevKey.data('key'));
                    query($prevKey.data('key'), true);
                }
            }

            return;
        } else {
            var searchValue = $(this).val();
            query(searchValue);
        }


    });
});
