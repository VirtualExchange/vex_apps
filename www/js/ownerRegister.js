var ownerRegister = {
    ownerRegister: {
        init: function(e){
            console.log('app.ownerRegister.init()');
            // Hide landing page/show menu bar
            hideHomeMenu();
            $('#backLink').removeClass('hide');
            
            var instruction = app.lang.getStr('%Instruction%', 'ownerRegisterView');
            var store_name="";
            if (app.home.oStoreDetail) store_name = stripAbout(app.home.oStoreDetail.name);
            
            // Push onto stack
            app.views.backStack.push("OwnerLogin");
            app.draw(
                '#content',
                '#ownerRegisterView',
                'ownerRegisterView',
                {
                    instruction: instruction,
                    name: store_name
                },
                '',
                function () {
                    app.bindEvents();
                }
            );
        },
        submit: function(e){
            console.log('app.ownerRegister.submit()');
            app.webservice.ownerPost(
                'sessions/register',
                'POST',
                {   
                    user:{
                        email: $('#user_email').val(),
                        password: $('#user_password').val(),
                        password_confirmation: $('#user_confirm_password').val(),
                        name: $('#user_name').val(),
						store_id: app.home.oStoreDetail.id
                    }
                },
                function(result){
                    console.log(JSON.stringify(result));
                    var submitMessage = app.lang.getStr('%submitMessage%', 'ownerRegisterView');
                    navigator.notification.alert(
                        'You will be contacted by a Virtual Open Exchange representative to complete the process of registering a business',
                        function(){}, 
                        'Thank you!',
                        'Close'
                    );
                    app.views.goBack();
                },
                function(err){
                    console.log(JSON.stringify(err));
                }
            );
        }/*,
        title: function(store_id){
            console.log("app.views.login.title()");
            app.webservice.getOwner(
                'stores/' + store_id,
                {},
                function (r) {
                    console.log(JSON.stringify(r));
                    app.stores.id = r.id;
                    window.localStorage.setItem("store_id", r.id);
                    app.stores.name = r.name;
                    app.stores.logo = r.logo;
                    app.stores.corporate = r.corporate;
                    $('#appTile').html(stripLeadingTag(app.stores.name));
                    app.ownerChat.list();
                    //app.push.register();
                },
                function (err) {
                    console.log(JSON.stringify(err));
                    app.ownerLogin.init();
                }
            );
        }*/
    }
}
