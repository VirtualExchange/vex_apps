var purchase = {
    purchase: {
        buy: function(e){
            console.log("app.purchase.buy");
            console.log("e: "+$(e).attr('store_id'));
            cordova.getAppVersion.getPackageName().then(function (packageName) {
                console.log("packageName: "+packageName);
                console.log("product: "+packageName+"."+$(e).attr('store_id'));
                product_name = packageName+"."+$(e).attr('store_id');
                console.log("product_name: "+product_name);
                inAppPurchase
                .getProducts([product_name])
                .then(function (products) {
                    console.log(JSON.stringify(products));
                    inAppPurchase
                        .buy(product_name)
                        .then(function (data) {
                            console.log(JSON.stringify(data));
                            app.purchase.updateClient($(e).attr('store_id'));
                            $('#purchaseDiv').addClass('hide');
                            app.home.showStoreTabs(app.products.categories,app.home.oStoreDetail,'true');
                        })
                        .catch(function (err) {
                            console.log(JSON.stringify(err));
                            if (err.response == 7){
                                navigator.notification.alert(
                                    "You already own this item",
                                    function () {
                                        app.purchase.updateClient($(e).attr('store_id'));
                                        $('#purchaseDiv').addClass('hide');
                                        app.home.showStoreTabs(app.products.categories,app.home.oStoreDetail,'true');
                                    }, 
                                    "", 
                                    "Restore"
                                );
                            } else {
                                navigator.notification.alert(
                                    error.message,
                                    function () {}, 
                                    "", 
                                    "OK"
                                );
                            }
                        });
                    })
                .catch(function (err) {
                    console.log(JSON.stringify(err));
                });        
                
            });
        },
        restorePurchases: function(){
            inAppPurchase
            .restorePurchases()
            .then(function (data) {
                console.log(JSON.stringify(data));
            })
            .catch(function (err) {
                console.log(JSON.stringify(err));
            });        
        },
        updateClient: function (store_id) {
            console.log('app.purchase.updateClient');
                
            app.clientStores.push(store_id);
            store_ids = app.clientStores.toString();
            console.log("store_ids: "+store_ids);
            app.webservice.post(
                'session',
                'PUT',
                {
                    client: {store_ids: store_ids,buy_store_id: store_id}
                },
                function (result) {
                    console.log(JSON.stringify(result));
                },
                function (e) {
                    console.log(JSON.stringify(e));
                }
            );
        }
    }
    
}