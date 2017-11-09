var login = {
        login: {
            init: function(){
                console.log("app.login.init()");
                $('.navbar-toggle').hide();
                $('.carousel').addClass('hide');
                $('#menubutton').addClass('hide');
                $('#landingPageMenu').addClass('hide');
                $('#landingPageMenu').collapse('hide');
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
            register: function(e){
                console.log("app.views.register.init()");
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
            }
        },
}