/**
 * Created by s_lei on 2017/1/3.
 */
var index = (function(){

    var _init_banner = function(){
       var banner = new ninimour.sliders.SimpleSlider({
           container:$('#banner'),
           auto:true,
           percent:690/1920,
           showNav:true
       });

        banner.init();
    }



    var _init_editor_banner = function(){
        var banner = new ninimour.sliders.SimpleSlider({
            container:$('#editor-banner'),
            auto:true,
            percent:395/1230,
            showNav:false
        });

        banner.init();
    }


    return {
        init:function(){
            _init_banner();
            _init_editor_banner();
        }
    };
})();


$(function(){
    index.init();
});