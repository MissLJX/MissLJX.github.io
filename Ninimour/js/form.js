/**
 * Created by s_lei on 2017/3/2.
 */


/**
 *
 * @param form
 * @param checkOpt
 * @param handler
 * @constructor
 */
function Form(form, checkOpt, handler) {
    this.addCheckValidity();
    this.form = form;
    $(form).attr('novalidate','no');
    this.form.Form = this;
    this.checkOpt = checkOpt;
    this.handler = handler;
    this.setValidationMsg();
    this.bind();
}

Form.prototype = {


    'validationMessage_en-US': {
        email: 'invalid email format',
        number: 'invalid number format',
        url: 'invalid url format',
        password: 'invalid format',
        text: 'invalid format'
    },

    'validationMessage_zh-CN': {
        email: '无效的邮箱格式',
        number: '无效的数字格式',
        url: '无效的网址格式',
        password: '格式无效',
        text: '格式无效'
    },

    'valueMissing_en-US': 'Please fill out this field',

    'valueMissing_zh-CN': '请填写此项',

    setValidationMsg: function () {


        var language = navigator.language;

        var validationMessage = this['validationMessage_'+language];
        validationMessage = validationMessage ? validationMessage : this['validationMessage_en-US'];

        this.validationMessage = validationMessage;
        if (!this.checkOpt.errorText) {
            this.checkOpt.errorText = {};
        }

        if (!this.checkOpt.errorText.valueMissing) {
            this.checkOpt.errorText.valueMissing = this['valueMissing_'+language] ? this['valueMissing_'+language] : this['valueMissing_en-US'];
        }

    },


    addCheckValidity: function () {
        var input = document.createElement('input');
        //解决不支持html5验证的问题
        if (!input.checkValidity) {
            HTMLInputElement.prototype.checkValidity = function () {
                var that = this;

                //添加常用的一些验证 email , url , number
                var m = {
                    email: /^[a-z0-9\.\'\-]+@[a-z0-9\.\-]+$/i,
                    url: /^https?\:\/\/[a-z0-9]+/i,
                    number: /^[0-9]+(\.[0-9]+)?$/i
                };

                var type = that.getAttribute('type'),
                    pattern = that.getAttribute('pattern'),
                    required = (that.getAttribute('required') !== null);

                that.validity = {
                    valueMissing: required && that.value.length === 0,
                    typeMismatch: that.value.length > 0 && (type in m) && !(that.value.match(m[type])),
                    patternMismatch: pattern && that.value.length > 0 && !(that.value.match(pattern))
                };

                var Form = that.form.Form;
                for (var x in that.validity) {
                    if (x === 'valid' && that.validity[x] === true) return true;
                    if (that.validity[x]) {
                        that.validity.valid = false;
                        switch (x) {
                            case 'valueMissing':
                                that.validationMessage = Form.checkOpt.errorText.valueMissing;
                                break;
                            case 'typeMismatch':
                                that.validationMessage = Form.validationMessage[type] || "type mismatch";
                                break;
                            case 'patternMismatch':
                            default:
                                that.validationMessage = that.getAttribute("title");
                                break;
                        }
                        $(that).trigger('invalid');
                        return false;
                    }
                }
                return that.validity.valid = true;
            }

            HTMLTextAreaElement.prototype.checkValidity = HTMLInputElement.prototype.checkValidity;
        }

        var form = document.createElement('form');
        if (!form.checkValidity) {
            HTMLFormElement.prototype.checkValidity = function () {
                var $inputs = $(this).find("input");
                for (var i = 0; i < $inputs.length; i++) {
                    if (!$inputs[i].checkValidity()) {
                        $(this).trigger("invalid");
                        return false;
                    }
                }
                return true;
            }
        }

    },

    addErrorMsg: function (input, msg) {
        var Form = this, $input = $(input);
        var position = $(input).position();
        var left = position.left, top = position.top + $(input).outerHeight();
        var errorMsgClass = Form.checkOpt.errorMsgClass || 'x-error-msg-class', style = "position:absolute;margin:0;";
        var errorInputClass = Form.checkOpt.errorInputClass || 'x-error-input-class';
        Form.errorInputClass = errorInputClass;

        $input.addClass(errorInputClass);
        style += 'top:' + top + 'px;left:' + left + 'px;';
        var errorMsg = '<p style="' + style + '" class="' + errorMsgClass + ' errorMsg">' + msg + '</p>';
        $('.errorMsg').remove();
        $(errorMsg).insertAfter($(input));


        clearTimeout(this.removeMsgTimeId);

        this.removeMsgTimeId = setTimeout(function () {
            $input.next('.errorMsg').remove();
        }, 2000);

    },

    customValidity: function (input) {
        var rule = this.checkOpt.rule,
            name = input.name;
        if (rule && rule[name]) {
            if (!rule[name]["check"].call(input)) {
                return rule[name]["msg"];
            }
        }
        return null;
    },

    checkInputValidity: function (input) {
        var Form = input.form.Form,
            errorText = Form.checkOpt.errorText,
            text = '';
        if (!input.checkValidity()) {
            var validity = input.validity;
            if (validity.valueMissing && errorText && (text = errorText.valueMissing)) {
                return text;
            } else if (validity.typeMismatch && input.validationMessage === "type mismatch") {
                return Form.validationMessage[input.getAttribute('type')];
            } else if (validity.patternMismatch && (text = input.getAttribute("title"))) {
                return text;
            } else {
                return input.validationMessage;
            }
        }
        return this.customValidity(input);
    },

    checkValidity: function () {
        var Form = this, form = this.form;
        var $inputs = $(form).find('input'), input;
        for (var i = 0, len = $inputs.length; i < len; i++) {
            input = $inputs[i];
            if (input.hasChecked) continue;
            var errMsg = Form.checkInputValidity(input);
            if (errMsg) {
                Form.addErrorMsg(input , errMsg);
                $(input).focus();
                return false;
            }
        }

        Form.handler();

        return true;

    },

    bind: function () {
        var $form = $(this.form), Form = this;

        $form.on('invalid' , 'form', function (event) {
            event.preventDefault();
        });

        $form.on('invalid', 'input', function (event) {
            event.preventDefault();
        });



        $form.on('blur', 'input', function (event) {
            event.preventDefault();
            var Form = this.form.Form;
            var msg = Form.checkInputValidity(this);
            if (msg !== null) {
                Form.addErrorMsg(this, msg);
                return;
            }
            this.hasChecked = true;
        });

        $form.on('focus', 'input', function () {
            if (this.type !== 'submit') {
                this.hasChecked = false;
            }

            this.form.Form.editingInput = this;
            $(this).removeClass(this.form.Form.errorInputClass);
        });

        $form.on('submit',function (event) {
            event.preventDefault();
            Form.checkValidity();
        });
    },

    distory: function(){
        $form.off();
    }


};




