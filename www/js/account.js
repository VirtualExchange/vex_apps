var account = {
        account: {
            init: function(){
                console.log("app.account.init()");
        
                $('.carousel').addClass('hide');
                $('#menubutton').addClass('hide');
                $('#landingPageMenu').addClass('hide');
                $('#landingPageMenu').collapse('hide');
                $('.navbar').removeClass('hide');
                $('#backLink').addClass('hide');
                app.views.backStack.push("AccountView");
                app.webservice.get(
                    'device',
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));
                        app.draw(
                            '#content',
                            '#accountView',
                            'accountView',
                            {
                                id: result.id,
                                token: result.token,
                                push_token: result.push_token,
                                kind: result.kind,
                                latitude: result.latitude,
                                longitude: result.longitude,
                                radius: result.radius,
                                name: result.name ? result.name : "",
                                email: result.email ? result.email : "",
                                phone: result.phone ? result.phone : ""
                            },
                            '',
                            function () {
                                app.bindEvents();
                            }
                        );
                    },
                    function (err) {
                        console.log(err);
                    }
                );
                
                app.draw(
                    '#content',
                    '#accountView',
                    'accountView',
                    {},
                    '',
                    function () {
                        app.bindEvents();
                    }
                );
            },
        }
}