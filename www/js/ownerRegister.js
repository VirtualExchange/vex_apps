var ownerRegister = {
    ownerRegister: {
        init: function(e){
            console.log('app.ownerRegister.init()');
            // Hide landing page/show menu bar
            $('.carousel').addClass('hide');
            $('#menubutton').addClass('hide');
            $('#landingPageMenu').addClass('hide');
            $('#landingPageMenu').collapse('hide');
            $('.navbar').removeClass('hide');
            $('#backLink').removeClass('hide');
            
            var instruction = app.lang.getStr('%Instruction%', 'ownerRegisterView');
            instruction = instruction.replace("%s","<b>"+$(e).attr('store_name')+"</b>");
            
            // Push onto stack
            app.views.backStack.push("OwnerLogin");
            app.draw(
                '#content',
                '#ownerRegisterView',
                'ownerRegisterView',
                {
                    instruction: instruction
                },
                '',
                function () {
                    app.bindEvents();
                }
            );
        },
        submit: function(e){
            console.log('app.ownerRegister.submit()');
            app.views.goBack();
            /*
            app.webservice.ownerLogin(
            {
                "user": {
                    "email": $('#user_email').val(),
                    "password":$('#user_password').val()
                }
            },
            function(result){
                console.log(JSON.stringify(result));
                if(result.success==true){
                    app.views.backStack.pop();
                    $('#menuicon').removeClass('hide');
                    $('#backLink').removeClass('hide');
                    console.log('result.success');
                    window.localStorage.setItem("ownerToken", result.auth_token);
                    window.localStorage.setItem("ownerEmail", result.email);
                    app.ownerLogin.title(result.store_id);
                }else{
                    console.log('result.fail');
                    navigator.notification.alert(
                        app.lang.getStr(result.message, 'loginView'), 
                        function () {}, 
                        app.lang.getStr('%Error%', 'aplication'), app.lang.getStr('%Close%', 'aplication')
                    );
                }
            },
            function(err){
                console.log('ERROR LOGIN');
                console.log(JSON.stringify(err));
                navigator.notification.alert(
                    app.lang.getStr(err.a.responseJSON.message, 'loginView'), 
                    function () {}, 
                    app.lang.getStr('%Error%', 'loginView'), app.lang.getStr('%Close%', 'loginView')
                );
            });*/
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
