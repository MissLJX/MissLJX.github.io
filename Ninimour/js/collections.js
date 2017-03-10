/**
 * Created by s_lei on 2017/1/11.
 */
var listingcollection = function(cfg){
    this.limit = cfg.limit || 36;
    this.skip = 0;
    this.url = cfg.url;
    this.scroller = cfg.scroller;
}

ninimour.extends(listingcollection , ninimour.listing);


listingcollection.prototype.createElement = function(collection){
    var html = [
        

    ];

    return html.join('');
}