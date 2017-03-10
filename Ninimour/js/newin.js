/**
 * Created by s_lei on 2017/1/11.
 */


$(function(){
    var newinproducts = new ninimour.products({
        skip:0,
        limit:36,
        data:{},
        url:'/collection/anon/{skip}/{limit}/get-new-product-selling',
        container:$('#ninimour-newin-products'),
        isScroll:true
    });

    newinproducts.load();
});

