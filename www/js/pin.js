var pin = {
        pin: {
            init: function (e) {
                console.log('app.pin.init()');
                app.views.backStack.push("Pinned");

                hideHomeMenu();

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
                                $('.toProduct').attr('data-callback', 'app.pin.showProduct');
                                $('.toProduct').attr('data-pin', 'true');
                                app.bindEvents();
                            }
                        );
                    },
                    function (e) {
                        console.log(JSON.stringify(e));
                         navigator.notification.alert(e.message, function(){
                        });
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
                        app.views.backStack.push("ProductDetail:"+result.store_id+":"+result.product_id+":"+'true');
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