var home = {
        home: {
            totalPages: 0,
            currentPage: 0,
            store_id: [],
            storesChild: [],
            oStoreDetail: null,
            init: function (e) {
                console.log('app.home.init()');

                app.push.init();
                
                $('.navbar-toggle').show();

                if (app.homeInitCalled){
                  return;  
                } 
                app.homeInitCalled = 1;
               
                setTimeout(function () {

                    $('#splashView').addClass('hide');

                    $('#optSearch').html(app.lang.getStr('%Search%', 'aplication'));
                    $('#optPinned').html(app.lang.getStr('%Pinned%', 'aplication'));
                    $('#optVMap').html(app.lang.getStr('%V-Map%', 'aplication'));
                    $('#optVNotification').html(app.lang.getStr('%Notification%', 'aplication'));
                    $('#optStore').html(app.lang.getStr('%Stores%', 'homeView'));
                    $('#optProduct').html(app.lang.getStr('%Products%', 'aplication'));
                    
                    backStack = new Array();
                    app.search.typeAhead();
                    app.views.generateMenu();
                    
                }, 2000);
                            
                app.bindEvents();

            },
            logout: function (e) {
                window.localStorage.removeItem("user_token");
                app.login.init();
            },
            backCoverPage: function (e) {
                console.log('app.home.backCoverPage()');
                
                $('#menuNavBar').addClass('hide');
                $('#backMenuNavBar').addClass('hide');
                $('body').css('padding-top', '10px');
                
                app.draw(
                    '#content',
                    '#homeView',
                    'homeView',
                    {},
                    '',
                    function () {
                        app.bindEvents();
                    }
                );
                

            },
            showStoreListPre: function (e) {
                console.log('app.home.showStoreListPre');
                app.views.backStack = new Array();
                app.views.setDefaults();
                showHomeMenu();
                app.views.generateMenu2();

                $('#storeList').html('<img src="img/load_image.gif" style="width: 48px;">');
                $('.carousel').carousel({
                    interval: 3000
                });


                app.home.oStoreDetail = null;
                        
                app.webservice.get(
                    'stores/?q[id_eq]=201',
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));

                        app.views.stores = result.stores;
                        app.views.backStack.push("StoreDetail:"+app.views.stores[0].id+":home");
                        app.home.storeDetail();
                    },
                    function (e) {
                        console.log(JSON.stringify(e));
                        app.views.loadView.hide();
                       
                    }
                );

                app.bindEvents();
            },
            showStoreList: function (e) {
                console.log('app.home.showStoreList');
                //mixpanel.track("Home");
                app.views.setDefaults();
                var homeDeptId = -1;
                if (!e){
                    showHomeMenu();
                homeDeptId = app.views.generateMenu2();
                    
                $('.carousel').carousel({
                    interval: 3000
                });
                if (homeDeptId > -1){
                    req = 'stores/?q[store_departments_id_eq]=' + homeDeptId;
                } else {
                    req = 'stores/';
                    
                }
                app.draw(
                    '#content',
                    '#storeListView',
                    'homeView',
                    {
                    },
                    '',
                    function () {

                        $('#storeList').html('<img src="img/load_image.gif" style="width: 48px;">');
                        $('#storeTitle').addClass('hide');
                        app.home.oStoreDetail = null;
                        
                        app.webservice.get(
                            req,
                            {},
                            function (result) {
                                console.log(JSON.stringify(result));

                                $('#storeList').html('');

                                app.views.backStack.push("StoreList");
                                if (result.stores.length > 1) {
                                    app.views.stores = new Array();

                                    app.home.showStores(result,false,false,1);

                                    app.home.currentPage = 1;
                                    app.home.totalPages = result.pages;

                                    if (app.home.totalPages > 1) {

                                        $(window).unbind('scroll');

                                        $(window).on("scroll", function () { //pagination
                                            if (($(this).scrollTop() + $(this).height())*app.home.currentPage >= $('#storeList').parent().height()) {
                                                if (app.views.scrollPending == 0) {
                                                    app.views.scrollPending = 1;
                                                    app.home.paginacao('stores/', {},'stores');
                                                }
                                            }
                                        });
                                    }
                                    
                                    // Always hide filter since the departments are on the menu anyway
                                    app.home.getDepartment(true);
                                    
                                } else {
                                    app.views.stores = result.stores;
                                    console.log(JSON.stringify(app.views.stores));
                                    $('#rowStoreFilter').hide();
                                    //app.views.backStack.push("StoreDetail:"+app.views.stores[0].id);
                                    app.home.storeDetail();
                                }
                            },
                            function (e) {
                                console.log('error');
                                console.log(JSON.stringify(e));

                                app.views.loadView.hide();
                        
                            }
                        );

                        app.bindEvents();
                    }
                );
                }
            },
            openWaze: function(e){
                console.log("store_index: "+$(e).attr('store_index'));
                var store = app.home.oStoreDetail;
                console.log("store: "+JSON.stringify(store));
                url = "https://waze.com/ul?ll="+store.latitude+","+store.longitude+"&navigate=yes";
                console.log("url: "+url);
                cordova.InAppBrowser.open(url, '_system', 'clearcache=yes,clearsessioncache=yes');
            },
            storeDetail: function (e) {
                console.log('app.home.storeDetail()');
                var store_id;

                if ($(e).attr('store_id')) {
                    console.log("Trying to hide menu...");
                    hideHomeMenu();
                    
                    store_id = $(e).attr('store_id');
                    app.views.backStack.push("StoreDetail:"+store_id);
                    
                } else {
                    
                    store_id = app.views.stores[0].id;
                    
                }
                mixpanel.track("Store",{"store_id":store_id });
                //app.views.backStack.push("StoreDetail:"+store_id); //Moving to before call

                var btBack = $(e).attr('store_id') ? true : false;
                
                if($(e).attr('dadStore')!=='false'){
                    app.views.auxBackFuc = 'storesList';
                }
                app.home.getStoreDetail(store_id, btBack, $(e).attr('dadStore'));
                
            },
            getStoreDetail: function(store_id, btBack, dadStore){
                console.log('app.home.getStoreDetail()');
                app.views.loadView.show();
                
                app.webservice.get(
                    'stores/' + store_id,
                    {},
                    function (result) {
                        console.log("store detail: "+JSON.stringify(result));
                        app.views.scrool = $(window).scrollTop();
                        app.home.oStoreDetail = result;
                        app.home.showStoreDetail(result, btBack, dadStore);
                        app.views.loadView.hide();
                    },
                    function (e) {
                        console.log(JSON.stringify(e));
                        app.views.loadView.hide();
                        
                    }
                );
            },
            showStoreDetail: function(store, btBack, dadStore){
                console.log('app.home.showStoreDetail');
                var aboutStripped;
                app.webservice.get(
                    'stores/' + store.id + '/categories',
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));
                        
                        aboutStripped = stripAbout(store.about);
                        if (store.price)
                            store_price = store.price;
                        else
                            store_price = '';
                        console.log("store_price: "+store_price);
                        app.draw(
                            '#content',
                            '#ProductView',
                            'ProductView',
                            {
                                index: store.id,
                                name: stripLeadingTag(store.formatted_name),
                                city: store.city,
                                uf: store.state,
                                logo: store.logo,
                                featured_product : !store.featured_product ? '' : store.featured_product,
                                about: convertLinks2(aboutStripped),
                                dadStore: dadStore,
                                favorite: store.favorite,
                                price: store_price
                            },
                            '',
                            function () {
                                
                                var hasImage = false;
                                if (store.logo.indexOf('medium.png') == -1){
                                    hasImage = true;
                                }
                                if (!hasImage){
                                    $('#storeImageProductView').addClass('hide');
                                    $('#buttonRow').addClass('hide');
                                }
                                if (!store.chat_button || !hasImage){
                                    $('#chatButton').addClass('hide');
                                }
                                if (!store.contact_button || !hasImage){
                                    $('#contactButton').addClass('hide');
                                }
                                if (!store.favorite_button || !hasImage){
                                    $('#favoriteButton').addClass('hide');
                                }
                                if (!store.waze_button || !hasImage){
                                    $('#wazeButton').addClass('hide');
                                }
                                
                                storeBought = false;
                                for (i=0; i<app.clientStores.length; i++){
                                    if (app.clientStores[i] == store.id){
                                        storeBought = true;
                                        break;
                                    }    
                                }
                                if (store.paid != true || storeBought) {
                                    store.paid = false;
                                    app.products.categories = result.categories;
                                    if (store.logo.indexOf('medium.png') == -1){
                                        app.home.showStoreTabs(result.categories,store,dadStore);
                                    } else {
                                        $('#list-stores').html('');
                                        $('#productList').html('');
                                    }
                                } else {
                                    cordova.getAppVersion.getPackageName().then(function (packageName) {
                                        console.log("packageName: "+packageName);
                                        console.log("product: "+packageName+"."+store.id);
                                        product_name = packageName+"."+store.id;
                                        console.log("product_name: "+product_name);
                                        inAppPurchase
                                        .getProducts([product_name])
                                        .then(function (products) {
                                            console.log(JSON.stringify(products));
                                            /* Update the price */
                                            price = products[0].price;
                                            $('#purchaseButton').text("Buy "+price);
                                            $('#purchaseDiv').removeClass('hide');
                                        })
                                        .catch(function (err) {
                                            console.log(JSON.stringify(err));
                                        });        
                                    });
                                }
                            }
                        );
                        app.views.generateMenu2();
                    },
                    function (e) {
                        console.log(JSON.stringify(e));
                        app.views.loadView.hide();
                        
                    }
                );
            },
            showStoreTabs: function(categories,store,dadStore){
                console.log("app.home.showStoreTabs()");
                app.home.addCategorie2(categories);

                if (app.views.stores.length == 1) {

                    $('#storeProductList').css('min-height', ($(window).height() - $('.navbar-fixed-top').height() - 20));
                                    
                }
                if (app.views.backStack.length > 1){
                    var ind = app.views.backStack.length-2;
                    $('#backStack').html(app.views.backStack[ind]);
                    $('#backLink').removeClass('hide');
                }else{
                    $('#backLink').addClass('hide');
                }
                                
                if (store.corporate) {

                    $('#store_name').addClass('hide');
                    $('#backLink').addClass('hide');
                    $('#btFav_0').addClass('hide');
                }
                                
                if (store.register){
                    $('#registerLink').removeClass('hide');
                }
                $('#storeCategorie').change(function () {
                    app.home.filterByCategory($('#storeCategorie'));
                });
                console.log("store.favorite: "+store.favorite);
                if (store.favorite == true) {
                    $('#favoriteButton').removeClass('fa-star-o');
                    $('#favoriteButton').addClass('fa-star');
                    $('#favoriteButton').attr('data-callback', 'app.home.removeFavorite');
                    //$('#btFav_' + store.id).html('Clear Favorite');
                }
                
                var hasImage = false;
                if (store.logo.indexOf('medium.png') == -1){
                    hasImage = true;
                }
                if(!aboutStripped || aboutStripped== '<p></p>'){
                    $('#AboutDetail').addClass('hide');
                }
                
                if(!store.featured_product || store.featured_product== '<p></p>' || store.featured_product==''){
                    $('#featuredDetail').addClass('hide');
                }
                if (store.logo.indexOf('medium.png') > -1){
                    $('#storeImageProductView').addClass('hide');
                }
                if (store.map_button){
                    $('#mapButton').removeClass('hide');
                }
                if (!store.chat_button || !hasImage){
                    $('#chatButton').addClass('hide');
                }
                if (!store.contact_button || !hasImage){
                    $('#contactButton').addClass('hide');
                }
                if (!store.favorite_button || !hasImage){
                    $('#favoriteButton').addClass('hide');
                }
                if (!store.waze_button || !hasImage){
                    $('#wazeButton').addClass('hide');
                }
                if (store.pdf_button_link){
                    $('#pdfButton').removeClass('hide');
                    $('#pdfButton').attr('customlink', store.pdf_button_link);
                }
                if (store.video_button_link){
                    $('#videoButton').removeClass('hide');
                    $('#videoButton').attr('customlink', store.video_button_link);
                }
                                
                if(store.stores_count>0){
                                    
                    $('#storeOptions').removeClass('hide');
                    var storeTabName, productTabName;
                    if (store.store_tab)
                    {
                        $('#liOptStoreLink').text(store.store_tab);
                    }
                    if (store.product_tab)
                    {
                        $('#liOptProductLink').text(store.product_tab);
                    }
                                    
                    $('#list-stores').html('<img src="img/load_image.gif" style="width: 48px;">');
                    $('#productList').html('<img src="img/load_image.gif" style="width: 48px;">');
                                    
                    app.home.getStoresChild(store.id);

                                    
                }else{
                                    
                    $('#storeOptions').addClass('hide');
                    $('#productListDiv').removeClass('hide');
                    //$('#liOptStore').addClass('hide');
                    $('#storeTabs').addClass('hide');
                    $('#productList').html('<img src="img/load_image.gif" style="width: 48px;">');
                    $('#list-stores').html('');
                        
                }
                console.log("Back functionality: dadStore:"+dadStore+" app.home.oStoreDetail.id:"+app.home.oStoreDetail.id);
                if(dadStore=='false' && app.views.auxBackFuc!='search'){
                    app.views.backFunction = app.products.backStoreDad;
                    $('#btBack').attr('dad_id', app.home.store_id[app.home.store_id.length-1]);

                }else if(app.views.auxBackFuc=='storesList'){
                                    
                    app.views.backFunction = app.products.backHome;

                }else if(app.views.auxBackFuc=='producs'){
                                    
                    app.views.backFunction = app.products.returnToProductList;

                }else if(app.views.auxBackFuc=='search'){
                    app.views.backFunction = app.search.init;

                }
                app.home.store_id.push(app.home.oStoreDetail.id);
                       
                app.products.showProductStoreList(store.id,store.stores_count);

                app.bindEvents();
            },
            getStoresChild: function(store_id){
                console.log('app.home.getStoresChild');
                
                app.webservice.get(
                    'stores/'+store_id+'/stores',
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));
                        
                        $('#list-stores').html('');
                        
                        app.home.storesChild = result.stores;
                        
                        app.home.addStore(result.stores, '#list-stores',0, true,'false',1);
                        app.home.currentPage = 1;
                        app.home.totalPages = result.pages;
                                    
                        $(window).on("scroll", function () {
                            if (($(this).scrollTop() + $(this).height())*app.home.currentPage >= $('#list-stores').parent().height()) {
                                if (app.views.scrollPending == 0) {
                                    app.views.scrollPending = 1;
                                    app.home.paginacao('stores/'+store_id+'/stores', {},'storeschild');
                                }
                            }
                        });
                    },
                    function (err) {
                        console.log(err);
                        
                        app.views.loadView.hide();
                        
                    }
                );
            },
            showStoresChild: function(e){
                console.log('app.home.showStoresChild');
                
                $('#liOptStore').addClass('active');
                $('#storesListDiv').removeClass('hide');
                
                $('#liOptProduct').removeClass('active');
                $('#productListDiv').addClass('hide');
                
            },
            showStoresProducts: function(e){
                console.log('app.home.showStoresProducts');
                
                $('#liOptProduct').addClass('active');
                $('#productListDiv').removeClass('hide');
                
                $('#liOptStore').removeClass('active');
                $('#storesListDiv').addClass('hide');
                
            },
            paginacao: function (url, options,type) {
                console.log('app.view.home.paginacao');
                if (app.home.totalPages > app.home.currentPage) {

                    app.home.currentPage += 1;
                    options['page'] = app.home.currentPage;
                    app.webservice.get(
                        url,
                        options,
                        function (result) {
                            console.log(JSON.stringify(result));
                            if (type.indexOf('storeschild') == 0) {
                                app.home.addStore(result.stores, '#list-stores',0, true,'false',app.home.currentPage);
                            }else if(type.indexOf('favorites') == 0){
                                app.home.addFavorite(result.stores, '#favoriteList', 0, true, 'false',app.home.currentPage);
                            }else{
                                    
                                app.home.showStores(result,false,false,app.home.currentPage);
                            }
                            app.views.scrollPending = 0;
                        },
                        function (err) {
                            console.log(err);

                            app.views.loadView.hide();
                            app.views.scrollPending = 0;

                        }
                    );
                } else {
                    app.views.scrollPending = 0;
                }
                
            },
            addCategorie2: function (cats) {
                console.log('app.home.addCategorie2');
                var countCat = 0;
                $('#categoryListProductView').html('');
                $.each(cats, function (index, c) {

                    if (c.count_products != 0) {

                        countCat += 1;
                        if (c.subcategories.length > 0) {
                            var subCategoryHtml = '';
                            var subIds = '';
                            $.each(c.subcategories, function (i, sub) {
                                subIds = subIds.concat(sub.id+" ");
                                if (sub.count_products != 0) {
                                    var str = '<a href="#" data-callback="app.home.filterByCategory" class="list-group-item" cat_id="' + sub.id + '" cat_name="'+sub.name+'"><span style="padding-left:10px" id="cat_name">' + sub.name + '</span></a>';
                                    subCategoryHtml = subCategoryHtml.concat(str);
                                }
                            });
                            $('#categoryListProductView').append('<a href="#" data-callback="app.home.filterByCategory" class="list-group-item" cat_id="'+c.id+'" sub_ids="'+subIds+'" cat_name="'+c.name+'"><span id="cat_name">' + c.name + '</span></a>');
                            $('#categoryListProductView').append(subCategoryHtml);
                        } else {
                            $('#categoryListProductView').append('<a href="#" data-callback="app.home.filterByCategory" class="list-group-item" cat_id="'+c.id+'" cat_name="'+c.name+'"><span id="cat_name">' + c.name + '</span></a>');
                        }
                    }
                });
                if (countCat < 2) {
                    $('#filterPanelProductView').addClass('hide');
                }
            },
            addCategorie: function (cats) {
                console.log('app.home.addCategorie');
                $('#storeCategorie').append('<option value="">' + app.lang.getStr('%Categories%', 'aplication') + '</option>');
                var countCat = 0;

                $.each(cats, function (index, c) {

                    if (c.count_products != 0) {

                        countCat += 1;

                        $('#storeCategorie').append('<option value="' + c.id + '">' + c.name + '</option>');

                        if (c.subcategories.length > 0) {
                            $.each(c.subcategories, function (i, sub) {

                                if (sub.count_products != 0) {

                                    $('#storeCategorie').append('<option value="' + sub.id + '" style="padding-left: 5px;">' + sub.name + '</option>');
                                }

                            });
                        }

                    }
                });

                if (countCat == 0) {
                    $('#storeCategorie').addClass('hide');
                }
            },
            filterByCategory: function (e) {
                console.log('app.home.filterByCategory()');
                $('#filterModalProductView').modal('hide');

                var cat_name = $(e).attr('cat_name');
                $('#productList').html('<img src="img/load_image.gif" style="width: 40px;"/>');

                $('#catFilterNameProductView').html(cat_name);
                $('#clearFilterProductView').removeClass('hide');
                $('#catFilterProductView').addClass('hide');

                app.webservice.get(
                    'stores/' + app.home.oStoreDetail.id + '/products/?q[product_category_id_eq]=' + $(e).attr('cat_id'),
                    {},
                    function (result) {
                        //console.log(JSON.stringify(result));
                        $('#productList').html('');

                        if (result.products.length > 0)
                            app.products.addProducts(result.products);
                        //else 
                    },
                    function (e) {
                        //console.log(JSON.stringify(e));
                        app.views.loadView.hide();
                    }
                );
            },
            clearFilter: function(e){
                console.log('app.home.clearFilter()');
                
                $('#catFilterNameProductView').html('');
                $('#clearFilterProductView').addClass('hide');
                $('#catFilterProductView').removeClass('hide');

                
                $('#productList').html('<img src="img/load_image.gif" style="width: 40px;"/>');
                
                //window.localStorage.removeItem("productCatName");
                //window.localStorage.removeItem("productCat");
                
                //app.products.showProductList();
                console.log('app.home.oStoreDetail.id'+app.home.oStoreDetail.id);
                app.products.showProductStoreList(app.home.oStoreDetail.id,app.home.stores_count);

                
            },
            filterByDepartmentFromMenu: function(e){
                console.log('app.home.filterByDepartmentFromMenu()');
                hideHomeMenu();
                app.views.backStack = new Array();
                if ($(e).attr('dep_id') == '0') {
                    app.views.goHome();
                }else{
                    app.views.backStack.push("StoreListByDept:"+$(e).attr('dep_id')+":"+$(e).attr('dep_name')+":"+"filter");
                    app.home.storeListByDepartment($(e).attr('dep_id'),$(e).attr('dep_name'),true);
                }
            },
            filterByDepartment: function(e){
                console.log('app.home.filterByDepartment()');
                app.views.backStack.pop();
                app.views.backStack.push("StoreListByDept:"+$(e).attr('dep_id')+":"+$(e).attr('dep_name')+":"+"noFilter");
                app.home.storeListByDepartment($(e).attr('dep_id'),$(e).attr('dep_name'),false);
            },
            storeListByDepartment: function(dep_id, dep_name, hideFilter){
                console.log('app.home.storeListByDepartment()');
                //app.views.loadView.show();
                $('#filterStoreModal').modal('hide');
                app.draw(
                    '#content',
                    '#storeListView',
                    'storeListView',
                    {
                    },
                    '',
                    function () {

                        //$('#storeList').html('<img src="img/load_image.gif" style="width: 48px;">');

                
                        app.webservice.get(
                            'stores/?q[store_departments_id_eq]=' + dep_id,
                            {},
                            function (result) {
                                console.log(result);
                        
                                //app.views.loadView.hide();
                                //$('#filterStoreModal').modal('hide');
                        
                                app.views.stores = new Array();
                                $('#storeList').html('');
                                if (hideFilter){
                                    $('#storeFilter').addClass('hide');
                                    $('#storeTitle').removeClass('hide');
                                    $('#storeTitleName').html(dep_name);
                                }else{
                                    $('#storeTitle').addClass('hide');
                                    $('#clearFilter').removeClass('hide');
                                    $('#deptFilter').addClass('hide');
                                    $('#deptFilterName').html(dep_name);
                                }
                                if (app.views.backStack.length < 2) {
                                    $('#backLink').addClass('hide');                        
                                } else {
                                    $('#backLink').removeClass('hide');                        
                                }
                                app.home.showStores(result, true, hideFilter,1);

                                app.home.currentPage = 1;
                                app.home.totalPages = result.pages;

                                if (app.home.totalPages > 1) {

                                    $(window).on("scroll", function () { //pagination
//                                        console.log(($(this).scrollTop() + $(this).height()) +' >= ' + $('#storeList').parent().height());
                                        if ($(this).scrollTop() + $(this).height() >= $('#storeList').parent().height()) {

                                            app.home.paginacao('stores?department=' + dep_id, {},'stores');
                                        }
                                    });
                                }
                                app.bindEvents();
                                //$(window).scrollTop(0);

                            },
                            function (e) {
                                console.log(JSON.stringify(e));
                                //app.views.loadView.hide();
                            }
                        );
                        
                        app.bindEvents();
                }
                );
            },
            getDepartment: function(hideFilter){
                console.log('app.home.getDepartment()');
                app.webservice.get(
                    'departments',
                    {},
                    function (result) {
                        $('#storeDepartmentList').html('');
                        //console.log(JSON.stringify(result));
                        $.each(result.departments, function (i, dep) {
                            app.draw(
                                '#storeDepartmentList',
                                '#byDepartmentItem',
                                'byDepartmentItem',
                                {
                                    id: dep.id,
                                    name: stripLeadingTag(dep.name)
                                },
                                'append',
                                function () {
                                }
                            );
                        });
                        
                        $('#storeDepartmentList a').each(function(){
                            $(this).attr('data-callback','app.home.filterByDepartment');
                        });
                        
                        if (result.departments.length == 0 || hideFilter){
                            $('#storeFilter').addClass('hide');
                        } else {
                            $('#storeFilter').removeClass('hide');
                        }
                        app.bindEvents();
                    },
                    function (err) {
                        console.log(JSON.stringify(err));
                        app.views.loadView.hide();
                    }
                );
            },
            showStores: function (result, search, hideFilter,currentPage) {
                console.log('app.home.showStores');
                
                search = !search ? false : true;
                
                var i = app.views.stores.length;
                app.views.stores = new Array();

                $.each(result.stores, function (i, s) {
                    if (result.stores.length==1 || !s.corporate) {
                        //console.log(JSON.stringify(s));
                        app.views.stores.push(s);
                    }
                });

                if(app.views.stores.length==0){
                    $('#storeList').html('<h3 class="noProduct">'+app.lang.getStr('%No store found%', 'aplication')+'</h3>');
                }else if (app.views.stores.length > 1 || hideFilter==false){
                    app.home.addStore(app.views.stores, '#storeList', i, search, 'true',currentPage);
                } else {
                
                    app.views.stores = result.stores;
                    $('#rowStoreFilter').hide();
                    if (app.views.backStack[0].indexOf("StoreList") == 0)
                        app.views.backStack.pop();//only if item on top of stack is storelist
                    app.views.backStack.push("StoreDetail:"+app.views.stores[0].id);
                    app.home.storeDetail();
                }
            },
            showFavorites: function (result, search, hideFilter,currentPage) {
                console.log('app.home.showSFavorites');
                
                search = !search ? false : true;
                
                var i = app.views.stores.length;
                app.views.stores = new Array();

                $.each(result.favorites, function (i, s) {
                    if (result.favorites.length==1 || !s.corporate) {
                        app.views.stores.push(s);
                    }
                });

                if(app.views.stores.length==0){
                    $('#storeList').html('<h3 class="noProduct">'+app.lang.getStr('%No store found%', 'aplication')+'</h3>');
                }else if (app.views.stores.length > 0 || hideFilter==false){
                    app.home.addFavorite(app.views.stores, '#favoriteList', i, search, 'true',currentPage);
                }
            },
            addStore: function(storeArray, divId, arrayIndex, search, dadStore,currentPage){
                console.log('app.home.addstore');
                var i = arrayIndex*currentPage;
                var aboutStripped;

                $.each(storeArray, function (index, store) {
                    aboutStripped = stripAbout(store.about);

                    app.draw(
                        divId,
                        '#storeItem',
                        'storeItem',
                        {
                            formattedName: stripLeadingTag(store.formatted_name),
                            city: store.city,
                            uf: store.state,
                            logo: store.logo,
                            about: addReadMore2(aboutStripped),
                            featured_product : !store.featured_product ? '' : store.featured_product,
                            id : store.id,
                            index: i,
                            dadStore: dadStore,
                            favorite: store.favorite
                        },
                        'append',
                        function () {
                            //console.log("store from lis: "+JSON.stringify(store));
                            if (store.favorite == true) {
                                $('#favoriteButton').removeClass('fa-star-o');
                                $('#favoriteButton').addClass('fa-star');
                                $('#favoriteButton').attr('data-callback', 'app.home.removeFavorite');
                                //$('#btFav_' + i + ' span').html('Clear Favorite');
                            }
                            
                            if (storeArray.length == 1 && search==false && dadStore=='true') {
                                $('.storeItem').css('height', ($(window).height() - $('.navbar-fixed-top').height() - 20));
                            }

                            if(!aboutStripped || aboutStripped== '<p></p>'){
                                $('#aboutStore_'+i).addClass('hide');
                            }else{
                                if (storeArray.length > 1)
                                    $('#aboutStore_'+i).ellipsis({row:3});
                            }
                            
                            if(!store.featured_product || store.featured_product== '<p></p>' || store.featured_product==''){
                                $('#featured_'+i).addClass('hide');
                            }
                            
                            if (store.product_tab){
                                $('#btnProduct_'+i).html(store.product_tab);
                            }
                            if(!dadStore){
                                $('#btnContact_'+i).attr('dadStore','false');
                                $('#btnProduct_'+i).attr('dadStore','false');
                            }
                            if (store.logo.indexOf('medium.png') > -1){
                                $('#storeImage_'+store.id).addClass('hide');
                                $('#storeDetail_'+store.id).removeClass('col-xs-8');
                                $('#storeDetail_'+store.id).removeClass('col-sm-8');
                                $('#storeDetail_'+store.id).addClass('col-xs-12 col-sm-12');
                                $('#readMore_'+i).addClass('hide');
                                $('#storeItem_'+store.id).attr('data-callback', '');
                            }
                            
                            //app.purchase.restorePurchases();
                            storeBought = false;
                            for (i=0; i<app.clientStores.length; i++){
                                if (store.id == app.clientStores[i]){
                                    storeBought = true
                                    break;
                                }
                            }
                            if (store.paid && store.paid == true && !storeBought){
                                $('#buyButton_'+store.id).removeClass('hide');
                            }
                            i++;
                            app.bindEvents();
                        }
                    );
                });  
            },
            addFavorite: function(storeArray, divId, arrayIndex, search, dadStore,currentPage){
                console.log('app.home.addstore');
                var i = arrayIndex*currentPage;
                $.each(storeArray, function (index, store) {
                    if (store.about){
                        aboutStripped = stripAbout(store.about);
                    } else {
                        aboutStripped = "";
                    }
                    app.draw(
                        divId,
                        '#favoriteItem',
                        'favoriteItem',
                        {
                            name: stripLeadingTag(store.formatted_name),
                            city: store.city,
                            uf: store.state,
                            id : store.id,
                            about: aboutStripped,
                            index: i,
                            dadStore: dadStore,
                            logo: store.logo,
                            favorite : store.favorite
                        },
                        'append',
                        function () {
                            //console.log("store from lis: "+JSON.stringify(store));
                            
                            if (storeArray.length == 1 && search==false && dadStore=='true') {
                                $('.storeItem').css('height', ($(window).height() - $('.navbar-fixed-top').height() - 20));
                            }

                            i++;
                            app.bindEvents();
                        }
                    );
                });  
            },
            saveFavorite: function (e) {
                console.log('app.home.saveFavorite');

                app.webservice.post(
                    'favorites/',
                    'POST',
                    {
                        id: $(e).attr('store_index')
                    },
                function (result) {
                    console.log(JSON.stringify(result));
                    //change bt in store list
                    $('#favoriteButton').removeClass('fa-star-o');
                    $('#favoriteButton').addClass('fa-star');
                    $('#favoriteButton').attr('data-callback', 'app.home.removeFavorite');
                    //$('#btFav_' + $(e).attr('store_index') + ' span').html('Clear Favorite');

                    //change bt in detail store
                    //$(e).children('span').removeClass('icon-star');
                    //$(e).children('span').addClass('icon-star-filled');
                    //$(e).attr('data-callback', 'app.home.removeFavorite');

                },
                    function (e) {
                        console.log(JSON.stringify(e));
                    }
                );
            },
            removeFavorite: function (e) {
                console.log('app.home.removeFavorite');

                app.webservice.post(
                    'favorites/' + $(e).attr('store_index'),
                    'DELETE',
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));
                        $('#favoriteButton').removeClass('fa-star');
                        $('#favoriteButton').addClass('fa-star-o');
                        $('#favoriteButton').attr('data-callback', 'app.home.saveFavorite');
                        //$('#btFav_' + $(e).attr('store_index') + ' span').html('Make Favorite');

                        //change bt in detail store
                        //$(e).children('span').removeClass('icon-star-filled');
                        //$(e).children('span').addClass('icon-star');
                        //$(e).attr('data-callback', 'app.home.saveFavorite');

                    },
                    function (e) {
                        console.log(JSON.stringify(e));
                    }
                );
            },
            getFavorites: function(e){
                console.log('app.home.showFavorites()');
                mixpanel.track("Favorites");
                app.views.backStack.pop();

                app.views.backStack.push("Favorites");
                hideHomeMenu();
                
                app.draw(
                    '#content',
                    '#favoriteView',
                    'favoriteView',
                    {
                    },
                    '',
                    function () {

                        app.webservice.get(
                            'favorites',
                            {},
                            function (result) {
                                console.log(JSON.stringify(result));
                                app.views.stores = new Array();
                                $('#favoriteList').html('');
                        
                                if (app.views.backStack.length > 1){
                                    var ind = app.views.backStack.length-2;
                                    $('#backStack').html(app.views.backStack[ind]);
                                    $('#backLink').removeClass('hide');
                                }else{
                                    $('#backLink').addClass('hide');
                                }
                                
                                app.home.showFavorites(result, true, true,1);

                                app.home.currentPage = 1;
                                app.home.totalPages = result.pages;

                                if (app.home.totalPages > 1) {

                                    $(window).on("scroll", function () { //pagination
                                        if ($(this).scrollTop() + $(this).height() >= $('#favoriteList').parent().height()) {

                                            app.home.paginacao('favorites', {},'favorites');
                                        }
                                    });
                                }
                                app.bindEvents();

                            },
                            function (e) {
                                //console.log(JSON.stringify(e));
                            }
                        );

                        app.bindEvents();
                    }
                );
            },
            pdfButton: function (e) {
                var uri = app.videoUrl+'index_pdf.php?link=';
                customLink = $(e).attr('customLink');
                var url = uri+encodeURIComponent(customLink)
                app.home.startVideo(url);
            },
            videoButton: function (e) {
                var uri = app.videoUrl+'index_video.php?link=';
                customLink = $(e).attr('customLink');
                var url = uri+encodeURIComponent(customLink)
                app.home.startVideo(url);
            },
            startVideo: function (url) {
                    
                app.views.browserRef = cordova.InAppBrowser.open(url, '_blank', 'location=no,clearcache=yes,clearsessioncache=yes'); 
                
                var loadingSpinner = false;
                app.views.browserRef.addEventListener('loadstop', function(event) {
                    navigator.notification.activityStop();
                    if (event.url.match("mobile/close")) {
                        app.views.browserRef.close();
                    }
                });
                app.views.browserRef.addEventListener('loadstart', function(event) {
                    if (!loadingSpinner){
                        navigator.notification.activityStart("Please Wait", "Loading...");
                        loadingSpinner = true;
                    }else{
                        navigator.notification.activityStop();
                    }
                });
                app.views.browserRef.addEventListener('loaderror', function(event) {
                    navigator.notification.activityStop();
                    loadingSpinner = false;
                });
                
            },
            showContact: function (e) {
                console.log('app.home.showContact');
                console.log($(e).attr('store_index'));
                console.log($(e).attr('dadStore'));
                
                var store = '';
                
                if($(e).attr('dadStore')=='true' && app.home.oStoreDetail){
                    
                    store = app.home.oStoreDetail;
                    
                }else{
                    
                    store = $(e).attr('dadStore')=='true' ? app.views.stores[$(e).attr('store_index')] : app.home.storesChild[$(e).attr('store_index')];
                    
                }
                mixpanel.track("Contact",{"store_id":store.id });
                $('#modalContact .modal-title').html(stripLeadingTag(store.name));

                $('#btContactClose').html(app.lang.getStr('%Close%', 'contactView'));

                app.draw(
                    '#modalContact .modal-body',
                    '#contactView',
                    'contactView',
                    {
                        contactName : store.contact ? store.contact: '',
                        phone: store.phone ? store.phone : '',
                        email: store.email ? store.email : '',
                        website: store.website ? store.website : '',
                        websiteView: store.website ? store.website : '',
                        address: store.address,
                        city: store.city,
                        state: store.state,
                        zip: store.zip ? store.zip : ''
                    },
                '',
                    function () {
                        $('#modalContact').modal('show');

                        if (!store.contact || store.contact == '') {
                            $('.contactName').addClass('hide');
                        }

                        if (!store.phone || store.phone == '') {
                            $('.contactPhone').addClass('hide');
                        }

                        if (!store.email || store.email == '') {
                            $('.contactEmail').addClass('hide');
                        }
                        if (!store.website || store.website == '') {
                            $('.contactWebsite').addClass('hide');
                        }
                        if (!store.show_address){
                            $('.contactAddress').addClass('hide');
                        }
                        app.bindEvents();

                    }
                );
            },
            openSite: function (e) {
                console.log("opensite");
                var ref;
                var url = $(e).attr('data-site');
                if (url.indexOf('http') == 0) {
                    app.views.browserRef = cordova.InAppBrowser.open($(e).attr('data-site'), '_blank', 'location=no,clearcache=yes,clearsessioncache=yes,hardwareback=no'); 
                }else{
                    app.views.browserRef = cordova.InAppBrowser.open('http://' + $(e).attr('data-site'), '_blank', 'location=no,clearcache=yes,clearsessioncache=yes,hardwareback=no');  
                }
                var loadingSpinner = false;
                app.views.browserRef.addEventListener('loadstop', function(event) {
                    navigator.notification.activityStop();
                    if (event.url.match("mobile/close")) {
                        app.views.browserRef.close();
                    }
                });
                app.views.browserRef.addEventListener('loadstart', function(event) {
                    if (!loadingSpinner){
                        navigator.notification.activityStart("Please Wait", "Loading...");
                        loadingSpinner = true;
                    }else{
                        navigator.notification.activityStop();
                    }
                });
                app.views.browserRef.addEventListener('loaderror', function(event) {
                    navigator.notification.activityStop();
                    loadingSpinner = false;
                });
            }
        },
}