/**
 * Created by s_lei on 2017/2/4.
 */
$(function(){
    ninimour.tabs.init($('#hot-tabs'));





    $("#ninimour-banners").flexslider({directionNav:false,animation: "slide",controlNav:true});


    $("#ninimour-editor-picks").flexslider({
        animation: "slide",
        slideshow:false,
        directionNav:false,
        controlNav:false,
        animationLoop: false,
        itemWidth: 270
    });


    var loaderMap = new Map();
    ninimour.http.get(ninimour.base.ctx + ninimour.base.vpath + '/product-menu/anon/get' , {} , function(data){
        var tabs = data.result;
        if(tabs && tabs.length > 0){
            for(var i = 0 , len = tabs.length ; i < len ; i++){

                $('#ninimour-hot-tabs').append('<li class="x-tab" data-tab="'+tabs[i].id+'">'+tab[i].name+'</li>');
                $('#ninimour-hot-tab-list').append('<div class="tab" id="'+tabs[i].id+'"><ul class="x-products" id="products-'+tabs[i].id+'"></ul><div class="x-text-center"><span id="btn-'+tabs[i].id+'" class="i-view-more">View More ></span></div></div>');


                loaderMap.put(tabs[i].id , new ninimour.products({
                    skip:0,
                    limit:4,
                    data:{},
                    url:'/product/anon/{skip}/{limit}/1/'+tabs[i].id+'/list-by-menu',
                    container:$('#products-'+tabs[i].id),
                    viewMore:true,
                    moreBtn:$('#btn-'+tabs[i].id)
                }));

            }

            loaderMap.get(tabs[0].id).load();
            $('#'+tabs[0].id).addClass('active');

        }
    });
});