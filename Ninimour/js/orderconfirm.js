var orderconfirm = (function () {
    var _createMask = function (maskId) {
        return '<div class="x-mask" id="' + maskId + '"></div>';
    }
    var _createEditEmail = function (email) {
        return [
            '<div class="x-window oc-window" id="ninimour-email-window">',
            '   <div class="hd">',
            '       <h3>Email</h3>',
            '       <span class="cls"></span>',
            '   </div>',
            '   <div class="bd">',
            '       <form id="ninimour-email-form">',
            '           <div class="oc-input-liners">',
            '               <div class="oc-input-liner"><input type="email" class="x-input oc-input" required placeholder="New Email"></div>',
            '               <div class="oc-input-liner oc-btn-liner x-text-center"><button class="x-btn active oc-submit-btn">Submit</button></div>',
            '           </div>',
            '       </form>',
            '   </div>',
            '</div>'
        ].join('');
    }

    return {
        editEmail: function (email) {
            var maskId = ninimour.utils.getUUID(), mask = _createMask(maskId);
            var emailWindow = _createEditEmail(email);
            $('body').append(mask, emailWindow);
            ninimour.fixedwindow.open($('#ninimour-email-window'));

            $('#ninimour-email-window').on('click', '.cls', function (event) {
                ninimour.event.stop(event);
                ninimour.fixedwindow.close($('#ninimour-email-window'));
            });

            $('#ninimour-email-window').on('submit' , '#ninimour-email-form' , function(event){
                ninimour.event.stop(event);
                ninimour.http.authcpost(ninimour.base.ctx + ninimour.base.vpath + '/customer/anon/change-email' , {customerId:customerId,email: email} , function(data){
                    $('#ninimour-so-email').text(email);
                    ninimour.fixedwindow.close($('#ninimour-email-window'));
                });
            });
        },

    };
})();

$(function(){
    $('#ninimour-email-edit').click(function(event){
        ninimour.event.stop(event);
        orderconfirm.editEmail($('#ninimour-so-email').val());
    });
});