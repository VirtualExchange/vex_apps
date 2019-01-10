var ownerLogin = {
    ownerLogin: {
        init: function(){
            console.log('app.ownerLogin.init()');
            // Hide landing page/show menu bar
            hideHomeMenu();
            $('#backLink').removeClass('hide');
            
            var ownerEmail = window.localStorage.getItem("ownerEmail");
            var ownerToken = window.localStorage.getItem("ownerToken");
            var store_id = window.localStorage.getItem("store_id");
            
            if (ownerEmail && ownerToken) {
                app.ownerLogin.title(store_id);
            } else {
                // Push onto stack
                app.views.backStack.push("OwnerLogin");
                app.draw(
                    '#content',
                    '#ownerLoginView',
                    'ownerLoginView',
                    {
                    },
                    '',
                    function () {
                        
                        app.bindEvents();
                    }
                );
            }
        },
        submit: function(e){
            console.log('app.views.login.submit()');
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
                        app.lang.getStr('%Error%', 'ownerLoginView'), app.lang.getStr('%Close%', 'ownerLoginView')
                    );
                }
            },
            function(err){
                console.log('ERROR LOGIN');
                console.log(JSON.stringify(err));
                navigator.notification.alert(
                    app.lang.getStr(err.a.responseJSON.message, 'loginView'), 
                    function () {}, 
                    app.lang.getStr('%Error%', 'ownerLoginView'), app.lang.getStr('%Close%', 'ownerLoginView')
                );
            });
        },
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
                    console.log("app.stores.name: "+app.stores.name);
                    $('#appTile').html(stripLeadingTag(app.stores.name));
                    $('#storeName').html(app.stores.name);
                    app.ownerChat.list();
                    //app.push.register();
                },
                function (err) {
                    console.log(JSON.stringify(err));
                    app.ownerLogin.init();
                }
            );
        },
        logout: function(){
            window.localStorage.removeItem("store_id");
            window.localStorage.removeItem("ownerEmail");
            window.localStorage.removeItem("ownerToken");
            app.views.backStack.pop();
            var len = app.views.backStack.length;
            console.log("len: "+len);
            var backToStr = app.views.backStack[len-1];
            console.log("backToStr: "+backToStr);
            if (backToStr.indexOf("owner")) app.views.backStack.pop();
            if (len > 1) {
              backToStr = app.views.backStack[len-2];
              console.log("backToStr: "+backToStr);
              if (backToStr.indexOf("owner")) app.views.backStack.pop();
            }
            app.ownerLogin.init();
        }
    }
}
