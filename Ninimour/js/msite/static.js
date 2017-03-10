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


/*
 * jQuery FlexSlider v2.2.2
 * Copyright 2012 WooThemes
 * Contributing Author: Tyler Smith
 */
;
(function ($) {

    //FlexSlider: Object Instance
    $.flexslider = function (el, options) {
        var slider = $(el);

        // making variables public
        slider.vars = $.extend({}, $.flexslider.defaults, options);

        var namespace = slider.vars.namespace,
            msGesture = window.navigator && window.navigator.msPointerEnabled && window.MSGesture,
            touch = (( "ontouchstart" in window ) || msGesture || window.DocumentTouch && document instanceof DocumentTouch) && slider.vars.touch,
        // depricating this idea, as devices are being released with both of these events
        //eventType = (touch) ? "touchend" : "click",
            eventType = "click touchend MSPointerUp keyup",
            watchedEvent = "",
            watchedEventClearTimer,
            vertical = slider.vars.direction === "vertical",
            reverse = slider.vars.reverse,
            carousel = (slider.vars.itemWidth > 0),
            fade = slider.vars.animation === "fade",
            asNav = slider.vars.asNavFor !== "",
            methods = {},
            focused = true;

        // Store a reference to the slider object
        $.data(el, "flexslider", slider);

        // Private slider methods
        methods = {
            init: function () {
                slider.animating = false;
                // Get current slide and make sure it is a number
                slider.currentSlide = parseInt(( slider.vars.startAt ? slider.vars.startAt : 0), 10);
                if (isNaN(slider.currentSlide)) slider.currentSlide = 0;
                slider.animatingTo = slider.currentSlide;
                slider.atEnd = (slider.currentSlide === 0 || slider.currentSlide === slider.last);
                slider.containerSelector = slider.vars.selector.substr(0, slider.vars.selector.search(' '));
                slider.slides = $(slider.vars.selector, slider);
                slider.container = $(slider.containerSelector, slider);
                slider.count = slider.slides.length;
                // SYNC:
                slider.syncExists = $(slider.vars.sync).length > 0;
                // SLIDE:
                if (slider.vars.animation === "slide") slider.vars.animation = "swing";
                slider.prop = (vertical) ? "top" : "marginLeft";
                slider.args = {};
                // SLIDESHOW:
                slider.manualPause = false;
                slider.stopped = false;
                //PAUSE WHEN INVISIBLE
                slider.started = false;
                slider.startTimeout = null;
                // TOUCH/USECSS:
                slider.transitions = !slider.vars.video && !fade && slider.vars.useCSS && (function () {
                        var obj = document.createElement('div'),
                            props = ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'];
                        for (var i in props) {
                            if (obj.style[props[i]] !== undefined) {
                                slider.pfx = props[i].replace('Perspective', '').toLowerCase();
                                slider.prop = "-" + slider.pfx + "-transform";
                                return true;
                            }
                        }
                        return false;
                    }());
                slider.ensureAnimationEnd = '';
                // CONTROLSCONTAINER:
                if (slider.vars.controlsContainer !== "") slider.controlsContainer = $(slider.vars.controlsContainer).length > 0 && $(slider.vars.controlsContainer);
                // MANUAL:
                if (slider.vars.manualControls !== "") slider.manualControls = $(slider.vars.manualControls).length > 0 && $(slider.vars.manualControls);

                // RANDOMIZE:
                if (slider.vars.randomize) {
                    slider.slides.sort(function () {
                        return (Math.round(Math.random()) - 0.5);
                    });
                    slider.container.empty().append(slider.slides);
                }

                slider.doMath();

                // INIT
                slider.setup("init");

                // CONTROLNAV:
                if (slider.vars.controlNav) methods.controlNav.setup();

                // DIRECTIONNAV:
                if (slider.vars.directionNav) methods.directionNav.setup();

                // KEYBOARD:
                if (slider.vars.keyboard && ($(slider.containerSelector).length === 1 || slider.vars.multipleKeyboard)) {
                    $(document).bind('keyup', function (event) {
                        var keycode = event.keyCode;
                        if (!slider.animating && (keycode === 39 || keycode === 37)) {
                            var target = (keycode === 39) ? slider.getTarget('next') :
                                (keycode === 37) ? slider.getTarget('prev') : false;
                            slider.flexAnimate(target, slider.vars.pauseOnAction);
                        }
                    });
                }
                // MOUSEWHEEL:
                if (slider.vars.mousewheel) {
                    slider.bind('mousewheel', function (event, delta, deltaX, deltaY) {
                        event.preventDefault();
                        var target = (delta < 0) ? slider.getTarget('next') : slider.getTarget('prev');
                        slider.flexAnimate(target, slider.vars.pauseOnAction);
                    });
                }

                // PAUSEPLAY
                if (slider.vars.pausePlay) methods.pausePlay.setup();

                //PAUSE WHEN INVISIBLE
                if (slider.vars.slideshow && slider.vars.pauseInvisible) methods.pauseInvisible.init();

                // SLIDSESHOW
                if (slider.vars.slideshow) {
                    if (slider.vars.pauseOnHover) {
                        slider.hover(function () {
                            if (!slider.manualPlay && !slider.manualPause) slider.pause();
                        }, function () {
                            if (!slider.manualPause && !slider.manualPlay && !slider.stopped) slider.play();
                        });
                    }
                    // initialize animation
                    //If we're visible, or we don't use PageVisibility API
                    if (!slider.vars.pauseInvisible || !methods.pauseInvisible.isHidden()) {
                        (slider.vars.initDelay > 0) ? slider.startTimeout = setTimeout(slider.play, slider.vars.initDelay) : slider.play();
                    }
                }

                // ASNAV:
                if (asNav) methods.asNav.setup();

                // TOUCH
                if (touch && slider.vars.touch) methods.touch();

                // FADE&&SMOOTHHEIGHT || SLIDE:
                if (!fade || (fade && slider.vars.smoothHeight)) $(window).bind("resize orientationchange focus", methods.resize);

                slider.find("img").attr("draggable", "false");

                // API: start() Callback
                setTimeout(function () {
                    slider.vars.start(slider);
                }, 200);
            },
            asNav: {
                setup: function () {
                    slider.asNav = true;
                    slider.animatingTo = Math.floor(slider.currentSlide / slider.move);
                    slider.currentItem = slider.currentSlide;
                    slider.slides.removeClass(namespace + "active-slide").eq(slider.currentItem).addClass(namespace + "active-slide");
                    if (!msGesture) {
                        slider.slides.on(eventType, function (e) {
                            e.preventDefault();
                            var $slide = $(this),
                                target = $slide.index();
                            var posFromLeft = $slide.offset().left - $(slider).scrollLeft(); // Find position of slide relative to left of slider container
                            if (posFromLeft <= 0 && $slide.hasClass(namespace + 'active-slide')) {
                                slider.flexAnimate(slider.getTarget("prev"), true);
                            } else if (!$(slider.vars.asNavFor).data('flexslider').animating && !$slide.hasClass(namespace + "active-slide")) {
                                slider.direction = (slider.currentItem < target) ? "next" : "prev";
                                slider.flexAnimate(target, slider.vars.pauseOnAction, false, true, true);
                            }
                        });
                    } else {
                        el._slider = slider;
                        slider.slides.each(function () {
                            var that = this;
                            that._gesture = new MSGesture();
                            that._gesture.target = that;
                            that.addEventListener("MSPointerDown", function (e) {
                                e.preventDefault();
                                if (e.currentTarget._gesture)
                                    e.currentTarget._gesture.addPointer(e.pointerId);
                            }, false);
                            that.addEventListener("MSGestureTap", function (e) {
                                e.preventDefault();
                                var $slide = $(this),
                                    target = $slide.index();
                                if (!$(slider.vars.asNavFor).data('flexslider').animating && !$slide.hasClass('active')) {
                                    slider.direction = (slider.currentItem < target) ? "next" : "prev";
                                    slider.flexAnimate(target, slider.vars.pauseOnAction, false, true, true);
                                }
                            });
                        });
                    }
                }
            },
            controlNav: {
                setup: function () {
                    if (!slider.manualControls) {
                        methods.controlNav.setupPaging();
                    } else { // MANUALCONTROLS:
                        methods.controlNav.setupManual();
                    }
                },
                setupPaging: function () {
                    var type = (slider.vars.controlNav === "thumbnails") ? 'control-thumbs' : 'control-paging',
                        j = 1,
                        item,
                        slide;

                    slider.controlNavScaffold = $('<ol class="' + namespace + 'control-nav ' + namespace + type + '"></ol>');

                    if (slider.pagingCount > 1) {
                        for (var i = 0; i < slider.pagingCount; i++) {
                            slide = slider.slides.eq(i);
                            item = (slider.vars.controlNav === "thumbnails") ? '<img src="' + slide.attr('data-thumb') + '"/>' : '<a>' + j + '</a>';
                            if ('thumbnails' === slider.vars.controlNav && true === slider.vars.thumbCaptions) {
                                var captn = slide.attr('data-thumbcaption');
                                if ('' != captn && undefined != captn) item += '<span class="' + namespace + 'caption">' + captn + '</span>';
                            }
                            slider.controlNavScaffold.append('<li>' + item + '</li>');
                            j++;
                        }
                    }

                    // CONTROLSCONTAINER:
                    (slider.controlsContainer) ? $(slider.controlsContainer).append(slider.controlNavScaffold) : slider.append(slider.controlNavScaffold);
                    methods.controlNav.set();

                    methods.controlNav.active();

                    slider.controlNavScaffold.delegate('a, img', eventType, function (event) {
                        event.preventDefault();

                        if (watchedEvent === "" || watchedEvent === event.type) {
                            var $this = $(this),
                                target = slider.controlNav.index($this);

                            if (!$this.hasClass(namespace + 'active')) {
                                slider.direction = (target > slider.currentSlide) ? "next" : "prev";
                                slider.flexAnimate(target, slider.vars.pauseOnAction);
                            }
                        }

                        // setup flags to prevent event duplication
                        if (watchedEvent === "") {
                            watchedEvent = event.type;
                        }
                        methods.setToClearWatchedEvent();

                    });
                },
                setupManual: function () {
                    slider.controlNav = slider.manualControls;
                    methods.controlNav.active();

                    slider.controlNav.bind(eventType, function (event) {
                        event.preventDefault();

                        if (watchedEvent === "" || watchedEvent === event.type) {
                            var $this = $(this),
                                target = slider.controlNav.index($this);

                            if (!$this.hasClass(namespace + 'active')) {
                                (target > slider.currentSlide) ? slider.direction = "next" : slider.direction = "prev";
                                slider.flexAnimate(target, slider.vars.pauseOnAction);
                            }
                        }

                        // setup flags to prevent event duplication
                        if (watchedEvent === "") {
                            watchedEvent = event.type;
                        }
                        methods.setToClearWatchedEvent();
                    });
                },
                set: function () {
                    var selector = (slider.vars.controlNav === "thumbnails") ? 'img' : 'a';
                    slider.controlNav = $('.' + namespace + 'control-nav li ' + selector, (slider.controlsContainer) ? slider.controlsContainer : slider);
                },
                active: function () {
                    slider.controlNav.removeClass(namespace + "active").eq(slider.animatingTo).addClass(namespace + "active");
                },
                update: function (action, pos) {
                    if (slider.pagingCount > 1 && action === "add") {
                        slider.controlNavScaffold.append($('<li><a>' + slider.count + '</a></li>'));
                    } else if (slider.pagingCount === 1) {
                        slider.controlNavScaffold.find('li').remove();
                    } else {
                        slider.controlNav.eq(pos).closest('li').remove();
                    }
                    methods.controlNav.set();
                    (slider.pagingCount > 1 && slider.pagingCount !== slider.controlNav.length) ? slider.update(pos, action) : methods.controlNav.active();
                }
            },
            directionNav: {
                setup: function () {
                    var directionNavScaffold = $('<ul class="' + namespace + 'direction-nav"><li><a class="' + namespace + 'prev" href="#">' + slider.vars.prevText + '</a></li><li><a class="' + namespace + 'next" href="#">' + slider.vars.nextText + '</a></li></ul>');

                    // CONTROLSCONTAINER:
                    if (slider.controlsContainer) {
                        $(slider.controlsContainer).append(directionNavScaffold);
                        slider.directionNav = $('.' + namespace + 'direction-nav li a', slider.controlsContainer);
                    } else {
                        slider.append(directionNavScaffold);
                        slider.directionNav = $('.' + namespace + 'direction-nav li a', slider);
                    }

                    methods.directionNav.update();

                    slider.directionNav.bind(eventType, function (event) {
                        event.preventDefault();
                        var target;

                        if (watchedEvent === "" || watchedEvent === event.type) {
                            target = ($(this).hasClass(namespace + 'next')) ? slider.getTarget('next') : slider.getTarget('prev');
                            slider.flexAnimate(target, slider.vars.pauseOnAction);
                        }

                        // setup flags to prevent event duplication
                        if (watchedEvent === "") {
                            watchedEvent = event.type;
                        }
                        methods.setToClearWatchedEvent();
                    });
                },
                update: function () {
                    var disabledClass = namespace + 'disabled';
                    if (slider.pagingCount === 1) {
                        slider.directionNav.addClass(disabledClass).attr('tabindex', '-1');
                    } else if (!slider.vars.animationLoop) {
                        if (slider.animatingTo === 0) {
                            slider.directionNav.removeClass(disabledClass).filter('.' + namespace + "prev").addClass(disabledClass).attr('tabindex', '-1');
                        } else if (slider.animatingTo === slider.last) {
                            slider.directionNav.removeClass(disabledClass).filter('.' + namespace + "next").addClass(disabledClass).attr('tabindex', '-1');
                        } else {
                            slider.directionNav.removeClass(disabledClass).removeAttr('tabindex');
                        }
                    } else {
                        slider.directionNav.removeClass(disabledClass).removeAttr('tabindex');
                    }
                }
            },
            pausePlay: {
                setup: function () {
                    var pausePlayScaffold = $('<div class="' + namespace + 'pauseplay"><a></a></div>');

                    // CONTROLSCONTAINER:
                    if (slider.controlsContainer) {
                        slider.controlsContainer.append(pausePlayScaffold);
                        slider.pausePlay = $('.' + namespace + 'pauseplay a', slider.controlsContainer);
                    } else {
                        slider.append(pausePlayScaffold);
                        slider.pausePlay = $('.' + namespace + 'pauseplay a', slider);
                    }

                    methods.pausePlay.update((slider.vars.slideshow) ? namespace + 'pause' : namespace + 'play');

                    slider.pausePlay.bind(eventType, function (event) {
                        event.preventDefault();

                        if (watchedEvent === "" || watchedEvent === event.type) {
                            if ($(this).hasClass(namespace + 'pause')) {
                                slider.manualPause = true;
                                slider.manualPlay = false;
                                slider.pause();
                            } else {
                                slider.manualPause = false;
                                slider.manualPlay = true;
                                slider.play();
                            }
                        }

                        // setup flags to prevent event duplication
                        if (watchedEvent === "") {
                            watchedEvent = event.type;
                        }
                        methods.setToClearWatchedEvent();
                    });
                },
                update: function (state) {
                    (state === "play") ? slider.pausePlay.removeClass(namespace + 'pause').addClass(namespace + 'play').html(slider.vars.playText) : slider.pausePlay.removeClass(namespace + 'play').addClass(namespace + 'pause').html(slider.vars.pauseText);
                }
            },
            touch: function () {
                var startX,
                    startY,
                    offset,
                    cwidth,
                    dx,
                    startT,
                    scrolling = false,
                    localX = 0,
                    localY = 0,
                    accDx = 0;

                if (!msGesture) {
                    el.addEventListener('touchstart', onTouchStart, false);

                    function onTouchStart(e) {
                        if (slider.animating) {
                            e.preventDefault();
                        } else if (( window.navigator.msPointerEnabled ) || e.touches.length === 1) {
                            slider.pause();
                            // CAROUSEL:
                            cwidth = (vertical) ? slider.h : slider.w;
                            startT = Number(new Date());
                            // CAROUSEL:

                            // Local vars for X and Y points.
                            localX = e.touches[0].pageX;
                            localY = e.touches[0].pageY;

                            offset = (carousel && reverse && slider.animatingTo === slider.last) ? 0 :
                                (carousel && reverse) ? slider.limit - (((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo) :
                                    (carousel && slider.currentSlide === slider.last) ? slider.limit :
                                        (carousel) ? ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.currentSlide :
                                            (reverse) ? (slider.last - slider.currentSlide + slider.cloneOffset) * cwidth : (slider.currentSlide + slider.cloneOffset) * cwidth;
                            startX = (vertical) ? localY : localX;
                            startY = (vertical) ? localX : localY;

                            el.addEventListener('touchmove', onTouchMove, false);
                            el.addEventListener('touchend', onTouchEnd, false);
                        }
                    }

                    function onTouchMove(e) {
                        // Local vars for X and Y points.

                        localX = e.touches[0].pageX;
                        localY = e.touches[0].pageY;

                        dx = (vertical) ? startX - localY : startX - localX;
                        scrolling = (vertical) ? (Math.abs(dx) < Math.abs(localX - startY)) : (Math.abs(dx) < Math.abs(localY - startY));

                        var fxms = 500;

                        if (!scrolling || Number(new Date()) - startT > fxms) {
                            e.preventDefault();
                            if (!fade && slider.transitions) {
                                if (!slider.vars.animationLoop) {
                                    dx = dx / ((slider.currentSlide === 0 && dx < 0 || slider.currentSlide === slider.last && dx > 0) ? (Math.abs(dx) / cwidth + 2) : 1);
                                }
                                slider.setProps(offset + dx, "setTouch");
                            }
                        }
                    }

                    function onTouchEnd(e) {
                        // finish the touch by undoing the touch session
                        el.removeEventListener('touchmove', onTouchMove, false);

                        if (slider.animatingTo === slider.currentSlide && !scrolling && !(dx === null)) {
                            var updateDx = (reverse) ? -dx : dx,
                                target = (updateDx > 0) ? slider.getTarget('next') : slider.getTarget('prev');

                            if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(updateDx) > 50 || Math.abs(updateDx) > cwidth / 2)) {
                                slider.flexAnimate(target, slider.vars.pauseOnAction);
                            } else {
                                if (!fade) slider.flexAnimate(slider.currentSlide, slider.vars.pauseOnAction, true);
                            }
                        }
                        el.removeEventListener('touchend', onTouchEnd, false);

                        startX = null;
                        startY = null;
                        dx = null;
                        offset = null;
                    }
                } else {
                    el.style.msTouchAction = "none";
                    el._gesture = new MSGesture();
                    el._gesture.target = el;
                    el.addEventListener("MSPointerDown", onMSPointerDown, false);
                    el._slider = slider;
                    el.addEventListener("MSGestureChange", onMSGestureChange, false);
                    el.addEventListener("MSGestureEnd", onMSGestureEnd, false);

                    function onMSPointerDown(e) {
                        e.stopPropagation();
                        if (slider.animating) {
                            e.preventDefault();
                        } else {
                            slider.pause();
                            el._gesture.addPointer(e.pointerId);
                            accDx = 0;
                            cwidth = (vertical) ? slider.h : slider.w;
                            startT = Number(new Date());
                            // CAROUSEL:

                            offset = (carousel && reverse && slider.animatingTo === slider.last) ? 0 :
                                (carousel && reverse) ? slider.limit - (((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo) :
                                    (carousel && slider.currentSlide === slider.last) ? slider.limit :
                                        (carousel) ? ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.currentSlide :
                                            (reverse) ? (slider.last - slider.currentSlide + slider.cloneOffset) * cwidth : (slider.currentSlide + slider.cloneOffset) * cwidth;
                        }
                    }

                    function onMSGestureChange(e) {
                        e.stopPropagation();
                        var slider = e.target._slider;
                        if (!slider) {
                            return;
                        }
                        var transX = -e.translationX,
                            transY = -e.translationY;

                        //Accumulate translations.
                        accDx = accDx + ((vertical) ? transY : transX);
                        dx = accDx;
                        scrolling = (vertical) ? (Math.abs(accDx) < Math.abs(-transX)) : (Math.abs(accDx) < Math.abs(-transY));

                        if (e.detail === e.MSGESTURE_FLAG_INERTIA) {
                            setImmediate(function () {
                                el._gesture.stop();
                            });

                            return;
                        }

                        if (!scrolling || Number(new Date()) - startT > 500) {
                            e.preventDefault();
                            if (!fade && slider.transitions) {
                                if (!slider.vars.animationLoop) {
                                    dx = accDx / ((slider.currentSlide === 0 && accDx < 0 || slider.currentSlide === slider.last && accDx > 0) ? (Math.abs(accDx) / cwidth + 2) : 1);
                                }
                                slider.setProps(offset + dx, "setTouch");
                            }
                        }
                    }

                    function onMSGestureEnd(e) {
                        e.stopPropagation();
                        var slider = e.target._slider;
                        if (!slider) {
                            return;
                        }
                        if (slider.animatingTo === slider.currentSlide && !scrolling && !(dx === null)) {
                            var updateDx = (reverse) ? -dx : dx,
                                target = (updateDx > 0) ? slider.getTarget('next') : slider.getTarget('prev');

                            if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(updateDx) > 50 || Math.abs(updateDx) > cwidth / 2)) {
                                slider.flexAnimate(target, slider.vars.pauseOnAction);
                            } else {
                                if (!fade) slider.flexAnimate(slider.currentSlide, slider.vars.pauseOnAction, true);
                            }
                        }

                        startX = null;
                        startY = null;
                        dx = null;
                        offset = null;
                        accDx = 0;
                    }
                }
            },
            resize: function () {
                if (!slider.animating && slider.is(':visible')) {
                    if (!carousel) slider.doMath();

                    if (fade) {
                        // SMOOTH HEIGHT:
                        methods.smoothHeight();
                    } else if (carousel) { //CAROUSEL:
                        slider.slides.width(slider.computedW);
                        slider.update(slider.pagingCount);
                        slider.setProps();
                    }
                    else if (vertical) { //VERTICAL:
                        slider.viewport.height(slider.h);
                        slider.setProps(slider.h, "setTotal");
                    } else {
                        // SMOOTH HEIGHT:
                        if (slider.vars.smoothHeight) methods.smoothHeight();
                        slider.newSlides.width(slider.computedW);
                        slider.setProps(slider.computedW, "setTotal");
                    }
                }
            },
            smoothHeight: function (dur) {
                if (!vertical || fade) {
                    var $obj = (fade) ? slider : slider.viewport;
                    (dur) ? $obj.animate({"height": slider.slides.eq(slider.animatingTo).height()}, dur) : $obj.height(slider.slides.eq(slider.animatingTo).height());
                }
            },
            sync: function (action) {
                var $obj = $(slider.vars.sync).data("flexslider"),
                    target = slider.animatingTo;

                switch (action) {
                    case "animate":
                        $obj.flexAnimate(target, slider.vars.pauseOnAction, false, true);
                        break;
                    case "play":
                        if (!$obj.playing && !$obj.asNav) {
                            $obj.play();
                        }
                        break;
                    case "pause":
                        $obj.pause();
                        break;
                }
            },
            uniqueID: function ($clone) {
                // Append _clone to current level and children elements with id attributes
                $clone.filter('[id]').add($clone.find('[id]')).each(function () {
                    var $this = $(this);
                    $this.attr('id', $this.attr('id') + '_clone');
                });
                return $clone;
            },
            pauseInvisible: {
                visProp: null,
                init: function () {
                    var prefixes = ['webkit', 'moz', 'ms', 'o'];

                    if ('hidden' in document) return 'hidden';
                    for (var i = 0; i < prefixes.length; i++) {
                        if ((prefixes[i] + 'Hidden') in document)
                            methods.pauseInvisible.visProp = prefixes[i] + 'Hidden';
                    }
                    if (methods.pauseInvisible.visProp) {
                        var evtname = methods.pauseInvisible.visProp.replace(/[H|h]idden/, '') + 'visibilitychange';
                        document.addEventListener(evtname, function () {
                            if (methods.pauseInvisible.isHidden()) {
                                if (slider.startTimeout) clearTimeout(slider.startTimeout); //If clock is ticking, stop timer and prevent from starting while invisible
                                else slider.pause(); //Or just pause
                            }
                            else {
                                if (slider.started) slider.play(); //Initiated before, just play
                                else (slider.vars.initDelay > 0) ? setTimeout(slider.play, slider.vars.initDelay) : slider.play(); //Didn't init before: simply init or wait for it
                            }
                        });
                    }
                },
                isHidden: function () {
                    return document[methods.pauseInvisible.visProp] || false;
                }
            },
            setToClearWatchedEvent: function () {
                clearTimeout(watchedEventClearTimer);
                watchedEventClearTimer = setTimeout(function () {
                    watchedEvent = "";
                }, 3000);
            }
        };

        // public methods
        slider.flexAnimate = function (target, pause, override, withSync, fromNav) {
            if (!slider.vars.animationLoop && target !== slider.currentSlide) {
                slider.direction = (target > slider.currentSlide) ? "next" : "prev";
            }

            if (asNav && slider.pagingCount === 1) slider.direction = (slider.currentItem < target) ? "next" : "prev";

            if (!slider.animating && (slider.canAdvance(target, fromNav) || override) && slider.is(":visible")) {
                if (asNav && withSync) {
                    var master = $(slider.vars.asNavFor).data('flexslider');
                    slider.atEnd = target === 0 || target === slider.count - 1;
                    master.flexAnimate(target, true, false, true, fromNav);
                    slider.direction = (slider.currentItem < target) ? "next" : "prev";
                    master.direction = slider.direction;

                    if (Math.ceil((target + 1) / slider.visible) - 1 !== slider.currentSlide && target !== 0) {
                        slider.currentItem = target;
                        slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
                        target = Math.floor(target / slider.visible);
                    } else {
                        slider.currentItem = target;
                        slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
                        return false;
                    }
                }

                slider.animating = true;
                slider.animatingTo = target;

                // SLIDESHOW:
                if (pause) slider.pause();

                // API: before() animation Callback
                slider.vars.before(slider);

                // SYNC:
                if (slider.syncExists && !fromNav) methods.sync("animate");

                // CONTROLNAV
                if (slider.vars.controlNav) methods.controlNav.active();

                // !CAROUSEL:
                // CANDIDATE: slide active class (for add/remove slide)
                if (!carousel) slider.slides.removeClass(namespace + 'active-slide').eq(target).addClass(namespace + 'active-slide');

                // INFINITE LOOP:
                // CANDIDATE: atEnd
                slider.atEnd = target === 0 || target === slider.last;

                // DIRECTIONNAV:
                if (slider.vars.directionNav) methods.directionNav.update();

                if (target === slider.last) {
                    // API: end() of cycle Callback
                    slider.vars.end(slider);
                    // SLIDESHOW && !INFINITE LOOP:
                    if (!slider.vars.animationLoop) slider.pause();
                }

                // SLIDE:
                if (!fade) {
                    var dimension = (vertical) ? slider.slides.filter(':first').height() : slider.computedW,
                        margin, slideString, calcNext;

                    // INFINITE LOOP / REVERSE:
                    if (carousel) {
                        //margin = (slider.vars.itemWidth > slider.w) ? slider.vars.itemMargin * 2 : slider.vars.itemMargin;
                        margin = slider.vars.itemMargin;
                        calcNext = ((slider.itemW + margin) * slider.move) * slider.animatingTo;
                        slideString = (calcNext > slider.limit && slider.visible !== 1) ? slider.limit : calcNext;
                    } else if (slider.currentSlide === 0 && target === slider.count - 1 && slider.vars.animationLoop && slider.direction !== "next") {
                        slideString = (reverse) ? (slider.count + slider.cloneOffset) * dimension : 0;
                    } else if (slider.currentSlide === slider.last && target === 0 && slider.vars.animationLoop && slider.direction !== "prev") {
                        slideString = (reverse) ? 0 : (slider.count + 1) * dimension;
                    } else {
                        slideString = (reverse) ? ((slider.count - 1) - target + slider.cloneOffset) * dimension : (target + slider.cloneOffset) * dimension;
                    }
                    slider.setProps(slideString, "", slider.vars.animationSpeed);
                    if (slider.transitions) {
                        if (!slider.vars.animationLoop || !slider.atEnd) {
                            slider.animating = false;
                            slider.currentSlide = slider.animatingTo;
                        }

                        // Unbind previous transitionEnd events and re-bind new transitionEnd event
                        slider.container.unbind("webkitTransitionEnd transitionend");
                        slider.container.bind("webkitTransitionEnd transitionend", function () {
                            clearTimeout(slider.ensureAnimationEnd);
                            slider.wrapup(dimension);
                        });

                        // Insurance for the ever-so-fickle transitionEnd event
                        clearTimeout(slider.ensureAnimationEnd);
                        slider.ensureAnimationEnd = setTimeout(function () {
                            slider.wrapup(dimension);
                        }, slider.vars.animationSpeed + 100);

                    } else {
                        slider.container.animate(slider.args, slider.vars.animationSpeed, slider.vars.easing, function () {
                            slider.wrapup(dimension);
                        });
                    }
                } else { // FADE:
                    if (!touch) {
                        //slider.slides.eq(slider.currentSlide).fadeOut(slider.vars.animationSpeed, slider.vars.easing);
                        //slider.slides.eq(target).fadeIn(slider.vars.animationSpeed, slider.vars.easing, slider.wrapup);

                        slider.slides.eq(slider.currentSlide).css({"zIndex": 1}).animate({"opacity": 0}, slider.vars.animationSpeed, slider.vars.easing);
                        slider.slides.eq(target).css({"zIndex": 2}).animate({"opacity": 1}, slider.vars.animationSpeed, slider.vars.easing, slider.wrapup);

                    } else {
                        slider.slides.eq(slider.currentSlide).css({"opacity": 0, "zIndex": 1});
                        slider.slides.eq(target).css({"opacity": 1, "zIndex": 2});
                        slider.wrapup(dimension);
                    }
                }
                // SMOOTH HEIGHT:
                if (slider.vars.smoothHeight) methods.smoothHeight(slider.vars.animationSpeed);
            }
        };
        slider.wrapup = function (dimension) {
            // SLIDE:
            if (!fade && !carousel) {
                if (slider.currentSlide === 0 && slider.animatingTo === slider.last && slider.vars.animationLoop) {
                    slider.setProps(dimension, "jumpEnd");
                } else if (slider.currentSlide === slider.last && slider.animatingTo === 0 && slider.vars.animationLoop) {
                    slider.setProps(dimension, "jumpStart");
                }
            }
            slider.animating = false;
            slider.currentSlide = slider.animatingTo;
            // API: after() animation Callback
            slider.vars.after(slider);
        };

        // SLIDESHOW:
        slider.animateSlides = function () {
            if (!slider.animating && focused) slider.flexAnimate(slider.getTarget("next"));
        };
        // SLIDESHOW:
        slider.pause = function () {
            clearInterval(slider.animatedSlides);
            slider.animatedSlides = null;
            slider.playing = false;
            // PAUSEPLAY:
            if (slider.vars.pausePlay) methods.pausePlay.update("play");
            // SYNC:
            if (slider.syncExists) methods.sync("pause");
        };
        // SLIDESHOW:
        slider.play = function () {
            if (slider.playing) clearInterval(slider.animatedSlides);
            slider.animatedSlides = slider.animatedSlides || setInterval(slider.animateSlides, slider.vars.slideshowSpeed);
            slider.started = slider.playing = true;
            // PAUSEPLAY:
            if (slider.vars.pausePlay) methods.pausePlay.update("pause");
            // SYNC:
            if (slider.syncExists) methods.sync("play");
        };
        // STOP:
        slider.stop = function () {
            slider.pause();
            slider.stopped = true;
        };
        slider.canAdvance = function (target, fromNav) {
            // ASNAV:
            var last = (asNav) ? slider.pagingCount - 1 : slider.last;
            return (fromNav) ? true :
                (asNav && slider.currentItem === slider.count - 1 && target === 0 && slider.direction === "prev") ? true :
                    (asNav && slider.currentItem === 0 && target === slider.pagingCount - 1 && slider.direction !== "next") ? false :
                        (target === slider.currentSlide && !asNav) ? false :
                            (slider.vars.animationLoop) ? true :
                                (slider.atEnd && slider.currentSlide === 0 && target === last && slider.direction !== "next") ? false :
                                    (slider.atEnd && slider.currentSlide === last && target === 0 && slider.direction === "next") ? false :
                                        true;
        };
        slider.getTarget = function (dir) {
            slider.direction = dir;
            if (dir === "next") {
                return (slider.currentSlide === slider.last) ? 0 : slider.currentSlide + 1;
            } else {
                return (slider.currentSlide === 0) ? slider.last : slider.currentSlide - 1;
            }
        };

        // SLIDE:
        slider.setProps = function (pos, special, dur) {
            var target = (function () {
                var posCheck = (pos) ? pos : ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo,
                    posCalc = (function () {
                        if (carousel) {
                            return (special === "setTouch") ? pos :
                                (reverse && slider.animatingTo === slider.last) ? 0 :
                                    (reverse) ? slider.limit - (((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo) :
                                        (slider.animatingTo === slider.last) ? slider.limit : posCheck;
                        } else {
                            switch (special) {
                                case "setTotal":
                                    return (reverse) ? ((slider.count - 1) - slider.currentSlide + slider.cloneOffset) * pos : (slider.currentSlide + slider.cloneOffset) * pos;
                                case "setTouch":
                                    return (reverse) ? pos : pos;
                                case "jumpEnd":
                                    return (reverse) ? pos : slider.count * pos;
                                case "jumpStart":
                                    return (reverse) ? slider.count * pos : pos;
                                default:
                                    return pos;
                            }
                        }
                    }());

                return (posCalc * -1) + "px";
            }());

            if (slider.transitions) {
                target = (vertical) ? "translate3d(0," + target + ",0)" : "translate3d(" + target + ",0,0)";
                dur = (dur !== undefined) ? (dur / 1000) + "s" : "0s";
                slider.container.css("-" + slider.pfx + "-transition-duration", dur);
                slider.container.css("transition-duration", dur);
            }

            slider.args[slider.prop] = target;
            if (slider.transitions || dur === undefined) slider.container.css(slider.args);

            slider.container.css('transform', target);
        };

        slider.setup = function (type) {
            // SLIDE:
            if (!fade) {
                var sliderOffset, arr;

                if (type === "init") {
                    slider.viewport = $('<div class="' + namespace + 'viewport"></div>').css({
                        "overflow": "hidden",
                        "position": "relative"
                    }).appendTo(slider).append(slider.container);
                    // INFINITE LOOP:
                    slider.cloneCount = 0;
                    slider.cloneOffset = 0;
                    // REVERSE:
                    if (reverse) {
                        arr = $.makeArray(slider.slides).reverse();
                        slider.slides = $(arr);
                        slider.container.empty().append(slider.slides);
                    }
                }
                // INFINITE LOOP && !CAROUSEL:
                if (slider.vars.animationLoop && !carousel) {
                    slider.cloneCount = 2;
                    slider.cloneOffset = 1;
                    // clear out old clones
                    if (type !== "init") slider.container.find('.clone').remove();
                    slider.container.append(methods.uniqueID(slider.slides.first().clone().addClass('clone')).attr('aria-hidden', 'true'))
                        .prepend(methods.uniqueID(slider.slides.last().clone().addClass('clone')).attr('aria-hidden', 'true'));
                }
                slider.newSlides = $(slider.vars.selector, slider);

                sliderOffset = (reverse) ? slider.count - 1 - slider.currentSlide + slider.cloneOffset : slider.currentSlide + slider.cloneOffset;
                // VERTICAL:
                if (vertical && !carousel) {
                    slider.container.height((slider.count + slider.cloneCount) * 200 + "%").css("position", "absolute").width("100%");
                    setTimeout(function () {
                        slider.newSlides.css({"display": "block"});
                        slider.doMath();
                        slider.viewport.height(slider.h);
                        slider.setProps(sliderOffset * slider.h, "init");
                    }, (type === "init") ? 100 : 0);
                } else {
                    slider.container.width((slider.count + slider.cloneCount) * 200 + "%");
                    slider.setProps(sliderOffset * slider.computedW, "init");
                    setTimeout(function () {
                        slider.doMath();
                        slider.newSlides.css({"width": slider.computedW, "float": "left", "display": "block"});
                        // SMOOTH HEIGHT:
                        if (slider.vars.smoothHeight) methods.smoothHeight();
                    }, (type === "init") ? 100 : 0);
                }
            } else { // FADE:
                slider.slides.css({"width": "100%", "float": "left", "marginRight": "-100%", "position": "relative"});
                if (type === "init") {
                    if (!touch) {
                        //slider.slides.eq(slider.currentSlide).fadeIn(slider.vars.animationSpeed, slider.vars.easing);
                        if (slider.vars.fadeFirstSlide == false) {
                            slider.slides.css({
                                "opacity": 0,
                                "display": "block",
                                "zIndex": 1
                            }).eq(slider.currentSlide).css({"zIndex": 2}).css({"opacity": 1});
                        } else {
                            slider.slides.css({
                                "opacity": 0,
                                "display": "block",
                                "zIndex": 1
                            }).eq(slider.currentSlide).css({"zIndex": 2}).animate({"opacity": 1}, slider.vars.animationSpeed, slider.vars.easing);
                        }
                    } else {
                        slider.slides.css({
                            "opacity": 0,
                            "display": "block",
                            "webkitTransition": "opacity " + slider.vars.animationSpeed / 1000 + "s ease",
                            "zIndex": 1
                        }).eq(slider.currentSlide).css({"opacity": 1, "zIndex": 2});
                    }
                }
                // SMOOTH HEIGHT:
                if (slider.vars.smoothHeight) methods.smoothHeight();
            }
            // !CAROUSEL:
            // CANDIDATE: active slide
            if (!carousel) slider.slides.removeClass(namespace + "active-slide").eq(slider.currentSlide).addClass(namespace + "active-slide");

            //FlexSlider: init() Callback
            slider.vars.init(slider);
        };

        slider.doMath = function () {
            var slide = slider.slides.first(),
                slideMargin = slider.vars.itemMargin,
                minItems = slider.vars.minItems,
                maxItems = slider.vars.maxItems;

            slider.w = (slider.viewport === undefined) ? slider.width() : slider.viewport.width();
            slider.h = slide.height();
            slider.boxPadding = slide.outerWidth() - slide.width();

            // CAROUSEL:
            if (carousel) {
                slider.itemT = slider.vars.itemWidth + slideMargin;
                slider.minW = (minItems) ? minItems * slider.itemT : slider.w;
                slider.maxW = (maxItems) ? (maxItems * slider.itemT) - slideMargin : slider.w;
                slider.itemW = (slider.minW > slider.w) ? (slider.w - (slideMargin * (minItems - 1))) / minItems :
                    (slider.maxW < slider.w) ? (slider.w - (slideMargin * (maxItems - 1))) / maxItems :
                        (slider.vars.itemWidth > slider.w) ? slider.w : slider.vars.itemWidth;

                slider.visible = Math.floor(slider.w / (slider.itemW));
                slider.move = (slider.vars.move > 0 && slider.vars.move < slider.visible ) ? slider.vars.move : slider.visible;
                slider.pagingCount = Math.ceil(((slider.count - slider.visible) / slider.move) + 1);
                slider.last = slider.pagingCount - 1;
                slider.limit = (slider.pagingCount === 1) ? 0 :
                    (slider.vars.itemWidth > slider.w) ? (slider.itemW * (slider.count - 1)) + (slideMargin * (slider.count - 1)) : ((slider.itemW + slideMargin) * slider.count) - slider.w - slideMargin;
            } else {
                slider.itemW = slider.w;
                slider.pagingCount = slider.count;
                slider.last = slider.count - 1;
            }
            slider.computedW = slider.itemW - slider.boxPadding;
        };

        slider.update = function (pos, action) {
            slider.doMath();

            // update currentSlide and slider.animatingTo if necessary
            if (!carousel) {
                if (pos < slider.currentSlide) {
                    slider.currentSlide += 1;
                } else if (pos <= slider.currentSlide && pos !== 0) {
                    slider.currentSlide -= 1;
                }
                slider.animatingTo = slider.currentSlide;
            }

            // update controlNav
            if (slider.vars.controlNav && !slider.manualControls) {
                if ((action === "add" && !carousel) || slider.pagingCount > slider.controlNav.length) {
                    methods.controlNav.update("add");
                } else if ((action === "remove" && !carousel) || slider.pagingCount < slider.controlNav.length) {
                    if (carousel && slider.currentSlide > slider.last) {
                        slider.currentSlide -= 1;
                        slider.animatingTo -= 1;
                    }
                    methods.controlNav.update("remove", slider.last);
                }
            }
            // update directionNav
            if (slider.vars.directionNav) methods.directionNav.update();

        };

        slider.addSlide = function (obj, pos) {
            var $obj = $(obj);

            slider.count += 1;
            slider.last = slider.count - 1;

            // append new slide
            if (vertical && reverse) {
                (pos !== undefined) ? slider.slides.eq(slider.count - pos).after($obj) : slider.container.prepend($obj);
            } else {
                (pos !== undefined) ? slider.slides.eq(pos).before($obj) : slider.container.append($obj);
            }

            // update currentSlide, animatingTo, controlNav, and directionNav
            slider.update(pos, "add");

            // update slider.slides
            slider.slides = $(slider.vars.selector + ':not(.clone)', slider);
            // re-setup the slider to accomdate new slide
            slider.setup();

            //FlexSlider: added() Callback
            slider.vars.added(slider);
        };
        slider.removeSlide = function (obj) {
            var pos = (isNaN(obj)) ? slider.slides.index($(obj)) : obj;

            // update count
            slider.count -= 1;
            slider.last = slider.count - 1;

            // remove slide
            if (isNaN(obj)) {
                $(obj, slider.slides).remove();
            } else {
                (vertical && reverse) ? slider.slides.eq(slider.last).remove() : slider.slides.eq(obj).remove();
            }

            // update currentSlide, animatingTo, controlNav, and directionNav
            slider.doMath();
            slider.update(pos, "remove");

            // update slider.slides
            slider.slides = $(slider.vars.selector + ':not(.clone)', slider);
            // re-setup the slider to accomdate new slide
            slider.setup();

            // FlexSlider: removed() Callback
            slider.vars.removed(slider);
        };

        //FlexSlider: Initialize
        methods.init();
    };

    // Ensure the slider isn't focussed if the window loses focus.
    $(window).blur(function (e) {
        focused = false;
    }).focus(function (e) {
        focused = true;
    });

    //FlexSlider: Default Settings
    $.flexslider.defaults = {
        namespace: "flex-",             //{NEW} String: Prefix string attached to the class of every element generated by the plugin
        selector: ".slides > li",       //{NEW} Selector: Must match a simple pattern. '{container} > {slide}' -- Ignore pattern at your own peril
        animation: "fade",              //String: Select your animation type, "fade" or "slide"
        easing: "swing",                //{NEW} String: Determines the easing method used in jQuery transitions. jQuery easing plugin is supported!
        direction: "horizontal",        //String: Select the sliding direction, "horizontal" or "vertical"
        reverse: false,                 //{NEW} Boolean: Reverse the animation direction
        animationLoop: true,            //Boolean: Should the animation loop? If false, directionNav will received "disable" classes at either end
        smoothHeight: false,            //{NEW} Boolean: Allow height of the slider to animate smoothly in horizontal mode
        startAt: 0,                     //Integer: The slide that the slider should start on. Array notation (0 = first slide)
        slideshow: true,                //Boolean: Animate slider automatically
        slideshowSpeed: 7000,           //Integer: Set the speed of the slideshow cycling, in milliseconds
        animationSpeed: 600,            //Integer: Set the speed of animations, in milliseconds
        initDelay: 0,                   //{NEW} Integer: Set an initialization delay, in milliseconds
        randomize: false,               //Boolean: Randomize slide order
        fadeFirstSlide: true,           //Boolean: Fade in the first slide when animation type is "fade"
        thumbCaptions: false,           //Boolean: Whether or not to put captions on thumbnails when using the "thumbnails" controlNav.

        // Usability features
        pauseOnAction: true,            //Boolean: Pause the slideshow when interacting with control elements, highly recommended.
        pauseOnHover: false,            //Boolean: Pause the slideshow when hovering over slider, then resume when no longer hovering
        pauseInvisible: true,   		//{NEW} Boolean: Pause the slideshow when tab is invisible, resume when visible. Provides better UX, lower CPU usage.
        useCSS: true,                   //{NEW} Boolean: Slider will use CSS3 transitions if available
        touch: true,                    //{NEW} Boolean: Allow touch swipe navigation of the slider on touch-enabled devices
        video: false,                   //{NEW} Boolean: If using video in the slider, will prevent CSS3 3D Transforms to avoid graphical glitches

        // Primary Controls
        controlNav: true,               //Boolean: Create navigation for paging control of each slide? Note: Leave true for manualControls usage
        directionNav: true,             //Boolean: Create navigation for previous/next navigation? (true/false)
        prevText: "Previous",           //String: Set the text for the "previous" directionNav item
        nextText: "Next",               //String: Set the text for the "next" directionNav item

        // Secondary Navigation
        keyboard: true,                 //Boolean: Allow slider navigating via keyboard left/right keys
        multipleKeyboard: false,        //{NEW} Boolean: Allow keyboard navigation to affect multiple sliders. Default behavior cuts out keyboard navigation with more than one slider present.
        mousewheel: false,              //{UPDATED} Boolean: Requires jquery.mousewheel.js (https://github.com/brandonaaron/jquery-mousewheel) - Allows slider navigating via mousewheel
        pausePlay: false,               //Boolean: Create pause/play dynamic element
        pauseText: "Pause",             //String: Set the text for the "pause" pausePlay item
        playText: "Play",               //String: Set the text for the "play" pausePlay item

        // Special properties
        controlsContainer: "",          //{UPDATED} jQuery Object/Selector: Declare which container the navigation elements should be appended too. Default container is the FlexSlider element. Example use would be $(".flexslider-container"). Property is ignored if given element is not found.
        manualControls: "",             //{UPDATED} jQuery Object/Selector: Declare custom control navigation. Examples would be $(".flex-control-nav li") or "#tabs-nav li img", etc. The number of elements in your controlNav should match the number of slides/tabs.
        sync: "",                       //{NEW} Selector: Mirror the actions performed on this slider with another slider. Use with care.
        asNavFor: "",                   //{NEW} Selector: Internal property exposed for turning the slider into a thumbnail navigation for another slider

        // Carousel Options
        itemWidth: 0,                   //{NEW} Integer: Box-model width of individual carousel items, including horizontal borders and padding.
        itemMargin: 0,                  //{NEW} Integer: Margin between carousel items.
        minItems: 1,                    //{NEW} Integer: Minimum number of carousel items that should be visible. Items will resize fluidly when below this.
        maxItems: 0,                    //{NEW} Integer: Maxmimum number of carousel items that should be visible. Items will resize fluidly when above this limit.
        move: 0,                        //{NEW} Integer: Number of carousel items that should move on animation. If 0, slider will move all visible items.
        allowOneSlide: true,           //{NEW} Boolean: Whether or not to allow a slider comprised of a single slide

        // Callback API
        start: function () {
        },            //Callback: function(slider) - Fires when the slider loads the first slide
        before: function () {
        },           //Callback: function(slider) - Fires asynchronously with each slider animation
        after: function () {
        },            //Callback: function(slider) - Fires after each slider animation completes
        end: function () {
        },              //Callback: function(slider) - Fires when the slider reaches the last slide (asynchronous)
        added: function () {
        },            //{NEW} Callback: function(slider) - Fires after a slide is added
        removed: function () {
        },           //{NEW} Callback: function(slider) - Fires after a slide is removed
        init: function () {
        }             //{NEW} Callback: function(slider) - Fires after the slider is initially setup
    };

    //FlexSlider: Plugin Function
    $.fn.flexslider = function (options) {
        if (options === undefined) options = {};

        if (typeof options === "object") {
            return this.each(function () {
                var $this = $(this),
                    selector = (options.selector) ? options.selector : ".slides > li",
                    $slides = $this.find(selector);

                if (( $slides.length === 1 && options.allowOneSlide === true ) || $slides.length === 0) {
                    $slides.fadeIn(400);
                    if (options.start) options.start($this);
                } else if ($this.data('flexslider') === undefined) {
                    new $.flexslider(this, options);
                }
            });
        } else {
            // Helper strings to quickly perform functions on the slider
            var $slider = $(this).data('flexslider');
            switch (options) {
                case "play":
                    $slider.play();
                    break;
                case "pause":
                    $slider.pause();
                    break;
                case "stop":
                    $slider.stop();
                    break;
                case "next":
                    $slider.flexAnimate($slider.getTarget("next"), true);
                    break;
                case "prev":
                case "previous":
                    $slider.flexAnimate($slider.getTarget("prev"), true);
                    break;
                default:
                    if (typeof options === "number") $slider.flexAnimate(options, true);
            }
        }
    };
})(jQuery);


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
ninimour['extends'] = function (c, p) {
    c.prototype = new p;
    c.constructor = c;
};

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

    var _utm_source = typeof(utm_source) != 'undefined' && utm_source || '';
    var _utm_campaign = typeof(utm_campaign) != 'undefined' && utm_campaign || '';
    var _utm_medium = typeof(utm_medium) != 'undefined' && utm_medium || '';


    return {
        version: 'v7',
        vpath: '/v7',
        appVersion: '3.2.0',
        deviceType: 'pc',
        defaultDomain: 'chiquedoll.com',
        ctx: _ctx,
        currency: _currency,
        currentpage: _currentpage,
        utm_source: _utm_source,
        utm_campaign: _utm_campaign,
        utm_medium: _utm_medium,
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
                return money.unit + (money.amount * quantity);
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

    var _createBtns = function (type, config) {
        if (type == 'confirm') {
            var okbtn = config && config.okbtn ? config.okbtn : 'Yes';
            var nobtn = config && config.nobtn ? config.nobtn : 'No';
            return '<span id="nobtn" class="x-btn">' + nobtn + '</span><span id="okbtn" class="x-btn active">' + okbtn + '</span>';
        } else {
            var okbtn = config && config.okbtn ? config.okbtn : 'Ok';
            return '<span id="alertokbtn" class="x-btn active">' + okbtn + '</span>';
        }
    }

    var _createShow = function (type, title, message, config) {
        var uuid = ninimour.utils.getUUID();
        var html = [
            '<div class="x-alert-window" id="window-' + uuid + '">',
            '   <div class="hd">',
            '       <span class="title">' + (title ? title : 'Chiquedoll') + '</span>',
            '       <span class="close"></span>',
            '   </div>',
            '   <div class="bd">',
            '       <p class="message">' + message + '</p>',
            '   </div>',
            '   <div class="fd">',
            _createBtns(type, config),
            '   </div>',
            '</div>'
        ].join('');

        $('body').append(html);
        $('#window-'+uuid).on('click','.close , #alertokbtn',function(event){
            ninimour.event.stop(event);
            ninimour.fixedwindow.close($('#window-'+uuid));
            $('#window-'+uuid).off().remove();
        });
        $('#window-'+uuid).on('click','#okbtn',function(event){
            ninimour.event.stop(event);
            ninimour.fixedwindow.close($('#window-'+uuid));
            $('#window-'+uuid).off().remove();
            if(config.ok)
                config.ok();
        });

        $('#window-'+uuid).on('click','#nobtn',function(event){
            ninimour.event.stop(event);
            ninimour.fixedwindow.close($('#window-'+uuid));
            $('#window-'+uuid).off().remove();
            if(config.no)
                config.no();
        });
        ninimour.fixedwindow.open($('#window-'+uuid));
    }


    return {
        alert: function (title, message , config) {
            _createShow('alert' , title , message , config);
        },
        confirm: function (title, message , config) {
            _createShow('confirm' , title , message , config);
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
        getPrefixProductUrl: function (product) {
            return _concat('product', _url_analyst(product.name), product.parentSku, product.id + '.html');
        },
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
//        var language = navigator.language;
//        if (language && language.indexOf("-") >= 0) {
//            var keys = language.split("-");
//            if (keys.length <= 1)
//                return "US";
//            return keys[1].toUpperCase();
//        }
//        return "US";
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
        },

        up: function ($window) {
            $('html , body').css({'overflow-y': 'hidden'});
            $window.addClass('active');
            _createMask();
        },
        onlyDown: function ($window) {
            $('html , body').css({'overflow-y': 'auto'});
            $window.removeClass('active');
            _hideMask();
        },
        down: function ($window) {
            $('html , body').css({'overflow-y': 'auto'});
            $window.removeClass('active');
            _hideMask();
            setTimeout(function () {
                $window.remove();
                $window.off();
            }, 500);
        }
    };
})();


ninimour.element = (function () {
    return {
        headerHeight: 50,
        getHeaderHeight: function () {
            return $('#ninimour-header').height() + $('#ninimour-header-tip').height();
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

    var _loadGroupProducts = function (groupId, callBack) {
        ninimour.http.loadingGet(ninimour.base.ctx + ninimour.base.vpath + '/product/anon/' + groupId + '/get-group-products', {}, callBack);
    }

    var _loadproduct = function (productId, callBack) {
        ninimour.http.loadingGet(ninimour.base.ctx + ninimour.base.vpath + '/product/' + productId + '/get', {}, callBack);
    }


    var _getSelectedProduct = function (productId, products) {
        for (var i = 0, len = products.length; i < len; i++) {
            if (productId == products[i].id)
                return products[i];
        }
        return null;
    }

    var _getSelectedVariant = function (variantId, variants) {
        for (var i = 0, len = variants.length; i < len; i++) {
            if (variantId == variants[i].id)
                return variants[i];
        }
        return null;
    }


    var _getPriceBannel = function (product) {
        var lowerprice = ninimour.productutil.price.getLowerPrice(product);
        var deleteprice = ninimour.productutil.price.getDeletePrice(product);
        var percent = ninimour.productutil.price.getPercent(product);

        var html = [];
        html.push('<span class="real-price">' + ninimour.utils.moneyutil.getUnitPrice(lowerprice) + '</span>');
        if (deleteprice) {
            html.push('<del class="delete-price">' + ninimour.utils.moneyutil.getUnitPrice(lowerprice) + '</del>');
        }

        if (percent > 0) {
            html.push('<span class="x-percent">' + percent + '% OFF</span>');
        }

        return html.join('');

    }

    var _createsizes = function (product) {
        var variants = product.variants, html = [];
        if (!!!variants || variants.length < 1 || variants.length == 1 && !!!variants[0].size) {
            return '';
        } else {
            html.push('<div class="xq-block">');
            html.push('	<div class="hd">');
            html.push('		<h3>Size</h3>');
            html.push('	</div>');
            html.push('	<div class="bd">');
            html.push('		<ul class="elements" id="ninimour-variant-sizes">');
            for (var i = 0, len = variants.length; i < len; i++) {
                html.push(
                    [
                        '<li>',
                        '   <span class="small-size ninimour-quick-size" data-variant="' + variants[i].id + '" data-size="' + variants[i].size + '">' + variants[i].size + '</span>',
                        '</li>'
                    ].join('')
                );
            }
            html.push('		</ul>');
            html.push('		<p class="p-size-color-msg x-hide" id="ninimour-variant-w-msg"></p>');
            html.push('	</div>');
            html.push('</div>');
            return html.join('');
        }

    }

    var _createBuyerDom = function (productId, groupProducts) {

        var product = _getSelectedProduct(productId, groupProducts);
        var _createcolors = function () {
            var html = [];
            for (var i = 0, len = groupProducts.length; i < len; i++) {
                html.push([
                    '<li>',
                    '    <span data-product="' + groupProducts[i].id + '" class="small-image ' + (productId == groupProducts[i].id ? 'active' : '' ) + ' ninimour-variant-s-image">',
                    '       <img src="https://dgzfssf1la12s.cloudfront.net/large/' + groupProducts[i].pcMainImage + '">',
                    '    </span>',
                    '</li>'
                ].join(''));
            }
            return html.join('');
        }


        var html = [
            '<div class="x-quick-buy" id="ninimour-quick-buy">',
            '   <div class="hd">',
            '       <div class="x-cell x-v-middle"><h3>Product Options</h3></div>',
            '       <div class="x-cell x-v-middle x-text-right"><span class="cancel">Cancel</span></div>',
            '   </div>',
            '   <div class="x-buy-tools">',
            '       <div class="x-product-area">',
            '           <div class="infos">',
            '               <div>',
            '                   <img id="ninimour-variant-image" src="https://dgzfssf1la12s.cloudfront.net/medium/' + product.pcMainImage + '">',
            '               </div>',
            '               <div>',
            '                   <div>',
            '                       <p id="ninimour-variant-name" class="x-i-name">' + product.name + '</p>',
            '                       <div id="ninimour-variant-prices" class="prices">',
            _getPriceBannel(product),
            '                       </div>',
            '                   </div>',
            '               </div>',
            '           </div>',
            '			<div><p id="ninimour-variant-w-domest" style="background-color:transparent;" class="p-size-color-msg x-hide"></p></div>',
            '       </div>',
            '		<div style="padding:0 10px;">',
            '       <div class="xq-block">',
            '           <div class="hd">',
            '               <h3>Color</h3>',
            '           </div>',
            '           <div class="bd">',
            '               <ul class="elements">',
            _createcolors(),
            '               </ul>',
            '				<p class="p-size-color-msg" id="ninimour-size-color-msg">You selected ' + (product.variants[0].color) + '.</p>',
            '           </div>',
            '       </div>',
            '		<div id="ninimour-w-sizes-wrapper">',
            _createsizes(product),
            '		</div>',
            '       <div class="xq-block">',
            '           <div class="hd">',
            '               <h3>Qty.</h3>',
            '           </div>',
            '           <div class="bd">',
            '               <span class="x-quantity-editor">',
            '                   <span id="w-reduce" class="x-reduce">-</span>',
            '                   <input id="w-quantity" class="x-value" type="number" value="1">',
            '                   <span id="w-add" class="x-add">+</span>',
            '               </span>',
            '           </div>',
            '       </div>',
            '		</div>',
            '        <div class="xq-buy x-btn active" id="ninimour-quick-to-bag">Add to Cart</div>',
            '   </div>',
            '</div>'
        ].join('');


        return html;
    }


    var _refresh = function (productId, groupProducts) {
        var product = _getSelectedProduct(productId, groupProducts);
        $('#ninimour-quick-buy #ninimour-variant-image').attr('src', ninimour.base.getMediumImage(product.pcMainImage, '/'));
        $('#ninimour-quick-buy #ninimour-variant-name').text(product.name);
        $('#ninimour-quick-buy #ninimour-variant-prices').html(_getPriceBannel(product));
        $('#ninimour-quick-buy #ninimour-w-sizes-wrapper').html(_createsizes(product));
        $('#ninimour-quick-buy #ninimour-size-color-msg').html(product.variants[0].color);
        $('#ninimour-quick-buy #ninimour-variant-w-msg').html('').hide();
        $('#ninimour-quick-buy #ninimour-variant-w-domest').html('').hide();


    }

    var _createBuyer = function (productId, groupId , incart , config) {
        if (!!!productId || !!!groupId)
            return;
        _loadGroupProducts(groupId, function (data) {
            var groupProducts = data.result;
            var html = _createBuyerDom(productId, groupProducts);
            var xmask = '<div id="ninimour-buyer-mask" class="x-mask"></div>';
            $('body').append(html, xmask);
            $('#ninimour-quick-buy').animate({
                bottom: '0'
            }, 'fast');

            var product = _getSelectedProduct(productId, groupProducts);

            $('#ninimour-quick-buy').on('click', '.cancel', function (event) {
                ninimour.event.stop(event);
                $('#ninimour-quick-buy').animate({
                    bottom: '-500px'
                }, 'fast', 'linear', function () {
                    $('#ninimour-quick-buy').remove();
                    $('#ninimour-buyer-mask').remove();
                });
            });

            $('#ninimour-quick-buy').on('click', '.ninimour-variant-s-image', function (event) {
                ninimour.event.stop(event);
                $('#ninimour-quick-buy .ninimour-variant-s-image').removeClass('active');
                var productId = $(this).data('product');
                _refresh(productId, groupProducts);
                $(this).addClass('active');
            });

            $('#ninimour-quick-buy').on('click', '#w-add', function (event) {
                ninimour.event.stop(event);
                var q = $('#w-quantity').val();
                if (!isNaN(q)) {
                    q++;
                } else {
                    q = 1;
                }
                $('#w-quantity').val(q);
            });


            $('#ninimour-quick-buy').on('click', '#w-reduce', function (event) {
                ninimour.event.stop(event);
                var q = $('#w-quantity').val();
                if (!isNaN(q) && q > 1) {
                    q--;
                } else {
                    q = 1;
                }
                $('#w-quantity').val(q);
            });

            $('#ninimour-quick-buy').on('click', '.ninimour-quick-size', function (event) {
                ninimour.event.stop(event);
                $('#ninimour-quick-buy .ninimour-quick-size').removeClass('active');
                $(this).addClass('active');
                var product = _getSelectedProduct(productId, groupProducts);
                if (product && product.variants && product.variants.length > 0) {
                    var selectedVariant = _getSelectedVariant($(this).data('variant'), product.variants);
                    if (selectedVariant && selectedVariant.description) {
                        $('#ninimour-quick-buy #ninimour-variant-w-msg').html(selectedVariant.description).show();
                    } else {
                        $('#ninimour-quick-buy #ninimour-variant-w-msg').html('').hide();
                    }


                    if(selectedVariant.domesticDelivery && selectedVariant.domesticDelivery.enabled && selectedVariant.domesticDelivery.message){
                        $('#ninimour-quick-buy #ninimour-variant-w-domest').html(selectedVariant.domesticDelivery.message).show();
                    }else{
                        $('#ninimour-quick-buy #ninimour-variant-w-domest').html('').hide();
                    }


                    return;
                }

                $('#ninimour-quick-buy #ninimour-variant-w-msg').html('').hide();
            });


            $('#ninimour-quick-buy').on('click', '#ninimour-quick-to-bag', function (event) {
                ninimour.event.stop(event);
                var $sizeSelect = $('#ninimour-quick-buy .ninimour-quick-size.active'), $allsizes = $('#ninimour-quick-buy .ninimour-quick-size');
                if ($sizeSelect.length > 0 || $allsizes == 0) {

                    if (!!!product)
                        return;

                    if ($allsizes == 0) {
                        variantId = product.variants[0].id;
                    } else {
                        variantId = $sizeSelect.data('variant');
                    }


                    var quantity = $('#w-quantity').val();

                    if (isNaN(quantity) || quantity < 1) {
                        quantity = 1;
                    }

                    var variant = ninimour.productutil.getVariant(variantId , product.variants);

                    if(!variant)
                        return;



                    if(incart){


                        ninimour.http.loadingGet(ninimour.base.ctx + ninimour.base.vpath + '/shopping-cart/'+config.oldVariantId+'/'+variantId+'/'+quantity+'/change-product' , {} , function(data){
                            config.callBack(data);
                            $('#ninimour-quick-buy').off().remove();
                            $('#ninimour-buyer-mask').remove();
                        } , function(data){
                            ninimour.show.alert(data.result);
                        });



                    }else{
                        ninimour.http.loadingGet(ninimour.base.ctx + ninimour.base.vpath + '/shopping-cart/add-product', {
                            variantId: variantId,
                            quantity: quantity,
                            unifiedId: variant.unifiedId,
                            warehouseId: variant.domesticDelivery ? variant.domesticDelivery.warehouseId : null,
                            shippedCountryCode: variant.domesticDelivery ? variant.domesticDelivery.countryCode : null
                        }, function (data) {
                            ninimour.shoppingcartutil.notify(true);
                            $('#ninimour-quick-buy').animate({
                                bottom: '-500px'
                            }, 'fast', 'linear', function () {
                                $('#ninimour-quick-buy').off().remove();
                                $('#ninimour-buyer-mask').remove();
                            });

                            var lowerprice = ninimour.productutil.price.getLowerPrice(product);
                            ninimour.apis.amazon.record('ADD_TO_CART_LATER' , {relatedId : variantId , money : lowerprice.amount , unit: lowerprice.unit , quantity : quantity});

                        });


                        try {
                            ninimour.apis.facebook.track.addToCart(product.id, _getLowerPrice(product), ninimour.base.currency);
                        } catch (e) {
                            console.error(e);
                        }
                    }





                } else {
                    alert('Size is required!');
                }
            });

        });
    }


    return {
        promotion: {
            isPromotion: _isPromotion
        },
        price: {
            getLowerPrice: _getLowerPrice,
            getDeletePrice: _getDeletePrice,
            getPercent: _getPercent,
        },
        getVariant:_getSelectedVariant,
        buyer: {
            createBuyer: _createBuyer
        }
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

        // if (percent > 0) {
        //     html.push('<span class="x-percent">' + percent + '% OFF</span>');
        // }

        return html.join('');

    }

    var getPercentHtml = function (product) {
        var percent = ninimour.productutil.price.getPercent(product);
        if (percent > 0) {
            return '			<span class="off">' + percent + '% OFF</span>';
        }
        return '';
    }


    var _createProduct = function (product) {
        var productDom = [
            '<li class="x-product">',
            '   <a data-product="' + product.id + '" href="' + ninimour.url.getProductUrl(product) + '" title="' + product.name + '">',
            '       <figure class="x-image-area">',
            '           <img src="https://dgzfssf1la12s.cloudfront.net/medium/' + product.pcMainImage + '">',
            getPercentHtml(product),
            '       </figure>',
            '       <figcaption class="x-product-caption">',
            '           <div class="x-product-name">',
            product.name,
            '           </div>',
            '           <div class="x-product-prices">',
            _getPriceBannel(product),
            '           </div>',
            '       </figcaption>',
            '   </a>',
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

    var _filterProducts = function (_url, _data, callBack) {
        var html = [];
        ninimour.http.request(_url, JSON.stringify(_data), function (data) {
            var products = data.result;
            if (products && products.length > 0) {
                for (var i = 0, len = products.length; i < len; i++) {
                    html.push(_createProduct(products[i]));
                }
            }
            callBack(html.join(''));
        });
    };


    var _instance = Event.extend({
        init: function (config) {
            this._config = config || {};
            var loaded = true;
            var self = this;

            if (this._config['isScroll']) {

                var $scroller = this._config['scroller'] || $(window), self = this;

                $scroller.scroll(function (event) {
                    ninimour.event.stop(event);
                    var scrollTop = $(window).scrollTop(),
                        scrollHeight = $(document).height(),
                        windowHeight = $(window).height();
                    if (scrollTop + windowHeight >= scrollHeight - 300) {
                        if (self._config['isFilter']) {
                            self.request();
                        } else {
                            self.load();
                        }
                    }

                });
            }


            if (this._config['viewMore']) {
                var $btn = this._config['moreBtn'];
                if (!!!$btn || $btn.length < 0) {
                    return;
                }
                $btn.on('click', function (event) {
                    ninimour.event.stop(event);
                    self.load();
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
                    if (self._config['moreBtn']) {
                        self._config['moreBtn'].hide();
                    }

                    var _container = self._config['container'] || $('body');

                    var listloadingId = _container.attr('id') + '-list-loading';

                    _container.parent().append('<div id="' + listloadingId + '" class="x-list-loading"><span class="x-loading"><span></span><span></span><span></span></span></div>');

                    _requestProducts(prefix + _getLimitUrl(self._config.url, self._config.skip, self._config.limit), self._config.data, function (html) {
                        $('#' + listloadingId).remove();
                        _container.append(html);
                        if (!!!html || html.length <= 0) {
                            return;
                        }
                        self.fire('listingrefresh', self._config.skip, self._config.limit);
                        loaded = true;
                        self._config.skip += self._config.limit;
                        if (self._config['moreBtn']) {
                            self._config['moreBtn'].show();
                        }
                    }, self._config.isFlash);
                }
            };

            this.request = function () {
                var self = this;
                var prefix = ninimour.base.ctx + ninimour.base.vpath;

                if (this._config['ignoreVersion']) {
                    prefix = ninimour.base.ctx;
                }

                if (loaded) {
                    loaded = false;


                    var _container = self._config['container'] || $('body');

                    var listloadingId = _container.attr('id') + '-list-loading';

                    _container.parent().append('<div id="' + listloadingId + '" class="x-list-loading"><span class="x-loading"><span></span><span></span><span></span></span></div>');

                    _filterProducts(prefix + _getLimitUrl(self._config.url, self._config.skip, self._config.limit), self._config.data, function (html) {
                        _container.append(html);
                        $('#' + listloadingId).remove();

                        if (!!!html || html.length <= 0) {
                            return;
                        }
                        self.fire('listingrefresh', self._config.skip, self._config.limit);

                        loaded = true;
                        self._config.skip += self._config.limit;
                    });
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


ninimour.tabs = (function () {


    var _init = function ($dom) {
        $dom.addClass('init');
        var $elements = $('ul > li', $dom), totalWidth = 0;
        $elements.each(function () {
            console.log($(this).outerWidth());
            totalWidth += ($(this).outerWidth() + 1);
        });


        $dom.children('ul').width(totalWidth);
//        $dom.height($elements.height());
        _bindEvents($dom.children('ul'), totalWidth);
    }


    var _bindEvents = function ($dom, totalWidth) {
        var startX = 0, endX = 0, offset = 0;

        $dom.on('touchstart', function (e) {
            var _touch = e.originalEvent.targetTouches[0];
            startX = _touch.pageX;
        });


        $dom.on('touchmove', function (e) {
            var _touch = e.originalEvent.targetTouches[0];
            var _x = _touch.pageX;
            offset = _x - startX;
            startX = _x;
            var curr = $(this).offset().left;
            $(this).css({
                'left': curr + offset
            });
        });

        $dom.on('touchend', function (e) {
            var _touch = e.originalEvent.changedTouches[0];
            var curr = $(this).offset().left, pageWidth = $(window).width();
            if (curr > 0) {
                $(this).animate({
                        left: 0
                    },
                    200, function () {
                        /* stuff to do after animation is complete */
                    });
            } else {
                if (curr < pageWidth - totalWidth) {
                    $(this).animate({
                            left: pageWidth - totalWidth
                        },
                        200, function () {
                            /* stuff to do after animation is complete */
                        });
                }
            }

        });

        $dom.on('click', '.x-tab', function (event) {
            ninimour.event.stop(event);
            $(this).addClass('active').siblings().removeClass('active');
            var tabId = $(this).data('tab');
            $('#' + tabId).addClass('active').siblings().removeClass('active');
        });


    }


    return {
        init: _init
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
        _token_address_url = ninimour.base.ctx + ninimour.base.vpath + '/paypal2/anon/shipping-details-save';
    _order_address_url = ninimour.base.ctx + ninimour.base.vpath + '/order/anon/shipping-detail-update';


    var _getLabel = function (obj, field) {
        if (!!!obj) return '';
        return obj[field] ? obj[field] : '';
    };


    var _initaddressselectors = function (address) {

        var countries = [];
        var selectedCountry = (address && address.country) ? address.country.value : '';
        ninimour.pagecache.getCountries(function (data) {
            countries = data.result;
            var countryOptions = _createOptions(selectedCountry, countries, {value: '-1', label: 'Country*'});
            $('#w-country').append(countryOptions);

        });

        var selectedState = (address && address.state) ? address.state.value : '';
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
                    var input = '<input class="x-input" type="text" id="w-state" placeholder="State" value="' + selectedState + '">';
                    $('#widow-states-wrapper').empty().append(input);
                }
            });
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
            '<div class="s-address-window" id="ninimour-address-window">',
            '   <div class="hd">',
            '       <h3>Address</h3>',
            '       <span class="s-cancel"></span>',
            '   </div>',
            '   <div class="bd">',
            '       <div class="x-address-body">',
            '           <p class="line-block">* Indicates a field is required</p>',
            '           <form id="window-address-form">',
            '               <input type="hidden" id="w-id" value="' + _getLabel(address, 'id') + '">',
            '               <div class="line-block">',
            '                   <input class="x-input" placeholder="Full Name*" required id="w-name" value="' + _getLabel(address, 'name') + '">',
            '               </div>',
            '               <div class="line-block">',
            '                   <input class="x-input" placeholder="Street Address*" required id="w-streetAddress1" value="' + _getLabel(address, 'streetAddress1') + '">',
            '               </div>',
            '               <div class="line-block">',
            '                   <input class="x-input" placeholder="Apt / Suit / Unit(Optional)" id="w-unit" value="' + _getLabel(address, 'unit') + '">',
            '               </div>',
            '               <div class="line-block double">',
            '                   <div>',
            '                       <select id="w-country">',
            '                       </select>',
            '                   </div>',
            '                   <div id="widow-states-wrapper">',
            '                        <input class="x-input" type="text" id="w-state" placeholder="State">',
            '                   </div>',
            '               </div>',
            '               <div class="line-block">',
            '                   <input class="x-input" required placeholder="City*" id="w-city" value="' + _getLabel(address, 'city') + '">',
            '               </div>',
            '               <div class="line-block double">',
            '                   <div>',
            '                       <input class="x-input" required placeholder="Zip / Postal Code*" id="w-zipCode" value="' + _getLabel(address, 'zipCode') + '">',
            '                   </div>',
            '                   <div>',
            '                       <input class="x-input" required placeholder="Phone*" id="w-phoneNumber" value="' + _getLabel(address, 'phoneNumber') + '">',
            '                   </div>',
            '               </div>',
            '               <div class="line-block">',
            '                   <button type="submit">Submit</button>',
            '               </div>',
            '           </form>',
            '       </div>',
            '   </div>',
            '</div>'
        ].join('');

        $('body').append(html);


        $('#ninimour-address-window').on('click', '.s-cancel', function (event) {
            ninimour.event.stop(event);
            _close();
        });


        ninimour.fixedwindow.up($('#ninimour-address-window'));
        _initaddressselectors(address);

    };

    var _close = function () {
        ninimour.fixedwindow.down($('#ninimour-address-window'));
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


    var _editaddress = function (isDefault, token, callBack) {
        var address = _generateAddress(), url = _edit_address_url;
        address['defaultAddress'] = isDefault;
        if (token) {
            address['token'] = token;
            url = _token_address_url;
        }
        ninimour.http.post(url, address, function (data) {
            callBack(data);
        }, function (data) {
            alert(data.result);
        });

    };

    var _addaddress = function (isDefault, callBack) {
        var address = _generateAddress();
        address['defaultAddress'] = isDefault;
        ninimour.http.post(_add_address_url, address, function (data) {
            callBack(data);
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
                    _editaddress(isDefault, null, callBack);
                    return false;
                });
            },
            addAddress: function (isDefault, callBack) {
                _createWindow(null);
                $('#ninimour-address-window').on('submit', '#window-address-form', function (e) {
                    ninimour.event.stop(e);
                    _addaddress(isDefault, callBack);
                    return false;
                });

                ninimour.apis.amazon.record('ADD_SHIPPING_INFO');

            },
            tokenAddress: function (address, token, callBack) {
                _createWindow(address);
                $('#ninimour-address-window').on('submit', '#window-address-form', function (e) {
                    ninimour.event.stop(e);
                    _editaddress(true, token, callBack);
                    return false;
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
                $('#ninimour-cart-number').hide();
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

        var shoppingCartProducts = cart.shoppingCartProducts, orderSummary = cart.orderSummary, messages = cart.messages;
        var itemDoms = [], itemDom;
        for (var i = 0, len = shoppingCartProducts.length; i < len; i++) {
            itemDom = _create_item(shoppingCartProducts[i]);
            itemDoms.push(itemDom);
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
            // _loadingcart(function (cart) {
            //     if (cart && cart.shoppingCartProducts && cart.shoppingCartProducts.length > 0) {
            //         _create_cart(cart, isDisplay);
            //     } else {
            //         $('#ninimour-header-cart').remove();
            //     }
            // });
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
        ninimour.http.loadingGet(ninimour.base.ctx + ninimour.base.vpath + '/subscription/anon', {email: email}, callBack);
    };

    return {
        indexSubscribe: function (email) {
            _subscribe(email, function (data) {
                alert('Thank you for subscribing! Enjoy shopping at Chiquedoll.');
            });
        },
        subscribe: _subscribe
    };


})();


$(function () {

    var headerHeight = $('#ninimour-header').height() + $('#ninimour-header-tip').height();
    $('#ninimour-x-header').height(headerHeight);

    //init shoppingcart count
    ninimour.shoppingcartutil.notify();

    ninimour.wishlist.getWishs();

    $(document).on('click', '.x-checkbox', function (event) {
        ninimour.event.stop(event);
        $(this).toggleClass('active');
    });

    $(document).on('click', '.ninimour-like-btn', function (event) {
        ninimour.event.stop(event);
        var $this = $(this), productId = $this.attr('product-id');
        if ($this.hasClass('liked')) {
            ninimour.wishlist.remove(productId, function () {
                $this.removeClass('liked');
                ninimour.apis.amazon.record('PRODUCT_CANCEL_SAVE', {relatedId: productId});
            });
        } else {
            ninimour.wishlist.add(productId, function () {
                $this.addClass('liked');
                ninimour.apis.amazon.record('PRODUCT_SAVE', {relatedId: productId});
            });
        }
    });

    $('#ninimour-index-subscribe').click(function (e) {
        ninimour.event.stop(e);
        var email = $('#ninimour-sub-email').val();

        if (email) {
            ninimour.subscribor.indexSubscribe(email);
        }


    });


    $(window).scroll(function (e) {


        var xheader = $('#ninimour-x-header')[0];

        if (xheader) {
            var rect = xheader.getBoundingClientRect();
            if (rect.top <= 0) {
                $('#ninimour-header').addClass('fixed');
            } else {
                $('#ninimour-header').removeClass('fixed');
            }
        }


    });


    $('#ninimour-menu-btn').click(function (e) {
        ninimour.event.stop(e);
        $('#ninimour-menu-mask').show();
        $('#ninimour-menu').addClass('active');
        $('html , body').css({'overflow-y': 'hidden'});
    });

    $('#ninimour-menu-mask').click(function (e) {
        ninimour.event.stop(e);
        $('#ninimour-menu-mask').hide();
        $('#ninimour-menu').removeClass('active');
        $('html , body').css({'overflow-y': 'auto'});
    });

    if (typeof ninilike != 'undefined') {

        var likeproducts = new ninimour.products({
            skip: 0,
            limit: 20,
            data: {},
            url: '/product/1/{skip}/{limit}/show',
            container: $('#ninimour-you-also-like'),
            isScroll: true,
            ignoreVersion: true
        });

        likeproducts.load();


        likeproducts.on('listingclick', function (productId) {
            ninimour.apis.amazon.record('PRODUCT_CLICK', {relatedId: productId, relatedId3: 'youmaylike'});
        });

        likeproducts.on('listingrefresh', function (skip, limit) {
            ninimour.apis.amazon.record('PRODUCT_LIST_REFRESH', {relatedId: 'youmaylike', skip: skip, limit: limit});
        });

    }

    $('.ninimour-open-list').click(function (event) {
        ninimour.event.stop(event);
        $(this).next().addClass('active');
    });

    $('.ninimour-policy-open').click(function (event) {
        ninimour.event.stop(event);
        $(this).next().toggleClass('active');
    });

    $('.ninimour-policy').click(function (event) {
        ninimour.event.stop(event);
        $(this).toggleClass('active').next('.x-level-2').toggleClass('active');
    });

    setInterval(function () {

        if ($('#ninimour-tool-tips li.animated').next().length <= 0) {
            $('#ninimour-tool-tips li.animated').removeClass('animated');
            $('#ninimour-tool-tips li').first().addClass('animated');
        } else {
            $('#ninimour-tool-tips li.animated').removeClass('animated').next().addClass('animated');
        }

    }, 4000);

    if (!ninimour.cookie.get('sub-displayed')) {
        ninimour.fixedwindow.open($('#ninimour-alert-sub-window'));
    }

    $('#ninimour-alert-sub-window').on('click', '.cls', function (event) {
        ninimour.event.stop(event);
        ninimour.fixedwindow.close($('#ninimour-alert-sub-window'));
    });

    $('#ninimour-alert-sub-window').on('submit', '#sub-form', function (event) {
        ninimour.event.stop(event);
        ninimour.subscribor.subscribe($('#sub-email').val(), function (data) {
            ninimour.fixedwindow.close($('#ninimour-alert-sub-window'));
        });


    });

    ninimour.cookie.add('sub-displayed', '1', 365);


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
        amazon: amazon
    };


})();


