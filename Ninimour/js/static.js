/**
 * Created by s_lei on 2016/12/16.
 */

//base64
(function (global) {
    "use strict";
    var _Base64 = global.Base64;
    var version = "2.1.9";
    var buffer;
    if (typeof module !== "undefined" && module.exports) {
        try {
            buffer = require("buffer").Buffer
        } catch (err) {
        }
    }
    var b64chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var b64tab = function (bin) {
        var t = {};
        for (var i = 0, l = bin.length; i < l; i++)t[bin.charAt(i)] = i;
        return t
    }(b64chars);
    var fromCharCode = String.fromCharCode;
    var cb_utob = function (c) {
        if (c.length < 2) {
            var cc = c.charCodeAt(0);
            return cc < 128 ? c : cc < 2048 ? fromCharCode(192 | cc >>> 6) + fromCharCode(128 | cc & 63) : fromCharCode(224 | cc >>> 12 & 15) + fromCharCode(128 | cc >>> 6 & 63) + fromCharCode(128 | cc & 63)
        } else {
            var cc = 65536 + (c.charCodeAt(0) - 55296) * 1024 + (c.charCodeAt(1) - 56320);
            return fromCharCode(240 | cc >>> 18 & 7) + fromCharCode(128 | cc >>> 12 & 63) + fromCharCode(128 | cc >>> 6 & 63) + fromCharCode(128 | cc & 63)
        }
    };
    var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    var utob = function (u) {
        return u.replace(re_utob, cb_utob)
    };
    var cb_encode = function (ccc) {
        var padlen = [0, 2, 1][ccc.length % 3], ord = ccc.charCodeAt(0) << 16 | (ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8 | (ccc.length > 2 ? ccc.charCodeAt(2) : 0), chars = [b64chars.charAt(ord >>> 18), b64chars.charAt(ord >>> 12 & 63), padlen >= 2 ? "=" : b64chars.charAt(ord >>> 6 & 63), padlen >= 1 ? "=" : b64chars.charAt(ord & 63)];
        return chars.join("")
    };
    var btoa = global.btoa ? function (b) {
        return global.btoa(b)
    } : function (b) {
        return b.replace(/[\s\S]{1,3}/g, cb_encode)
    };
    var _encode = buffer ? function (u) {
        return (u.constructor === buffer.constructor ? u : new buffer(u)).toString("base64")
    } : function (u) {
        return btoa(utob(u))
    };
    var encode = function (u, urisafe) {
        return !urisafe ? _encode(String(u)) : _encode(String(u)).replace(/[+\/]/g, function (m0) {
            return m0 == "+" ? "-" : "_"
        }).replace(/=/g, "")
    };
    var encodeURI = function (u) {
        return encode(u, true)
    };
    var re_btou = new RegExp(["[À-ß][-¿]", "[à-ï][-¿]{2}", "[ð-÷][-¿]{3}"].join("|"), "g");
    var cb_btou = function (cccc) {
        switch (cccc.length) {
            case 4:
                var cp = (7 & cccc.charCodeAt(0)) << 18 | (63 & cccc.charCodeAt(1)) << 12 | (63 & cccc.charCodeAt(2)) << 6 | 63 & cccc.charCodeAt(3), offset = cp - 65536;
                return fromCharCode((offset >>> 10) + 55296) + fromCharCode((offset & 1023) + 56320);
            case 3:
                return fromCharCode((15 & cccc.charCodeAt(0)) << 12 | (63 & cccc.charCodeAt(1)) << 6 | 63 & cccc.charCodeAt(2));
            default:
                return fromCharCode((31 & cccc.charCodeAt(0)) << 6 | 63 & cccc.charCodeAt(1))
        }
    };
    var btou = function (b) {
        return b.replace(re_btou, cb_btou)
    };
    var cb_decode = function (cccc) {
        var len = cccc.length, padlen = len % 4, n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0) | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0) | (len > 2 ? b64tab[cccc.charAt(2)] << 6 : 0) | (len > 3 ? b64tab[cccc.charAt(3)] : 0), chars = [fromCharCode(n >>> 16), fromCharCode(n >>> 8 & 255), fromCharCode(n & 255)];
        chars.length -= [0, 0, 2, 1][padlen];
        return chars.join("")
    };
    var atob = global.atob ? function (a) {
        return global.atob(a)
    } : function (a) {
        return a.replace(/[\s\S]{1,4}/g, cb_decode)
    };
    var _decode = buffer ? function (a) {
        return (a.constructor === buffer.constructor ? a : new buffer(a, "base64")).toString()
    } : function (a) {
        return btou(atob(a))
    };
    var decode = function (a) {
        return _decode(String(a).replace(/[-_]/g, function (m0) {
            return m0 == "-" ? "+" : "/"
        }).replace(/[^A-Za-z0-9\+\/]/g, ""))
    };
    var noConflict = function () {
        var Base64 = global.Base64;
        global.Base64 = _Base64;
        return Base64
    };
    global.Base64 = {
        VERSION: version,
        atob: atob,
        btoa: btoa,
        fromBase64: decode,
        toBase64: encode,
        utob: utob,
        encode: encode,
        encodeURI: encodeURI,
        btou: btou,
        decode: decode,
        noConflict: noConflict
    };
    if (typeof Object.defineProperty === "function") {
        var noEnum = function (v) {
            return {value: v, enumerable: false, writable: true, configurable: true}
        };
        global.Base64.extendString = function () {
            Object.defineProperty(String.prototype, "fromBase64", noEnum(function () {
                return decode(this)
            }));
            Object.defineProperty(String.prototype, "toBase64", noEnum(function (urisafe) {
                return encode(this, urisafe)
            }));
            Object.defineProperty(String.prototype, "toBase64URI", noEnum(function () {
                return encode(this, true)
            }));
        }
    }
    if (global["Meteor"]) {
        Base64 = global.Base64
    }
})(this);


var Class = (function () {
    var _mix = function (r, s) {
        for (var p in s) {
            if (s.hasOwnProperty(p)) {
                r[p] = s[p];
            }
        }
    };
    var _extend = function () {

        //initPrototype 设置成false  就不会调用SubClass的init方法
        this.initPrototype = true;
        var prototype = new this();
        this.initPrototype = false;

        var items = Array.prototype.slice.call(arguments) || [],
            item;
        while (item = items.shift()) {
            _mix(prototype, item.prototype || item);
        }

        function SubClass() {
            if (!SubClass.initPrototype && this.init) {
                this.init.apply(this, arguments);
            }
        }

        SubClass.prototype = prototype;
        SubClass.prototype.constructor = SubClass;
        SubClass.extend = _extend;
        return SubClass;
    };
    var Class = function () {
    };
    Class.extend = _extend;
    return Class;
})();

var _indexOf = function (array, item) {
    if (array == null) return -1;
    for (var i = 0, len = array.length; i < len; i++)
        if (array[i] === item) return i;
    return -1;
};


var Event = Class.extend({
    on: function (key, listener) {
        if (!this._events) this._events = {};
        if (!this._events[key]) this._events[key] = [];
        if (_indexOf(this._events[key], listener) === -1 && typeof listener ===
            'function')
            this._events[key].push(listener);
        return this;
    },
    fire: function (key) {
        if (!this._events || !this._events[key]) return;
        var args = Array.prototype.slice.call(arguments, 1) || [];
        var listeners = this._events[key];
        for (var i = 0, len = listeners.length; i < len; i++)
            listeners[i].apply(this, args);

        return this;
    },
    off: function (key, listener) {
        if (!key && !listener) this._events = {};
        if (key && !listener) this._events[key] = [];
        if (key && listener) {
            var listeners = this._events[key],
                index = _indexOf(listeners, listener);
            (index > -1) && listeners.splice(index, 1);
        }
        return this;
    }
});


//组件基础类 添加事件
var Base = Class.extend(Event, {
    init: function (config) {
        this._config = config;
        this.bind();
        this.render();
    },
    get: function (key) {
        return this._config[key];
    },
    set: function (key, value) {
        this._config[key] = value;
    },
    bind: function () {
    },
    render: function () {
    },
    destory: function () {
        this.off();
    }
});

var Component = Base.extend({
    EVENTS: {},
    init: function (config) {
        this._config = config;
        this._delegateEvents();
        this.bind();
        this.render();
    },
    _delegateEvents: function () {
        var self = this,
            events = self.EVENTS || {},
            select, eventObjs, type;
        for (select in events) {
            eventObjs = events[select];
            for (type in eventObjs) {
                fn = eventObjs[type];
                self._delegateEvent(type, select, fn);
            }
        }
    },
    _delegateEvent: function (type, select, fn) {
        var self = this,
            parentNode = self.get('parentNode') || $(document.body);
        parentNode.on(type, select, function (event) {
            fn.call(null, self, this, event);
        });
    },

    destroy: function () {
        var self = this;
        self.off();
        self.get('_currNode').remove();
        var events = self.EVENTS || {};
        var eventObjs, fn, select, type;
        var parentNode = self.get('parentNode');
        for (select in events) {
            eventObjs = events[select];
            for (type in eventObjs) {
                fn = eventObjs[type];
                parentNode.off(select, type, fn);
            }
        }
    }
});

var RichBase = Base.extend({
    EVENTS: {},
    tpl: '',
    init: function (config) {
        this._config = config;
        this._delegateEvents();
    },
    _delegateEvents: function () {
        var self = this,
            events = self.EVENTS || {},
            select, eventObjs, type;
        for (select in events) {
            eventObjs = events[select];
            for (type in eventObjs) {
                fn = eventObjs[type];
                self._delegateEvent(type, select, fn);
            }

        }
    },

    _delegateEvent: function (type, select, fn) {
        var self = this,
            parentNode = self.get('parentNode') || $(document.body);
        parentNode.on(type, select, function (event) {
            fn.call(null, self, this, event);
        });

    },
    setUp: function () {
        this.render();
    },
    setChuckData: function (data) {
        var self = this,
            currNode = self.get('_currNode');
        if (!currNode) return;

        var newNode = $(template(self.tpl, data));
        currNode.replaceWith(newNode);

        self.set('_currNode', newNode);
    },
    render: function (data) {
        var self = this,
            html = template(self.tpl, data),
            currNode = $(html);
        var parentNode = self.get('parentNode') || $(document.body);
        self.set('_currNode', currNode);
        parentNode.append(currNode);
    },
    destroy: function () {
        var self = this;
        self.off();
        self.get('_currNode').remove();
        var events = self.EVENTS || {};
        var eventObjs, fn, select, type;
        var parentNode = self.get('parentNode');

        for (select in events) {
            eventObjs = events[select];
            for (type in eventObjs) {
                fn = eventObjs[type];
                parentNode.off(select, type, fn);
            }

        }
    }
});


var ModuleBase = Base.extend({
    EVENTS: {},
    init: function (config) {
        this._config = config;
        this._delegateEvents();
    },

    _delegateEvents: function () {
        var self = this,
            events = self.EVENTS || {},
            select, eventObjs, type;
        for (select in events) {
            eventObjs = events[select];
            for (type in eventObjs) {
                fn = eventObjs[type];
                self._delegateEvent(type, select, fn);
            }

        }
    },

    _delegateEvent: function (type, select, fn) {
        var self = this,
            parentNode = self.get('parentNode') || $(document.body);
        parentNode.on(type, select, function (event) {
            fn.call(null, self, this, event);
        });

    },
    setUp: function () {
        this.render();
    },
    setChuckData: function (data) {
        var self = this,
            currNode = self.get('_currNode');
        if (!currNode) return;

        var newNode = $(template(self.get('tpl'), data));
        currNode.replaceWith(newNode);

        self.set('_currNode', newNode);
    },
    render: function (data) {
        var self = this,
            html = template(self.get('tpl'), data),
            currNode = $(html);
        var parentNode = self.get('parentNode') || $(document.body);
        self.set('_currNode', currNode);
        parentNode.append(currNode);
    },
    destroy: function () {
        var self = this;
        self.off();
        self.get('_currNode').remove();
        var events = self.EVENTS || {};
        var eventObjs, fn, select, type;
        var parentNode = self.get('parentNode');

        for (select in events) {
            eventObjs = events[select];
            for (type in eventObjs) {
                fn = eventObjs[type];
                parentNode.off(select, type, fn);
            }

        }
    }
});


/**Map
 *
 * @constructor
 */
function Map() {

}

Map.prototype = {
    put: function (key, value) {
        this[key] = value;
    },
    get: function (key) {
        return this[key];
    }
};


var ninimour = window.ninimour || {};


/**
 * ninimour extends
 * @param c
 * @param p
 */
ninimour.extends = function (c, p) {
    c.prototype = new p;
    c.constructor = c;
}

ninimour.anchor = (function () {
    return {
        open: function (url, target) {
            if (target) {
                window.open(url, target);
            }
            window.location.href = url;
        }
    };
})();


/**
 * base util
 * @type {{version, appVersion, deviceType, defaultDomain, baseImagePath, smallProductPath, mediumProductPath, largeProductPath, originalProductPath, getImage, getSmallImage, getMediumImage, getLargeImage, getOriginalImage}}
 */
ninimour.base = (function () {

    var _ctx = typeof(ctx) != 'undefined' && ctx || '';
    var _currency = typeof(currency) != 'undefined' && currency || 'USD';
    var _currentpage = typeof(currentpage) != 'undefined' && currentpage || 'unkonwn';


    return {
        version: 'v7',
        vpath: '/v7',
        appVersion: '3.2.0',
        deviceType: 'pc',
        defaultDomain: 'chiquedoll.com',
        ctx: _ctx,
        currency: _currency,
        currentpage: _currentpage,
        baseImagePath: 'https://dgzfssf1la12s.cloudfront.net',
        smallProductPath: 'https://dgzfssf1la12s.cloudfront.net/small',
        mediumProductPath: 'https://dgzfssf1la12s.cloudfront.net/medium',
        largeProductPath: 'https://dgzfssf1la12s.cloudfront.net/large',
        originalProductPath: 'https://dgzfssf1la12s.cloudfront.net/original',
        getImage: function (image, prefix) {
            return prefix + image;
        },
        getSmallImage: function (image, contact) {
            return this.smallProductPath + contact + image;
        },
        getMediumImage: function (image, contact) {
            return this.mediumProductPath + contact + image;
        },
        getLargeImage: function (image, contact) {
            return this.largeProductPath + contact + image;
        },
        getOriginalImage: function (image, contact) {
            return this.originalProductPath + contact + image;
        },
        getUtmSource: function () {
            return typeof(utm_source) != 'undefined' && utm_source || '';
        },
        getUtmCampaign: function () {
            return typeof(utm_campaign) != 'undefined' && utm_campaign || '';
        },
        getUtmMedium: function () {
            return typeof(utm_medium) != 'undefined' && utm_medium || ''
        }

    };
})();


ninimour.utils = (function () {

    var _days = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sept.", "Oct.", "Nov.", "Dec."];

    var dateutil = {
        createDate: function (l) {
            return new Date(l);
        },
        getLFormatDate: function (l) {
            if (!!!l)
                return '';
            var t = this.createDate(l);
            return this.getFormatDate(t);
        },
        getFormatDate: function (t) {
            var mn = t.getMonth(), dt = t.getDate(), y = t.getFullYear();
            return _days[mn] + '' + dt + ', ' + y;
        },
    };


    var moneyutil = {
        getUnitPrice: function (money) {
            if (money)
                return money.unit + money.amount;
            return '';
        },
        getQuantityPrice: function (money, quantity) {
            if (money)
                return (money.unit + (money.amount * quantity).toFixed(2));
            return '';
        }
    };


    Array.prototype.indexOf || (Array.prototype.indexOf = function (d, e) {
        var a;
        if (null == this) throw new TypeError('"this" is null or not defined');
        var c = Object(this),
            b = c.length >>> 0;
        if (0 === b) return -1;
        a = +e || 0;
        Infinity === Math.abs(a) && (a = 0);
        if (a >= b) return -1;
        for (a = Math.max(0 <= a ? a : b - Math.abs(a), 0); a < b;) {
            if (a in c && c[a] === d) return a;
            a++
        }
        return -1
    });


    var arrayutil = {
        removeObj: function (obj, arr) {
            var index = arr.indexOf(obj);
            if (index > -1) {
                arr.splice(index, 1);
            }
        }
    };


    var _urlparam = (function () {
        // This function is anonymous, is executed immediately and
        // the return value is assigned to QueryString!
        var query_string = {};
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split("=");
            // If first entry with this name
            if (typeof query_string[pair[0]] === "undefined") {
                query_string[pair[0]] = decodeURIComponent(pair[1]);
                // If second entry with this name
            } else if (typeof query_string[pair[0]] === "string") {
                var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
                query_string[pair[0]] = arr;
                // If third or later entry with this name
            } else {
                query_string[pair[0]].push(decodeURIComponent(pair[1]));
            }
        }
        return query_string;
    })();

    var shareutil = {
        getProductUrl: function (productId, source, callBack) {
            ninimour.http.get(ninimour.base.ctx + '/i/des', {
                productId: productId,
                source: (source ? source : 'f')
            }, callBack);
        },
        shareBack: function (productId, source) {
            var _source = source ? source : 'facebook';
            ninimour.http.get(ninimour.base.ctx + ninimour.base.vpath, {
                productId: productId,
                source: _source
            }, function (data) {
            });
        }
    };

    var urlutil = {
        getSSLUrl: function (suffix) {
            return 'https://' + serverPath + suffix;
        },

        getBaseUrl: function (suffix) {
            return 'http://' + serverPath + suffix;
        }
    };

    var _remember = function (email, password) {
        ninimour.cookie.add('e', Base64.encode('["' + email + '","' + password + '"]'), 365);
    }

    var loginutil = {
        login: function (email, password, callBack) {
            ninimour.http.loadingPost(ninimour.base.ctx + ninimour.base.vpath + '/login-customer/anon/login', {
                email: email,
                password: password
            }, function (data) {
                _remember(email, password);
                callBack(data);
            });
        },
    };


    return {
        'dateutil': dateutil,
        'moneyutil': moneyutil,
        'arrayutil': arrayutil,
        'getUUID': function () {
            function S4() {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            }

            return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
        },
        'urlparam': _urlparam,
        'shareutil': shareutil,
        'urlutil': urlutil,
        'loginutil': loginutil
    }


})();


/**
 * countdown util
 */
ninimour.countdown = (function () {
    var $doms = [], gone = 0;

    setInterval(function () {
        gone += 1000;
        refreshDoms();
    }, 1000);

    var refreshDoms = function () {

        $doms = $('span[data-type=date]');

        if ($doms.length > 0) {
            var $dom;
            for (var i = 0, len = $doms.length; i < len; i++) {
                $dom = $($doms[i]);
                var ms = $dom.data('ms');
                if (ms && !isNaN(ms) && (ms - gone) > 0) {
                    $dom.html(getTimestr(ms - gone));
                }
            }
        }
    };

    var getFullNumber = function (s) {
        return s >= 10 ? s : ('0' + s);
    };

    var getTimestr = function (leftl) {
        var dr = 1000 * 60 * 60 * 24, hr = 1000 * 60 * 60, mr = 1000 * 60;
        var day = getFullNumber(Math.floor(leftl / dr));
        var l_hour = leftl % dr;
        var hour = getFullNumber(Math.floor(l_hour / hr));
        var l_minuite = leftl % hr;
        var minuite = getFullNumber(Math.floor(l_minuite / mr));
        var l_second = leftl % mr;
        var second = getFullNumber(Math.round(l_second / 1000));


        return '<span class="date-num">' + day + '</span><span class="date-label">d</span><span class="date-doted">:</span><span class="date-num">' + hour + '</span><span class="date-label">h</span><span class="date-doted">:</span><span class="date-num">' + minuite + '</span><span class="date-label">m</span><span class="date-doted">:</span><span class="date-num">' + second + '</span><span class="date-label">s</span>';
    };

})();


/**
 * alert util
 * @type {{alert, confirm}}
 */
ninimour.show = (function () {

    var _getTitle = function (title) {
        var title = document.createElement('div');
        title.className = 'x-alert-header';
        return title;
    }

    var _getBody = function (message) {

    }

    var getAlertFooter = function () {

    }

    return {
        alert: function (title, message) {

        },
        confirm: function (title, message, ok, no) {

        }
    };
})();

/**
 * cookie util
 * @type {{add, remove}}
 */
ninimour.cookie = (function () {
    return {
        add: function (key, data, expires) {
            $.cookie(key, data, {expires: expires, path: '/'});
        },
        remove: function (key) {
            $.cookie(key, null, {expires: -1, path: '/'});
        },
        get: function (key) {
            return $.cookie(key);
        }

    };
})();

/**
 * url util
 * @type {{getProductUrl, getCollectionUrl, getCategoryUrl}}
 */
ninimour.url = (function () {

    var _url_analyst = function (name) {
        if (name) {
            return name.replace(new RegExp(/\s/g), '-');
        }
        return 'empty-name';
    }

    var _concat = function () {
        var args = Array.prototype.slice.call(arguments);
        return args.join('/');
    }


    return {
        getProductUrl: function (product) {
            return _concat(ninimour.base.ctx, 'product', _url_analyst(product.name), product.parentSku, product.id + '.html');
        },
        getCollectionUrl: function (collection) {
            return _concat(ninimour.base.ctx, 'collection', _url_analyst(collection.name), collection.id + '.html');
        },
        getCategoryUrl: function (category) {
            return _concat(ninimour.base.ctx, 'category', _url_analyst(category.name), category.id + '.html');
        }
    };
})();

/**
 * request util
 * @type {{post, get, tokenPost, tokenGet}}
 */
ninimour.http = (function () {
    var _cache_map = new Map();

    var _getWid = function () {
        var wid = '';
        wid = ninimour.cookie.get('clientId');
        if (!wid) {
            ninimour.cookie.add('clientId', ninimour.utils.getUUID(), 365);
            wid = ninimour.cookie.get('clientId');
            if (!wid) {
                wid = typeof(sessionId) == "undefined" ? "" : sessionId;
                ninimour.cookie.add('clientId', wid, 365);
            }
        }
        return wid;
    };

    var _countryCode = function () {
        var language = navigator.language;
        if (language && language.indexOf("-") >= 0) {
            var keys = language.split("-");
            if (keys.length <= 1)
                return "US";
            return keys[1].toUpperCase();
        }
        return "US";
    };

    var _default_headers = {
        version: ninimour.base.version,
        appVersion: ninimour.base.appVersion,
        deviceType: ninimour.base.deviceType,
        defaultDomain: 'chiquedoll.com',
        domain: document.domain,
        countryCode: _countryCode(),
        wid: _getWid()
    };


    var _token_header = {
        version: ninimour.base.version,
        appVersion: ninimour.base.appVersion,
        deviceType: ninimour.base.deviceType,
        defaultDomain: 'chiquedoll.com',
        domain: document.domain,
        countryCode: _countryCode(),
        wid: _getWid()
    };

    var _cache = true;


    var _ajax = function (url, method, data, header, _success, _error, _complete) {
        $.ajax(url, {
            headers: header,
            method: method,
            async: true,
            cache: _cache,
            data: data,
            success: function (data) {

                if (data.code == '200') {
                    if (_success) _success(data);
                } else {
                    if (_error) _error(data);
                }

            },
            error: function () {

            },
            complete: function () {
                if (_complete) {
                    _complete();
                }
            }
        });
    };

    var _form = function (url, method, data, header, _success, _error, _complete) {
        $.ajax(url, {
            headers: header,
            method: method,
            async: true,
            cache: true,
            data: data,
            processData: false,
            contentType: false,
            success: function (data) {

                if (data.code == '200') {
                    if (_success) _success(data);
                } else {
                    if (_error) _error(data);
                }

            },
            error: function () {

            },
            complete: function () {
                if (_complete) {
                    _complete();
                }
            }
        });
    };

    var _bodyajax = function (url, method, data, header, _success, _error) {
        $.ajax(url, {
            headers: header,
            contentType: "application/json",
            method: method,
            async: true,
            cache: true,
            data: data,
            success: function (data) {
                if (_success) {
                    _success(data);
                }
            },
            error: function () {
                if (_error) {
                    _error();
                }
            }

        });
    };

    var _createLoading = function () {
        $('body').append('<div class="x-screen-loading screen-loading"><span class="x-loading"><span></span><span></span><span></span></span></div>');
    }

    var _timeroutid;

    return {
        setCache: function (c) {
            _cache = c;
        },
        post: function (url, data, success, error, complete) {
            _ajax(url, 'POST', data, _default_headers, success, error, complete);
        },
        get: function (url, data, success, error, complete) {
            _ajax(url, 'GET', data, _default_headers, success, error, complete);
        },
        form: function (url, data, success, error, complete) {
            _form(url, 'POST', data, _default_headers, success, error, complete);
        },
        authcget: function (url, data, success, error) {
            _ajax(url, 'GET', data, _default_headers, success, function (data) {
                if (data && (data.code = '300' || data.code == '600')) {
                    ninimour.anchor.open(ninimour.base.ctx + '/page/login');
                } else {
                    error(data);
                }
            });
        },
        multiSearch: function(url , method , data , success, error, complete){
            clearTimeout(_timeroutid);
            _timeroutid = setTimeout(function(){
                _ajax(url, method, data, _default_headers, success, error, complete);
            } , 500);
        },
        authget: function (url, data, success, error) {
            _ajax(url, 'POST', data, _default_headers, success, function (data) {
                if (data && (data.code = '300' || data.code == '600')) {
                    ninimour.anchor.open(ninimour.base.ctx + '/page/login');
                } else {
                    error(data);
                }
            });
        },

        authcpost: function (url, data, success, error) {
            _ajax(url, 'POST', data, _default_headers, success, function (data) {
                if (data && (data.code == '300' || data.code == '600')) {
                    ninimour.anchor.open(ninimour.base.ctx + '/page/login');
                } else {
                    error(data);
                }
            });
        },

        loadingGet: function (url, data, success, error) {
            _createLoading();
            this.get(url, data, success, error, function () {
                $('.screen-loading').remove();
            });
        },
        loadingPost: function (url, data, success, error) {
            _createLoading();
            this.post(url, data, success, error, function () {
                $('.screen-loading').remove();
            });
        },
        loadingForm: function (url, data, success, error) {
            _createLoading();
            this.form(url, data, success, error, function () {
                $('.screen-loading').remove();
            });
        },
        cacheGet: function (key, url, data, success, error) {
            var cacher = _cache_map.get(key);
            if (cacher) {
                success(cacher);
                return;
            }

            this.get(url, data, function (data) {
                _cache_map.put(key, data);
                success(data);
            }, error);
        },
        request: function (url, data, success, error) {
            _bodyajax(url, 'POST', data, _default_headers, success, error);
        },
        tokenPost: function (url, data, token, success, error) {
            _token_header['accessToken'] = token;
            _ajax(url, 'POST', data, _token_header, success, error);
        },
        tokenGet: function (url, data, token, success, error) {
            _token_header['accessToken'] = token;
            _ajax(url, 'GET', data, _token_header, success, error);
        },

    };
})();

ninimour.fixedwindow = (function () {

    var $mask;

    var _createMask = function () {
        $mask = $('.x-mask');
        if ($mask && $mask.length > 0) {
            $mask.show();
        } else {
            $mask = $('<div class="x-mask">');
            $('body').append($mask);
        }
    };

    var _hideMask = function () {
        if ($mask)
            $mask.hide();
    }

    return {
        open: function ($window) {
            $('html , body').css({'overflow-y': 'hidden'});
            $window.show();
            _createMask();
        },
        close: function ($window) {
            $('html , body').css({'overflow-y': 'auto'});
            $window.hide();
            _hideMask();
        }
    };
})();


ninimour.element = (function () {
    return {
        headerHeight: 150,
        getHeaderHeight: function () {
            return $('#ninimour-x-header').height();
        }
    };
})();


ninimour.event = (function () {
    return {
        stop: function (event) {
            event.preventDefault();
            event.stopPropagation();
        },
        getHideNodes: function () {
            return $('.hideNodes');
        }
    };
})();


ninimour.listing = function () {
}

ninimour.listing.prototype = (function () {

    var _getLimitUrl = function (url, skip, limit) {
        return url.replace('{skip}', skip).replace('{limit}', limit);
    }


    var _requestLists = function (_url, _data, callBack) {
        //todo add loading
        ninimour.http.get(_url, _data, function (data) {
            //todo remove loading
            callBack(data);
        });
    };

    var _createElements = function (list, func) {
        if (list && list.length > 0) {
            for (var i = 0, len = list.length; i < len; i++) {
                func(list[i]);
            }
        }
    };

    var _bindScroll = function (scroller, func) {
        scroller.scroll(function (event) {
            ninimour.event.stop(event);

            var $document = scroller.is($(window)) ? $(document) : scroller.children();

            var scrollTop = scroller.scrollTop(),
                scrollHeight = $document.height(),
                windowHeight = scroller.height();
            if (scrollTop + windowHeight >= scrollHeight - 20) {
                func();
            }
        });
    }


    return {
        init: function () {
            var self = this;
            this.loaded = true;
            if (this.scroller) {
                _bindScroll(this.scroller, function () {
                    self.load();
                });
            }
            self.load();
        },
        load: function () {
            var html = [], self = this;
            if (self.loaded) {
                self.loaded = false;
                _requestLists(_getLimitUrl(self.url, self.skip, self.limit), self.data, function (data) {
                    self.skip += self.limit;
                    self.loaded = true;
                    _createElements(data.result, function (element) {
                        html.push(self.createElement(element));
                    });
                    self.container.append(html.join(''));
                });
            }
        }
    };
})();


ninimour.productutil = (function () {

    var _isPromotion = function (product) {
        return product && product.promotion && product.promotion.enabled && product.promotion.promotionPrice;
    }

    var _getLowerPrice = function (product) {
        if (_isPromotion(product))
            return product.promotion.promotionPrice;
        return product.price;
    }

    var _getDeletePrice = function (product) {
        if (_isPromotion(product)) {
            if (product.msrp && Number(product.msrp.amount) > 0) {
                return product.msrp;
            }
            return product.price;
        } else {
            if (product.msrp && Number(product.msrp.amount) > 0) {
                return product.msrp;
            }
            return null;
        }
    }

    var _getPercent = function (product) {
        var lowerprice = _getLowerPrice(product);
        var deletePrice = _getDeletePrice(product);

        if (lowerprice && deletePrice) {
            return Math.round((Number(deletePrice.amount) - Number(lowerprice.amount)) / Number(deletePrice.amount) * 100);
        }
        return 0;
    }

    var _getSelectedVariant = function (variantId, variants) {
        for (var i = 0, len = variants.length; i < len; i++) {
            if (variantId == variants[i].id)
                return variants[i];
        }
        return null;
    }


    return {
        promotion: {
            isPromotion: _isPromotion
        },
        price: {
            getLowerPrice: _getLowerPrice,
            getDeletePrice: _getDeletePrice,
            getPercent: _getPercent
        },
        getVariant:_getSelectedVariant
    };
})();


ninimour.products = (function () {

    var _getLimitUrl = function (url, skip, limit) {
        return url.replace('{skip}', skip).replace('{limit}', limit);
    }


    var _getPriceBannel = function (product) {
        var lowerprice = ninimour.productutil.price.getLowerPrice(product);
        var deleteprice = ninimour.productutil.price.getDeletePrice(product);
        var percent = ninimour.productutil.price.getPercent(product);

        var html = [];
        html.push('<span class="x-price">' + ninimour.utils.moneyutil.getUnitPrice(lowerprice) + '</span>');
        if (deleteprice) {
            html.push('<del class="x-delete-price">' + ninimour.utils.moneyutil.getUnitPrice(deleteprice) + '</del>');
        }

        if (percent > 0) {
            html.push('<span class="x-percent">' + percent + '% OFF</span>');
        }

        return html.join('');

    }


    var _createProduct = function (product) {
        var productDom = [
            '<li class="x-product">',
            '    <a target="_blank" href="' + ninimour.url.getProductUrl(product) + '" title="' + product.name + '">',
            '        <figure class="x-image-area">',
            '            <img class="main" src="' + ninimour.base.getLargeImage(product.pcMainImage, '/') + '">',
            '            <img src="' + ninimour.base.getLargeImage(product.pcMainImage2 ? product.pcMainImage2 : product.pcMainImage, '/') + '">',
            '        </figure>',
            '        <figcaption class="x-product-caption">',
            '            <div class="x-product-name x-text-center">',
            product.name,
            '            </div>',
            '            <div class="x-product-line-height x-product-prices">',
            _getPriceBannel(product),
            '            </div>',
            '        </figcaption>',
            '    </a>',
            '</li>'
        ];

        return productDom.join('');
    };

    var _requestProducts = function (_url, _data, callBack, isFlash) {
        var html = [];
        ninimour.http.get(_url, _data, function (data) {
            var products = data.result;
            if (products && products.length > 0) {

                for (var i = 0, len = products.length; i < len; i++) {
                    if (isFlash) {
                        if (products[i] && products[i].product) {
                            html.push(_createProduct(products[i].product));
                        }
                    } else {
                        html.push(_createProduct(products[i]));
                    }

                }
            }

            callBack(html.join(''));
        }, function () {
        });
    };


    var _instance = Event.extend({
        init: function (config) {
            this._config = config || {};
            var loaded = true;


            if (this._config['isScroll']) {

                var $scroller = this._config['scroller'] || $(window), self = this;

                $scroller.scroll(function (event) {
                    ninimour.event.stop(event);

                    var scrollTop = $(window).scrollTop(),
                        scrollHeight = $(document).height(),
                        windowHeight = $(window).height();
                    if (scrollTop + windowHeight >= scrollHeight - 300) {
                        self.load();
                    }


                });
            }

            this._config['container'].on('click', 'a', function (event) {
                self.fire('listingclick', $(this).data('product'));
            });

            this.set = function (k, v) {
                this._config[k] = v;
            }

            this.refresh = function () {
                var self = this;
                this._config['skip'] = 0;

                var prefix = ninimour.base.ctx + ninimour.base.vpath;

                if (this._config['ignoreVersion']) {
                    prefix = ninimour.base.ctx;
                }


                _requestProducts(prefix + _getLimitUrl(self._config.url, self._config.skip, self._config.limit), self._config.data, function (html) {
                    var _container = self._config['container'] || $('body');
                    _container.empty().append(html);
                    self._config.skip += self._config.limit;
                }, self._config.isFlash);
            };

            this.load = function () {
                var self = this;
                var prefix = ninimour.base.ctx + ninimour.base.vpath;

                if (this._config['ignoreVersion']) {
                    prefix = ninimour.base.ctx;
                }

                if (loaded) {
                    loaded = false;
                    _requestProducts(prefix + _getLimitUrl(self._config.url, self._config.skip, self._config.limit), self._config.data, function (html) {
                        var _container = self._config['container'] || $('body');
                        _container.append(html);
                        self.fire('listingrefresh', self._config.skip , self._config.limit);
                        loaded = true;
                        self._config.skip += self._config.limit;
                    }, self._config.isFlash);
                }
            };
        }
    });


    return _instance;
})();

ninimour.sliders = (function () {


    var _createNav = function ($container, navLength, clickBack) {
        var $ol = $('<ol>');
        for (var i = 0; i < navLength; i++) {
            $ol.append('<li>');
        }

        $ol.css({
            'text-align': 'center',
            'position': 'absolute',
            'width': '100%',
            'bottom': '10px',
            'left': 0
        }).children('li').css({
            'display': 'inline-block',
            'width': '10px',
            'height': '10px',
            'border-radius': '50%',
            'background-color': '#fff',
            'margin-right': '10px',
            'cursor': 'pointer'
        }).first().css({'background-color': '#000'});
        $container.append($ol);

        $container.children('ol').children('li').on('click', function (event) {
            ninimour.event.stop(event);
            clickBack($container.children('ol').children('li').index(this));
        });

    };

    var _activeIndexNav = function ($container, index) {
        $container.children('ol').children('li').css({'background-color': '#fff'}).eq(index).css({'background-color': '#000'});
    }

    var SimpleSlider = function (config) {
        this.container = config.container;
        this.auto = config.auto;
        this.speed = config.speed || 5000;
        this.showNav = config.showNav;
        this.showController = config.showController;
        this.percent = config.percent || 1;
    };


    SimpleSlider.prototype = {
        init: function () {
            var self = this;
            var $listul = this.container.children('ul');
            var $listli = $listul.children('li');
            if ($listul.length < 1 || $listli.length < 1) {
                console.warn('list is empty');
                return;
            }

            this.container.css({'position': 'relative'});
            $listul.css({'position': 'relative'});
            $listli.css({
                'position': 'absolute',
                'top': 0,
                'left': 0,
                'width': '100%',
                'display': 'none'
            }).first().css({'display': 'block'});

            $listul.height($listli.first().width() * this.percent);


            $(window).resize(function () {
                $listul.height($listli.not(':hidden').width() * self.percent);
            });

            this.container.on('mouseover', function () {
                self.timmer && clearInterval(self.timmer);
            }).on('mouseout', function () {
                self.timmer = setInterval(function () {
                    self.next();
                }, self.speed);
            });


            if (this.auto) {
                this.timmer = setInterval(function () {
                    self.next();
                }, self.speed);
            }

            if (this.showNav) {
                _createNav(this.container, $listli.length, function (index) {
                    self.go(index);
                });
            }

        },
        next: function () {
            var $nextor = this.container.children('ul').children('li').not(':hidden').next();

            var index = this.container.children('ul').children('li').index($nextor);

            if ($nextor.length > 0) {
                $nextor.fadeIn().siblings().fadeOut();
            } else {
                this.container.children('ul').children('li').first().fadeIn().siblings().fadeOut();
                index = 0;
            }

            _activeIndexNav(this.container, index);
        },
        prev: function () {
        },
        go: function (index) {
            var $nextor = this.container.children('ul').children('li').eq(index);
            if ($nextor.length > 0) {
                $nextor.fadeIn().siblings().fadeOut();
            } else {
                this.container.children('ul').children('li').first().fadeIn().siblings().fadeOut();
                index = 0;
            }
            _activeIndexNav(this.container, index);
        },
        add: function () {
        }
    };


    return {
        'SimpleSlider': SimpleSlider
    };
})();


ninimour.recordEvent = (function () {


})();


ninimour.pagecache = (function () {

    var DIC_URL = '';

    var _getDictory = function (typeCode, callBack) {
        ninimour.http.cacheGet(typeCode, ninimour.base.ctx + '/dictionary/anon/get', {'typeCode': typeCode}, callBack);
    }

    return {
        'getCountries': function (callBack) {
            _getDictory('country', callBack);
        },
        'getStates': function (country, callBack) {
            _getDictory('state-' + country, callBack);
        }
    };

})();

ninimour.windows = (function () {

    var _add_address_url = ninimour.base.ctx + '/customer/add/address2',
        _edit_address_url = ninimour.base.ctx + '/customer/update-address',
        _order_address_url = ninimour.base.ctx + ninimour.base.vpath + '/order/anon/shipping-detail-update';


    var _getLabel = function (obj, field) {
        if (!!!obj) return '';
        return obj[field] ? obj[field] : '';
    };


    var _initaddressselectors = function (address) {

        var countries = [];
        var selectedCountry = (address && address.country) ? address.country.value : null;


        ninimour.pagecache.getCountries(function (data) {
            countries = data.result;
            var countryOptions = _createOptions(selectedCountry, countries, {value: '-1', label: 'Country*'});
            $('#w-country').append(countryOptions);

        });

        var selectedState = (address && address.state) ? address.state.value : null;
        initStates(address, selectedCountry, selectedState);


        $('#ninimour-address-window').on('change', '#w-country', function (e) {
            ninimour.event.stop(e);
            initStates(address, $(this).val(), selectedState);
        });
    };


    var initStates = function (address, selectedCountry, selectedState) {
        var states = [];
        if (selectedCountry) {
            var state = (address && address.state) ? address.state : null;
            ninimour.pagecache.getStates(selectedCountry, function (data) {
                states = data.result;
                var stateOptions = _createOptions(selectedState, states, {value: '-1', label: 'State*'});
                if (stateOptions && stateOptions.length > 0) {
                    $('#widow-states-wrapper').empty().append('<select id="w-state">' + stateOptions + '</select>');
                } else {
                    var input = '<input class="x-input" type="text" id="w-state" placeholder="State" value="' + (selectedState ? selectedState : '') + '">';
                    $('#widow-states-wrapper').empty().append(input);
                }
            });
        } else {
            $('#widow-states-wrapper').empty().append('<select id="w-state"><option value="-1">State *</option></select>');
        }

    }


    var _createOptions = function (selected, list, defaultOption) {
        var html = [], obj;
        if (list && list.length > 0) {
            html.push('<option value="' + defaultOption.value + '">' + defaultOption.label + '</option>');
            for (var i = 0, len = list.length; i < len; i++) {
                obj = list[i];
                if (obj.value == selected) {
                    html.push('<option selected value="' + obj.value + '">' + obj.label + '</option>');
                } else {
                    html.push('<option value="' + obj.value + '">' + obj.label + '</option>');
                }
            }
        }
        return html;
    }


    var _createWindow = function (address) {
        var html = [
            '<div class="s-address-form dialog" id="ninimour-address-window">',
            '	<div class="hd"><h3>Address</h3><span class="cls"></span></div>',
            '	<div class="bd">',
            '   <form id="window-address-form">',
            '       <input type="hidden" id="w-id" value="' + _getLabel(address, 'id') + '">',
            '       <div class="s-address-line">',
            '           <span>Indicates Required field</span>',
            '       </div>',
            '       <div class="s-address-line">',
            '           <input class="x-input" placeholder="Full Name*" required id="w-name" value="' + _getLabel(address, 'name') + '">',
            '       </div>',
            '       <div class="s-address-line">',
            '           <input class="x-input" placeholder="Street Address*" required id="w-streetAddress1" value="' + _getLabel(address, 'streetAddress1') + '">',
            '       </div>',
            '       <div class="s-address-line">',
            '           <input class="x-input" placeholder="Apt / Suit / Unit(Optional)" id="w-unit" value="' + _getLabel(address, 'unit') + '">',
            '       </div>',
            '       <div class="multi-inputs">',
            '           <div class="s-address-line pure-u-md-1-2">',
            '               <select id="w-country">',
            '               </select>',
            '           </div>',
            '           <div class="s-address-line pure-u-md-1-2" id="widow-states-wrapper">',
            '           </div>',
            '       </div>',
            '        <div class="multi-inputs">',
            '           <div class="s-address-line pure-u-md-1-3">',
            '               <input class="x-input" required placeholder="City*" id="w-city" value="' + _getLabel(address, 'city') + '">',
            '           </div>',
            '           <div class="s-address-line pure-u-md-1-3">',
            '               <input class="x-input" required title="Oops,zip/postal code is invalid" pattern="^[\\w-]{4,20}$" placeholder="Zip / Postal Code*" id="w-zipCode" value="' + _getLabel(address, 'zipCode') + '">',
            '           </div>',
            '           <div class="s-address-line pure-u-md-1-3">',
            '               <input class="x-input" required placeholder="Phone*" id="w-phoneNumber" value="' + _getLabel(address, 'phoneNumber') + '">',
            '           </div>',
            '       </div>',
            '        <div class="s-address-line x-text-center">',
            '           <button class="x-btn active submit-btn" type="submit">confirm</button>',
            '       </div>',
            '   </form>',
            '	</div>',
            '</div>'
        ].join('');

        $('body').append(html);
        ninimour.fixedwindow.open($('#ninimour-address-window'));
        _initaddressselectors(address);

    };

    var _close = function () {
        ninimour.fixedwindow.close($('#ninimour-address-window'));
        $('#ninimour-address-window').remove();
        $('#ninimour-address-window').off();

    }


    var _generateAddress = function () {
        var address = {};
        address['id'] = $('#w-id').val();
        address['name'] = $('#w-name').val();
        address['streetAddress1'] = $('#w-streetAddress1').val();
        address['unit'] = $('#w-unit').val();
        address['country'] = $('#w-country').val();
        address['state'] = $('#w-state').val();
        address['city'] = $('#w-city').val();
        address['zipCode'] = $('#w-zipCode').val();
        address['phoneNumber'] = $('#w-phoneNumber').val();
        // formData['orderNo'] = self._transationId;
        // formData['defaultAddress'] = !!isDefault;
        return address;
    };


    var _editaddress = function (isDefault, callBack) {
        var address = _generateAddress();
        address['defaultAddress'] = isDefault;
        ninimour.http.post(_edit_address_url, address, function (data) {
            callBack(data);
            _close();
        }, function (data) {
            alert(data.result);
        });

    };

    var _addaddress = function (isDefault, callBack) {
        var address = _generateAddress();
        address['defaultAddress'] = isDefault;
        ninimour.http.post(_add_address_url, address, function (data) {
            callBack(data);
            _close();
        }, function (data) {
            alert(data.result);
        });

    };


    //edit address


    return {
        addressWindow: {
            editAddress: function (address, isDefault, callBack) {
                _createWindow(address);
                $('#ninimour-address-window').on('submit', '#window-address-form', function (e) {
                    ninimour.event.stop(e);
                    if ($('#w-country').val() == '-1') {
                        alert('country is required!');
                        return false;
                    }
                    if ($('#w-state').val() == '-1') {
                        alert('state is required!');
                        return false;
                    }
                    _editaddress(isDefault, callBack);
                    return false;
                });
                $('#ninimour-address-window').on('click', '.cls', function (e) {
                    ninimour.event.stop(e);
                    _close();
                });
            },
            addAddress: function (isDefault, callBack) {
                _createWindow(null);
                $('#ninimour-address-window').on('submit', '#window-address-form', function (e) {
                    ninimour.event.stop(e);
                    if ($('#w-country').val() == '-1') {
                        alert('country is required!');
                        return false;
                    }
                    if ($('#w-state').val() == '-1') {
                        alert('state is required!');
                        return false;
                    }
                    _addaddress(isDefault, callBack);
                    return false;
                });

                $('#ninimour-address-window').on('click', '.cls', function (e) {
                    ninimour.event.stop(e);
                    _close();
                });
            },
            close: _close
        }

    };
})();


ninimour.shoppingcartutil = (function () {

    var _shoppingcount = 0;

    var _init_count = function () {
        ninimour.http.get(ninimour.base.ctx + ninimour.base.vpath + '/shopping-cart/count-products', {}, function (data) {
            _shoppingcount = data.result;
            $('#ninimour-cart-number').text(_shoppingcount);
            if (_shoppingcount && _shoppingcount > 0) {
                $('#ninimour-cart-number').show();
            } else {
//                $('#ninimour-cart-number').hide();
            }
        });
    }

    var _loadingcart = function (callBack) {
        ninimour.http.get(ninimour.base.ctx + ninimour.base.vpath + '/shopping-cart/show', {}, function (data) {
            callBack(data.result);
        });
    };

    var _create_item = function (product) {
        return [
            '<li class="x-h-item x-row">',
            '    <div class="x-cell x-v-top">',
            '        <img src="' + product.imageUrl + '">',
            '   </div>',
            '   <div class="x-cell x-v-top">',
            '       <div class="x-h-name">' + product.productName + '</div>',
            '       <div>',
            '           <span class="x-h-price">' + ninimour.utils.moneyutil.getUnitPrice(product.realPrice) + '</span>',
            '           <del>' + ninimour.utils.moneyutil.getUnitPrice(product.itemPrice) + '</del>',
            '           <span class="x-h-percent">' + (product.productDiscountRate * 100) + '% OFF</span>',
            '       </div>',
            '       <div>',
            '           <span>' + product.size + '</span>',
            '           <span>' + product.color + '</span>',
            '       </div>',
            '       <div>',
            '           <span>x' + product.quantity + '</span>',
            '           <span class="x-h-subtotal-container"><span>Subtotal:</span><span class="x-h-subtotal">' + ninimour.utils.moneyutil.getQuantityPrice(product.realPrice, product.quantity) + '</span></span>',
            '       </div>',
            '   </div>',
            '</li>'
        ].join('');
    }

    var _create_cart = function (cart, isDisplay) {

        var shoppingCartProductsByOverseas = cart.shoppingCartProductsByOverseas, orderSummary = cart.orderSummary, messages = cart.messages;
        var itemDoms = [], itemDom;

        if(shoppingCartProductsByOverseas && shoppingCartProductsByOverseas.length > 0){
            for (var i = 0, len = shoppingCartProductsByOverseas.length; i < len; i++) {
                itemDom = _create_item(shoppingCartProductsByOverseas[i]);
                itemDoms.push(itemDom);
            }
        }

        var domesticDeliveryCases = cart.domesticDeliveryCases , _case;
        for(var i = 0 , len = domesticDeliveryCases.length ; i < len ; i++){
            _case = domesticDeliveryCases[i];
            if(_case.shoppingCartProducts && _case.shoppingCartProducts.length > 0){
                for(var j = 0 , jen = _case.shoppingCartProducts.length ; j < jen ; j++){
                    itemDom = _create_item(_case.shoppingCartProducts[i]);
                    itemDoms.push(itemDom);
                }
            }

        }


        function _getMessage() {
            if (messages && messages.orderSummaryMsg) {
                return '<div class="x-h-summary-tip">' + messages.orderSummaryMsg + '</div>';
            }

            return '';
        }

        var html = [
            '<div class="x-h-cart ' + (!isDisplay ? 'x-hide' : '') + '" id="ninimour-header-cart">',
            '    <div class="x-h-items-container">',
            '       <ul class="x-h-items x-table x-full-width">',
            itemDoms.join(''),
            '       </ul>',
            '   </div>',
            '   <div class="x-h-summary">',
            '       <div class="x-table">',
            '           <div class="x-row">',
            '               <div class="x-cell x-retail-label">Retail Price</div>',
            '               <div class="x-cell">' + ninimour.utils.moneyutil.getUnitPrice(orderSummary.itemTotal) + '</div>',
            '           </div>',
            '           <div class="x-row">',
            '               <div class="x-cell x-total-label">Total</div>',
            '               <div class="x-cell x-total-price">' + ninimour.utils.moneyutil.getUnitPrice(orderSummary.orderTotal) + '</div>',
            '           </div>',
            '       </div>',
            '   </div>',
            _getMessage(),
            '   <div class="x-h-btns">',
            '       <a href="' + ninimour.utils.urlutil.getSSLUrl('shoppingcart/show') + '" class="x-btn active">Check Out</a>',
            '   </div>',
            '</div>'
        ];


        var $ordercart = $('#ninimour-header-cart');
        var $newcart = $(html.join(''));
        if ($ordercart.length <= 0) {
            $('#ninimour-cart-hover').append($newcart);
        } else {
            $ordercart.replaceWith($newcart);
        }


        if (isDisplay) {
            setTimeout(function () {
                $newcart.fadeOut();
            }, 3000);
        }

    }

    return {
        getCount: function () {
            return _shoppingcount;
        },
        initCount: _init_count,
        notify: function (isDisplay) {
            _init_count();
            _loadingcart(function (cart) {
                if (cart && (cart.shoppingCartProductsByOverseas && cart.shoppingCartProductsByOverseas.length > 0 || cart.domesticDeliveryCases && cart.domesticDeliveryCases.length > 0)) {
                    _create_cart(cart, isDisplay);
                } else {
                    $('#ninimour-header-cart').remove();
                }
            });
        }
    };
})();

ninimour.customer = (function () {
    var _customer = null;


    var _instance = Event.extend({
        init: function () {
            var self = this;
            ninimour.http.cacheGet('_customer', ninimour.base.ctx + ninimour.base.vpath + '/customer/get', {}, function (data) {
                _customer = data.result;
                self.fire('customerloaded', _customer);
            }, function (data) {
                self.fire('customerloaded', null);
            });
        },
        get: function () {
            return _customer;
        }
    });

    var customer = new _instance();


    return customer;

})();


ninimour.wishlist = (function () {

    var _wishs = [];

    var _getwishs = function () {
        ninimour.http.get(ninimour.base.ctx + ninimour.base.vpath + '/wanna-list/show', {}, function (data) {
            if (data.result && data.result.length > 0) {
                _wishs = data.result[0].productIds;
                _ativeWishedBtns();
            }
        });
    }


    var _ativeWishedBtns = function () {
        var $btns = $('.ninimour-like-btn');
        if ($btns.length > 0) {
            $btns.each(function () {
                var productId = $(this).attr('product-id');
                if ($.inArray(productId, _wishs) >= 0) {
                    $(this).addClass('liked');
                }
            });
        }
    }


    var _add = function (productId, callBack) {

        ninimour.http.authcget(ninimour.base.ctx + ninimour.base.vpath + '/wanna-list/' + productId + '/add-product', {}, function (data) {
            _wishs.push(productId);
            callBack(data);
        });

    }

    var _remove = function (productId, callBack) {
        ninimour.http.authcget(ninimour.base.ctx + ninimour.base.vpath + '/wanna-list/remove-products?productIds=' + productId, {}, function (data) {
            ninimour.utils.arrayutil.removeObj(productId, _wishs);
            callBack(data);
        });
    }


    return {
        getWishs: _getwishs,
        ativeWishedBtns: _ativeWishedBtns,
        add: _add,
        remove: _remove
    };
})();

ninimour.subscribor = (function () {


    var _subscribe = function (email, callBack) {
        ninimour.http.get(ninimour.base.ctx + ninimour.base.vpath + '/subscription/anon', {email: email}, callBack);
    };

    return {
        indexSubscribe: function (email) {
            _subscribe(email, function (data) {
                alert('Thank you for subscribing! Enjoy shopping at Chiquedoll.');
            });
        },
        subscribe:_subscribe

    };


})();


$(function () {



    //init header height

    ninimour.element.headerHeight = $('#header').outerHeight();
    $('.x-header').height(ninimour.element.headerHeight);

    //init shoppingcart count
    ninimour.shoppingcartutil.notify();

    ninimour.wishlist.getWishs();

    $(document).on('click', '.ninimour-like-btn', function (event) {
        ninimour.event.stop(event);
        var $this = $(this), productId = $this.attr('product-id');
        if ($this.hasClass('liked')) {
            ninimour.wishlist.remove(productId, function () {
                $this.removeClass('liked');
                ninimour.apis.amazon.record('PRODUCT_CANCEL_SAVE' , {relatedId : productId});
            });
        } else {
            ninimour.wishlist.add(productId, function () {
                $this.addClass('liked');
                ninimour.apis.amazon.record('PRODUCT_SAVE' , {relatedId : productId});
            });
        }
    });


    var scrollTop = 0, scrollDirection = 'down';

    $(window).resize(function () {
        $('#nav').css({top: 0});
    });


    $(window).scroll(function () {
        var _scrollTop = $(window).scrollTop();
        if (_scrollTop > scrollTop) {
            scrollDirection = 'down';
        } else {
            scrollDirection = 'up';
        }

        var distance = _scrollTop - scrollTop;

        scrollTop = _scrollTop;

        var windowHeight = $(window).height();

        if($('#nav').length > 0){
            var nav_rect = $('#nav')[0].getBoundingClientRect();

            var navTop = $('#nav').position().top;

            var footerRect = $('#footer')[0].getBoundingClientRect();

            if (nav_rect.bottom > windowHeight || nav_rect.bottom + 30 > footerRect.top) {

                if (scrollDirection == 'up' && navTop >= 0) {
                    $('#nav').css({top: '0px'});
                } else {
                    $('#nav').css({top: '-=' + distance + 'px'});
                }


            } else {
                if (scrollDirection == 'up') {
                    if (navTop < 0) {
                        $('#nav').css({top: '-=' + distance + 'px'});
                    } else {
                        $('#nav').css({top: '0px'});
                    }

                }
            }
        }



    });


    $(document).click(function (event) {
        ninimour.event.getHideNodes().hide();
    });


    $('.currency').click(function (event) {
        ninimour.event.stop(event);
        ninimour.cookie.add('currency', $(this).data('currency'));
        window.location.reload(false);
    });

    $('#ninimour-currency').on('mouseover', function (event) {
        ninimour.event.stop(event);
        $('#ninimour-currencies').show();
    }).on('mouseout', function (event) {
        $('#ninimour-currencies').hide();
    });

    $(document).on('click', '#nini-list-controller span[data-count]', function () {
        var count = $(this).data('count');
        $('.nini-lists.controlable').attr('data-count', count);

        ninimour.cookie.add('datacount', count);
    });


    if (typeof ninilike != 'undefined') {

        var likeproducts = new ninimour.products({
            skip: 0,
            limit: 9,
            data: {},
            url: '/product/1/{skip}/{limit}/show',
            container: $('#ninimour-you-also-like'),
            isScroll: false,
            ignoreVersion: true
        });

        likeproducts.load();
    }


    $('#ninimour-sub-email-form').submit(function (e) {
        ninimour.event.stop(e);
        var email = $('#ninimour-sub-email').val();

        if (email) {
            ninimour.subscribor.indexSubscribe(email);
        }


    });

    $('#ninimour-sub-email').keyup(function () {
        if ($(this).val()) {
            $('#ninimour-sub-contaner').show();
        } else {
            $('#ninimour-sub-contaner').hide();
        }
    });

    $('.ninimour-policy').click(function (e) {
        ninimour.event.stop(e);
        $(this).parent().toggleClass('active');
    });


    if (ninimour.utils.urlparam) {
        var $policyPages = $('[data-policy]');

        $policyPages.each(function () {
            if ($(this).data('policy') == ninimour.utils.urlparam['page']) {
                $(this).parents('li').addClass('active');
            }
        });
    }


    $('#ninimour-cart-hover').hover(function (e) {
        $('#ninimour-header-cart').show();
    }, function (e) {
        $('#ninimour-header-cart').hide();
    });


//    $('a[data-id=' + ctgid + ']').addClass('selected').parents('.navli').addClass('active');

    setInterval(function(){

        if($('#ninimour-tool-tips li.animated').next().length <= 0){
            $('#ninimour-tool-tips li.animated').removeClass('animated');
            $('#ninimour-tool-tips li').first().addClass('animated');
        }else{
            $('#ninimour-tool-tips li.animated').removeClass('animated').next().addClass('animated');
        }

    } , 4000);




});

//apis
ninimour.apis = (function () {



    //facebook
    window.fbAsyncInit = function () {
        FB.init({
            appId: '1344501722239707',
            xfbml: true,
            version: 'v2.8'
        });
        FB.AppEvents.logPageView();
    };

    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));


    !function (f, b, e, v, n, t, s) {
        if (f.fbq)return;
        n = f.fbq = function () {
            n.callMethod ?
                n.callMethod.apply(n, arguments) : n.queue.push(arguments)
        };
        if (!f._fbq)f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s)
    }(window,
        document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', '371092496587580'); // Insert your pixel ID here.
    fbq('track', 'PageView');


    var _facebook_login = function (callBack) {
        FB.login(function (resp) {
            if (resp.status == 'connected') {
                callBack(resp.authResponse.userID, resp.authResponse.accessToken);
            }
        }, {
            scope: 'public_profile,email'
        });
    }


    var _face_share = function (cfg) {
        FB.ui({
            method: 'share',
            href: cfg.href,
            title: cfg.title,
            caption: 'http://www.chiquedoll.com',
            picture: cfg.picture,
            description: cfg.description
        }, function (response) {
            if (cfg.callBack) {
                cfg.callBack(response);
            }
        });
    }


    var facebook = {
        login: _facebook_login,
        share: _face_share,
        track: {
            addToCart: function (productId, price, currency) {
                fbq('track', 'AddToCart', {
                    content_ids: [productId],
                    content_type: 'product',
                    value: price,
                    currency: currency
                });
            },
            viewproduct: function (productId, price, currency) {
                fbq('track', 'ViewContent', {
                    content_type: 'product', //either 'product' or 'product_group'
                    content_ids: [productId], //array of one or more product ids in the page
                    value: price,    //OPTIONAL, but highly recommended
                    currency: currency //REQUIRED if you a pass value
                });
            },
            purechase: function (productIds, orderTotal, currency) {
                fbq('track', 'Purchase', {
                    content_type: 'product', //either 'product' or 'product_group'
                    content_ids: productIds, //array of one or more product ids in the page
                    value: orderTotal,
                    currency: currency //REQUIRED
                });
            }
        }
    };


    //pintrest
    var pintrest = {
        pin: function (cfg) {
            PinUtils.pinOne({
                'url': cfg.url,
                'media': cfg.media,
                'description': cfg.description
            });
        }
    };

    var amazon = {
        record: function (type, data) {
            data = data || {};

            data['currentPage'] = ninimour.base.currentpage;
            data['utm_source'] = ninimour.base.getUtmSource();
            data['utm_campaign'] = ninimour.base.getUtmCampaign();
            data['utm_medium'] = ninimour.base.getUtmMedium();
            var customer = ninimour.customer.get();
            if (customer) {
                data['customerId'] = customer.id;
            }
            data['frontPage'] = document.referrer;
            mobileAnalyticsClient.recordEvent(type, data);
        }
    };


    return {
        facebook: facebook,
        pintrest: pintrest,
        amazon:amazon
    };


})();


