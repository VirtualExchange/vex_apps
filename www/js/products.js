var products = {
        products: {
            categories: [],
            showProductList: function(e){
                console.log('app.products.showProductList');
                
                app.views.setDefaults();
                
                app.draw(
                    '#content',
                    '#productListView',
                    'productListView',
                    {},
                    '',
                    function () {
                        app.bindEvents();
                        
                        app.webservice.get(
                            'categories',
                            {},
                            function (result) {
                                app.products.addCategorieMenu(result.categories);
                                app.bindEvents();
                                
                            },
                            function (err) {
                                console.log(err);
                                app.views.loadView.hide();
                            }
                        );
                        
                        app.webservice.get(
                            'products',
                            {},
                            function (result) {
                                console.log(result);
                                
                                app.products.addProducts(result.products);
                            },
                            function (err) {
                                console.log(err);
                                app.views.loadView.hide();
                            }
                        );
                    }
                );
            },
            showProductListMore: function(e){
                console.log('app.products.showProductListMore');
                var cat_name = decodeURI($(e).attr('cat_name'));
                var store_id = $(e).attr('store_id');
                app.views.backStack.push("ProductList:"+cat_name+":"+store_id);
                app.products.showProductListMore2(cat_name,store_id);
            },
            
            showProductListMore2: function(cat_name,store_id){
                console.log('app.products.showProductListMore2');
                app.draw(
                    '#content',
                    '#productListView',
                    'productListView',
                    {},
                    '',
                    function () {
                        app.bindEvents();
                        
                        app.webservice.get(
                            'stores/' + store_id + '/categories',
                            {},
                            function (result) {
                                app.products.addCategorieMenu(result.categories);
                                var cat_id = getCategoryId(result.categories,cat_name);
                                
                                if (cat_name == "*"){
                                    $('#catFilterName').html("");
                                    $('#clearFilter').addClass('hide');
                                    $('#catFilter').removeClass('hide');
                                }else {
                                    $('#catFilterName').html(cat_name);
                                    $('#clearFilter').removeClass('hide');
                                    $('#catFilter').addClass('hide');
                                }
                                $('#clearFilter').attr('data-callback', 'app.products.clearFilterMore');
                                $('#clearFilter').attr('store_id', store_id);
                                var query = 'stores/' + store_id + '/products/?q[product_category_id_eq]=' + cat_id;
                                
                                if (cat_name=="*"){
                                    query = 'stores/' + store_id + '/products';
                                }
                                
                                app.webservice.get(
                                    query,
                                    {},
                                    function (result) {
                                        console.log(result);
                                        app.products.addProducts(result.products);
                                    },
                                    function (err) {
                                        console.log(err);
                                        app.views.loadView.hide();
                                    }
                                );
                                app.views.loadView.hide();
                                app.bindEvents();
                                
                            },
                            function (err) {
                                console.log(err);
                                app.views.loadView.hide();
                            }
                        );
                        
                    }
                );
            },
            addCategorieMenu: function(cats){
                console.log('app.products.addCategorieMenu()');
                var countCat = 0;
                $('#categoryList').html('');
                $.each(cats, function (index, c) {
                    //console.log('app.products.addCategorieMenu: c.id:'+c.id+' c.name:'+c.name);
                    if (c.count_products != 0) {

                        if (c.subcategories.length > 0) {
                            var subCategoryHtml = '';
                            var subIds = '';
                            $.each(c.subcategories, function (i, sub) {
                                subIds = subIds.concat(sub.id+" ");
                                if (sub.count_products != 0) {
                                    countCat += 1;
                                    var str = '<a href="#" data-callback="app.products.filterBycategory" class="list-group-item" cat_id="' + sub.id + '" cat_name="'+sub.name+'"><span style="padding-left:10px">' + sub.name + '</span></a>';
                                    subCategoryHtml = subCategoryHtml.concat(str);
                                }
                            });
                            $('#categoryList').append('<a href="#" data-callback="app.products.filterBycategory" class="list-group-item" cat_id="'+c.id+'" sub_ids="'+subIds+'" cat_name="'+c.name+'"><span>' + c.name + '</span></a>');
                            $('#categoryList').append(subCategoryHtml);
                        } else {
                            countCat += 1;
                            $('#categoryList').append('<a href="#" data-callback="app.products.filterBycategory" class="list-group-item" cat_id="'+c.id+'" cat_name="'+c.name+'"><span>' + c.name + '</span></a>');
                    }
                    }
                });
            },
            filterBycategory: function(e){
                console.log('app.products.filterBycategory()');
                //console.log('NANCY: sub_ids: '+$(e).attr('sub_ids'));
                //var subIds = sub_ids.split(" ");
                $('#filterModal').modal('hide');
                
                $('#productList').html('<img src="img/load_image.gif" style="width: 40px;"/>');
                
                var cat_name = $(e).length ? $(e).html() : window.localStorage.getItem("productCatName");
                var cat_id = $(e).length ? $(e).attr('cat_id') : window.localStorage.getItem("productCat");
                
                window.localStorage.setItem("productCat", cat_id);
                window.localStorage.setItem("productCatName", cat_name);
                
                $('#catFilterName').html(cat_name);
                $('#clearFilter').removeClass('hide');
                $('#catFilter').addClass('hide');
                
                app.webservice.get(
                    'products/?q[product_category_id_eq]=' + cat_id,
                    {},
                    function (result) {
                        console.log('app.products.filterBycategory:result:'+JSON.stringify(result));
                        app.products.addProducts(result.products);
                    },
                    function (err) {
                        console.log(err);
                        app.views.loadView.hide();
                    }
                );
                
            },
            clearFilter: function(e){
                console.log('app.products.clearFilter()');
                
                $('#catFilterName').html("");
                $('#clearFilter').addClass('hide');
                $('#catFilter').removeClass('hide');
                
                $('#productList').html('<img src="img/load_image.gif" style="width: 40px;"/>');
                
                window.localStorage.removeItem("productCatName");
                window.localStorage.removeItem("productCat");
                
                app.products.showProductList();
                
            },
            clearFilterMore: function(e){
                console.log('app.products.clearFilterMore()');
                
                $('#catFilterName').html("");
                $('#clearFilter').addClass('hide');
                $('#catFilter').removeClass('hide');
                
                $('#productList').html('<img src="img/load_image.gif" style="width: 40px;"/>');
                var store_id = $(e).attr('store_id');
                app.products.showProductListMore2("*",store_id);
                
            },
            showProductStoreList: function (store_id,store_count) {
                console.log('app.products.showProductStoreList');

                $(window).unbind('scroll');
                
                $('#productList').html('<img src="img/load_image.gif" style="width: 40px;"/>');
                
                app.webservice.get(
                    'stores/' + store_id + '/products',
                    {},
                    function (result) {
//                        console.log(JSON.stringify(result));
                        app.products.addProducts(result.products);
                        if (result.products.length > 0 && store_count > 0){
                            $('#storeTabs').removeClass('hide');
                            $('#productListDiv').removeClass('hide');
                        }
                        if (result.products.length > 0 && store_count == 0){
                            $('#productListDiv').removeClass('hide');
                        }
                        if (result.products.length == 0 && store_count > 0){
                            $('#storesListDiv').removeClass('hide');
                        }
                    },
                    function (e) {
                        console.log(JSON.stringify(e));
                        app.views.loadView.hide();
                    }
                );
            },
            addProducts: function (productList,inStore) {
                console.log('app.products.addProducts()');
                if (productList.length == 0) {
                    $('#productList').html('');
                    return;
                }
                $('#productList').html('');
                app.productsDrawn = new Array();

                $.each(productList, function (index, prod) {
                    duplicate = false;
                    $.each(app.productsDrawn, function (i,prodid){
                        if (productList[index].product_id == prodid){
                            duplicate = true;
                        }
                    });
                    if (!duplicate){
                    app.productsDrawn.push(productList[index].product_id);
                    app.draw(
                        '#productList',
                        '#ProductItem',
                        'ProductItem',
                        {
                            id: prod.id,
                            name: stripLeadingTag(prod.name),
                            price: prod.price ? prod.price : '',
                            regular_price: prod.regular_price ? prod.regular_price : '',
                            description: addReadMore2(prod.description, prod.store_id, prod.id, app.lang.getStr('%Read More%', 'aplication')),
                            img: prod.images[0].medium ? prod.images[0].medium : 'img/logo.png',
                            index: index,
                            product_id: prod.product_id,
                            store_id: prod.store_id ? prod.store_id : 0,
                            store_name: prod.store_name,
                            store_logo: prod.store_logo,
                            feature_level: prod.feature_level
                        },
                        'append',
                        function () {

                        
                            if (prod.feature_level == 3){
                                $('#productItem_'+prod.id).addClass('list-group-item-info');
                            }else if (prod.feature_level == 2){
                                $('#productItem_'+prod.id).addClass('list-group-item-danger');
                            }else if (prod.feature_level == 1){
                                $('#productItem_'+prod.id).addClass('list-group-item-success');
                            }
                            /*
                            if (prod.pin != false || prod.store_id == 0) {

                                $('#pin_' + prod.id + ' i').removeClass('fa-pin');
                                $('#pin_' + prod.id + ' i').addClass('fa-pinned');
                                
                                if (prod.pin_id)
                                    $('#pin_' + prod.id).attr('pin_id', prod.pin_id);
                                else
                                    $('#pin_' + prod.id).attr('pin_id', prod.id);

                                $('#pin_' + prod.id).attr('data-callback', 'app.products.removePinFavorite');

                                var datePin = new Date(prod.year + "-" + prod.month + "-" + prod.day + " " + prod.hour);
                                if (navigator.globalization) {
                                    navigator.globalization.dateToString(datePin, function (date) {
                                        console.log('date: ' + date.value + '\n');
                                        $('#DatePin_' + prod.id).children('span').html(date.value);
                                        $('#DatePin_' + prod.id).removeClass('hide');
                                    },
                                        function () {
                                            console.log('Error getting dateString\n');
                                        },
                                        {formatLength: 'short', selector: 'date and time'});
                                }
                            }
                            */


                            if (!prod.regular_price || prod.regular_price == '$0.00') {
                                $('#regular_price_' + index).addClass('hide');
                            }

                            if (!prod.price || prod.price == '$0.00') {
                                $('#sale_price_' + index).addClass('hide');

                                $('#regular_price_' + index).removeClass('red');
                                $('#regular_price_' + index).addClass('green');
                            }
                            
                            if(inStore){
                                $('#storeInfo').removeClass('hide');
                            }
                            if (productList.length > 1) {
                                $('#productDescription_'+index).ellipsis({row:3});
                            }
                            if (prod.images[0].medium && prod.images[0].medium.indexOf('/medium.png') > -1){
                                $('#productImage_'+index).addClass('hide');
                                $('#productDetail_'+index).removeClass('col-xs-8');
                                $('#productDetail_'+index).removeClass('col-sm-8');
                                $('#productDetail_'+index).addClass('col-xs-12 col-sm-12');
                            }
                            if (prod.name.indexOf('**banner**') == 0) {
                                $('#productItem_'+prod.id).attr('data-callback', '');
                            }
                            app.bindEvents();
                        }
                    );}
                });
            },
            pinFavorite: function (e) {
                console.log('app.products.pinFavorite');
                console.log("product_id: "+$(e).attr('product_id'));

                app.webservice.post(
                    'pins',
                    'POST',
                    {
                        publish_id: $(e).attr('product_id')
                    },
                    function (result) {
                        console.log(JSON.stringify(result));

                        $('#pinButton').removeClass('fa-rotate-90');
                    
                        $('#pinButton').attr('pin_id', result.id);
                        $('#pinButton').attr('data-callback', 'app.products.removePinFavorite');

                    },
                    function (e) {
                        console.log(JSON.stringify(e));
                    }
                );
            },
            removePinFavorite: function (e) {
                console.log('app.products.removePinFavorite');

                $('#pin_' + $(e).attr('product_id')).attr('data-callback', '');

                app.webservice.post(
                    'pins/' + $(e).attr('pin_id'),
                    'DELETE',
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));
                        $('#pinButton').addClass('fa-rotate-90');
                        $('#pinButton').attr('pin_id', '');
                        $('#pinButton').attr('data-callback', 'app.products.PinFavorite');


                    },
                    function (e) {
                        console.log(JSON.stringify(e));
                        $('#pin_' + $(e).attr('product_id')).attr('data-callback', 'app.products.removePinFavorite');

                    }
                );
            },
            productDetail: function (e) {
                console.log('app.products.productDetail()');
                //app.views.loadView.show();
                hideHomeMenu();

                var store_id = $(e).attr('store_id');
                var prod_id = $(e).attr('prod_id');
                var data_pin = $(e).attr('data-pin');
                app.products.showProductDetail(store_id,prod_id,data_pin);
                
            },
            showProductDetail: function (store_id,prod_id,data_pin) {
                console.log('app.products.showProductDetail()');
                if (store_id == 0)
                    return;
                var len = app.views.backStack.length - 1;
                //$('#backStack').html(app.views.backStack[len]);
                app.views.backStack.push("ProductDetail:"+store_id+":"+prod_id+":"+data_pin);

                app.webservice.get(
                    'stores/' + store_id + '/products/' + prod_id,
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));
                        app.products.addProductDetail(result, data_pin);
                        //app.views.loadView.hide();

                    },
                    function (e) {
                        console.log(JSON.stringify(e));
                        //app.views.loadView.hide();
                    }
                );
            },
            storeDetail: function(e){
                console.log('app.products.storeDetail()');

                
                app.views.auxBackFuc = 'producs';
                
                app.home.getStoreDetail($(e).attr('store_id'), true, 'false');
            },
            returnToProductList: function(){
                console.log('app.products.returnToProductList');
                
                console.log(window.localStorage.getItem("productCat"));
                if(window.localStorage.getItem("productCat")){
                    
                    app.draw(
                        '#content',
                        '#productListView',
                        'productListView',
                        {},
                        '',
                        function () {
                            
                            app.webservice.get(
                                'categories',
                                {},
                                function (result) {

                                    app.products.addCategorieMenu(result.categories);
                                    app.bindEvents();

                                },
                                function (err) {
                                    console.log(err);
                                    app.views.loadView.hide();
                                }
                            );

                            app.products.filterBycategory();
                            
                            app.bindEvents();

                        }
                    );
                }else app.products.showProductList();
            },
            addProductDetail: function (result, data_pin) {
                console.log('app.products.addProductDetail()');
                //console.log(JSON.stringify(result));
                //app.views.backStack.push("ProductDetail:"+result.id);
                var effect = data_pin == 'true' ? '' : 'addSlide';
                var back = data_pin == 'true' ? 'app.pin.init' : 'app.products.backProductList';

                app.draw(
                    '#content',
                    '#ProductDetailView',
                    'ProductDetailView',
                    {
                        id: result.id,
                        name: result.name,
                        regular_price: result.regular_price ? result.regular_price : '',
                        price: result.price ? result.price : '',
                        description: convertLinks(result.description),
                        contact: result.contact_info ? findContact(result.contact_info) : '',
                        payment_option: result.payment_option ? findContact(result.payment_option) : '',
                        category_name: encodeURI(result.category),
                        store_id: result.store_id
                    },
                '',
                    function () {
//                            $('.productDetail').css('height', $(window).height());

                        //$('#btBackProd').attr('data-callback', back);
                        if (app.views.backStack.length > 1){
                            var ind = app.views.backStack.length-2;
                            $('#backStack').html(app.views.backStack[ind]);
                            $('#backLink').removeClass('hide');
                        }else{
                            $('#backLink').addClass('hide');
                        }

                        if (result.contact_info == '<p></p>') {
                            $('#productContact').addClass('hide');
                        }

                        if (!result.payment_option) {
                            $('#paymentOption').addClass('hide');
                        }
                        console.log("result.pin: "+result.pin);
                        console.log("result.store_id: "+result.store_id);
                        if (result.pin != false || result.store_id == 0) {
                            console.log("Product has been pinned");
                            $('#pinButton').removeClass('fa-rotate-90');
                            $('#pinButton').attr('pin_id', result.pin_id);
                            $('#pinButton').attr('data-callback', 'app.products.removePinFavorite');
                        }

                        /*
                        if (result.pin != false || data_pin == 'true') {
                            
                            $('#pin_' + result.id + ' i').removeClass('fa-pin');
                            $('#pin_' + result.id + ' i').addClass('fa-pinned');
                        
                            $('#pin_' + result.id).attr('pin_id', result.id)
                            $('#pin_' + result.id).attr('data-callback', 'app.products.removePinFavorite');

                            if (result.year) {

                                var datePin = new Date(result.year + "-" + result.month + "-" + result.day + " " + result.hour);
                                if (navigator.globalization) {
                                    navigator.globalization.dateToString(datePin, function (date) {
                                        console.log('date: ' + date.value + '\n');
                                        $('#DatePinDetail_' + result.id).children('span').html(date.value);
                                        $('#DatePinDetail_' + result.id).removeClass('hide');
                                    },
                                        function () {
                                            console.log('Error getting dateString\n');
                                        },
                                        {formatLength: 'short', selector: 'date and time'});
                                }
                            }
                        }
                        */
                        if (!result.regular_price || result.regular_price == '$0.00') {
                            $('#regular_price').addClass('hide');
                        }

                        if (!result.price || result.price == '$0.00') {
                            $('#sale_price').addClass('hide');

                            $('#regular_price').removeClass('red');
                            $('#regular_price').addClass('green');
                        }
                        
                        if (result.images[0].thumb.indexOf('thumb.png') > -1){
                            $('#slider').addClass('hide');
                            $('#pagSlide').addClass('hide');
                        } else {
                            $('#slider .swipe-wrap').html('');
                            $('#pagSlide').html('');

                            $.each(result.images, function (i, img) {
                                //console.log(JSON.stringify(img));

                                var cl = i == 0 ? ' class="active"' : '';

                                $('#slider .swipe-wrap').append('<div id="imgSlide' + i + '" class="itemSlide">' + '<img src="' + img.original + '" alt="" class="img-responsive"/></div>');
                                $('#pagSlide').append('<li ><a id="item' + i + '" href="#" ' + cl + ' data-poss="' + i + '" data-callback="app.products.goSlide">' + (i + 1) + '</a></li>');
                            });

                            window.mySwipe = null;

                            setTimeout( function(){
                                window.mySwipe = $('#slider').Swipe({
                                    continuous: false,
                                    callback: function (pIndex, element) {
                                        $('#item' + pIndex).addClass('active');

                                    }
                                }).data('Swipe');
                            },500);
                        }
                        app.bindEvents();
                    }
                );
            },
            goSlide: function (e) {
                console.log('app.products.goSlide()');
                window.mySwipe.slide($(e).attr('data-poss'), 400);
            },
            backHome: function () {
                console.log('app.products.backHome()');
                
                app.home.showStoreList();
                
//                app.draw('#content', '', '', {}, 'slideBack', function (e) {
//
//                    $(window).scrollTop(app.views.scrool);
//
//                    if (app.home.totalPages > 1) {
//                        $(window).on("scroll", function () { //pagination
//                            //                        console.log(($(this).scrollTop() + $(this).height()) +' >= ' + $('#storeList').parent().height());
//                            if ($(this).scrollTop() + $(this).height() >= $('#storeList').parent().height()) {
//
//                                app.home.paginacao('stores/');
//                            }
//                        });
//                    }
//                    app.bindEvents();
//
//                });
            },
            backStoreDad : function(e){
                console.log('app.products.backStoreDad()');
                
                var aux = true;
                var store_id = 0;
                
                while(aux){
                    
                    store_id = app.home.store_id.pop();
                    
                    if(store_id != app.home.oStoreDetail.id)
                        aux = false;
                }
                
                app.home.getStoreDetail(store_id, true, 'true');
                
            },
            backProductList: function (e) {
                console.log('app.products.backProductList()');

                app.draw('#content', '', '', {}, 'slideBack', function (e) {

                    app.bindEvents();

                });
            },
            shareProduct: function (e) {
                console.log('app.products.shareProduct()');
                window.plugins.socialsharing.share(
                    app.appName,
                    app.lang.getStr('The subject', 'aplication'),
                    null,
                    'http://ve-staging.herokuapp.com/');
            }
        },
}