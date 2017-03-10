/**
 * Created by s_lei on 2017/1/5.
 */
ninimour.sign = (function () {

    var _remember = function(email , password){
        ninimour.cookie.add('e' , Base64.encode('["'+email+'","'+password+'"]') , 365);
    }

    var _faceloginhander = function(fbId,accessToken,callBack){
        Handler.ajaxHandler(ctx + '/login/customer/login/facebook/'+fbId+'/'+accessToken,'GET',{},callBack);
    }


    return {
        login: function (email, password) {
            ninimour.http.post(ninimour.base.ctx + ninimour.base.vpath + '/login-customer/anon/login', {
                email: email,
                password: password
            }, function (data) {
                _remember(email , password);
                ninimour.anchor.open(redirectURL);
            });
        },
        register: function (rst) {
            var self = this;
            ninimour.http.post(ninimour.base.ctx + ninimour.base.vpath + '/customer/anon/register', rst, function (data) {
                self.login(rst.email , rst.password);
            });
        },
        facelogin: function () {
            ninimour.apis.facebook.login(function (response) {
                _faceloginhander(response.authResponse.userID,response.authResponse.accessToken,function(data){
                    ninimour.anchor.open(redirectURL);
                });
            });
        }
    };
})();



$(function(){
    $('#login-form').submit(function(event){
        ninimour.event.stop(event);
        var email = $('#login-email').val() , password = $('#login-password').val();
        if($.trim(email) && password){
            ninimour.sign.login(email , password);
        }
    });


    $('#register-form').submit(function(event){
        ninimour.event.stop(event);

        var email = $('#register-email').val() , password = $('#register-password').val();
        var firstName = $('#register-first-name').val() , lastName = $('#register-last-name').val();

        var rst = {
            'email':email,
            'password':password,
            'name.firstName':firstName,
            'name.lastName':lastName
        };

        ninimour.sign.register(rst);
    });
    
    $('#ninimour-face-login').click(function (event) {
        ninimour.event.stop(event);
        ninimour.sign.facelogin();
    });

    $('#lg-sign-up , #lg-sign-in').click(function(event){
        ninimour.event.stop(event);
        $('.lg-tab').toggleClass('active');
    });
});