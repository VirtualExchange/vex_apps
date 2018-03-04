var login = {
    login: {
        init: function(){
            console.log("app.login.init");
            $('.navbar-toggle').hide();
            showHomeMenu();
            app.homeInitCalled = 0;
            app.draw(
                '#content',
                '#loginView',
                'loginView',
                {},
                '',
                function () {
                    $('#loginViewTitle').html(app.appName);
                    app.bindEvents();
                }
            );
        },
        submitLogin: function(e){
            console.log("app.views.submitLogin");
            console.log(app.url + 'session');
            console.log($('#login_user').val() + " > " +$('#login_password').val());
            $('#loginSpinner').removeClass('hide');
            
            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: app.url + 'session',
                crossDomain: true,
                data: {
                    username: $('#login_user').val(),
                    password: $('#login_password').val()
                },
                headers: {
                    "Authorization": "Token token=" + app.token,
                    "contentType": "application/json"
                },
                success: function(data) {
                    console.log(JSON.stringify(data));
                    if(data.success){
                        app.logged = true;
                        window.localStorage.setItem("user_token", data.token);
                        app.userToken = data.token;
                        console.log("data.store_ids: "+data.store_ids);
                        if (data.store_ids) app.clientStores = data.store_ids;
                        console.log("app.clientStores: "+app.clientStores);
                        app.home.init();
                    }
                },
                error: function(a, b, c) {
                    var err = {
                        a: a,
                        msg: b,
                        message: 'Webservice Error: '+c
                    };
                    console.log(JSON.stringify(err));
                    $('#loginSpinner').addClass('hide');
                    $('.alert-danger').removeClass('hidden');
                    $('.alert-danger').html(app.lang.getStr('%error_login%', 'aplication'));
                }
            });
        },
        register: function(){
            console.log("app.login.register");
            $('.navbar-toggle').hide();
            showHomeMenu();
            app.homeInitCalled = 0;
            app.draw(
                '#content',
                '#registerView',
                'registerView',
                {},
                '',
                function () {
                    app.bindEvents();
                }
            );
        },
        submitRegister: function(){
            console.log("app.login.submitRegister");
            $('#loginSpinner').removeClass('hide');
            
            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: app.url + 'session/register',
                crossDomain: true,
                data: {
                    client: {
                        username: $('#user_email').val(),
                        password: $('#user_password').val(),
                        name: $('#user_name').val(),
                        email: $('#user_email').val(),
                        blocked: 'false' 
                    }
                },
                headers: {
                    "Authorization": "Token token=" + app.token,
                    "contentType": "application/json"
                },
                success: function(data) {
                    console.log(JSON.stringify(data));
                    if (data.success == true){
                        navigator.notification.alert(
                            data.message, 
                            function () {
                                app.login.init();
                            }, 
                            "", 
                            "Login"
                        );
                    } else {
                        navigator.notification.alert(
                            data.full_message, 
                            function () {}, 
                            "", 
                            "OK"
                        );
                    }
                },
                error: function(err) {
                    console.log(JSON.stringify(err));
                    navigator.notification.alert(
                        JSON.stringify(err),
                        function () {}, 
                        "", 
                        "OK"
                    );
                }
            });
        }
    }
}