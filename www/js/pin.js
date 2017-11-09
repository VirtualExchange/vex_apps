var pin = {
        pin: {
            init: function (e) {
                console.log('app.pin.init()');

                $('.linkHome').removeClass('selected');
                $(e).addClass('selected');

                $(window).unbind('scroll');

                app.webservice.get(
                    'pins',
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));
                        app.draw(
                            '#content',
                            '#pinView',
                            'pinView',
                            {},
                            '',
                            function () {
                                app.products.addProducts(result.pins);

                                $('.btPin').attr('remove', 'true');
                                $('.toProduct').attr('data-callback', 'app.pin.showProduct');
                                $('.toProduct').attr('data-pin', 'true');
                                app.bindEvents();
                            }
                        );
                    },
                    function (err) {
                        console.log(err);
                        app.views.loadView.hide();
                    }
                );
            },
            showProduct: function (e) {
                console.log('app.pin.showProduct()');

                var prod_id = $(e).attr('prod_id');

                app.webservice.get(
                    'pins/' + prod_id,
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));
                        app.products.addProductDetail(result, e);
                    },
                    function (err) {
                        console.log(JSON.stringify(err));
                        app.views.loadView.hide();
                    }
                );
            }
        },
}