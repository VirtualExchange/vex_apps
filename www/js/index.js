/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    deviceReady: false,
    // Application Constructor
    initialize: function () {
        console.log('App initialize');
        $.extend(this, appCore);

        app.events();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    events: function () {
        console.log('setEvents');

        console.log('muda o title');
        $('#appTile').html(app.appName);
        $('#splashViewTitle').html(app.appName);
        document.title = app.Name;

        //$('body').css('padding-top', $('#menuNavBar').height() + 20);
        
        document.addEventListener('deviceready', this.onDeviceReady, false);

        /*
        setTimeout(function () {

            if (!app.deviceReady) {
                console.log('app.initialize(): app initialization without device ready.');
                window.localStorage.setItem("token", 83);
                app.deviceReady = true;
                app.lang.config(function () {
                    //app.views.login.init();
                    app.views.home.init();
                    app.webservice.get(
                        'device',
                        {},
                        function (r) {
                            console.log('RESULT DE REGISTRO');
                            //$('#splashView').html('<br/><br/><br/><br/>' + r.push_token)
                            //app.geolocation.start();
                            app.device = r;
                            //console.log("app.device: ",app.device);
                            app.views.chat.checkUnreadMessage();
                        }, function (e) {
                        console.log('RESULT ERROR DE REGISTRO');

                        console.log(JSON.stringify(e));
                    }
                    );
                });
            }
        }, 1000);
        */
        
        window.addEventListener('native.keyboardshow', app.showKeyboard);
        window.addEventListener('native.keyboardhide', app.hideKeyboard);
        
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function () {
        console.log('app.initialize(): app initialization with device ready.');
        window.open = cordova.InAppBrowser.open;
        app.deviceReady = true;
        document.addEventListener("resume", function() {
            console.log("resume");
            app.views.chat.checkUnreadMessage();
        }, false);    
        
        document.addEventListener("offline", function () {
            if(!app.offLine){

                app.offLine = true;
                navigator.notification.alert(app.lang.getStr('%Lost connection to the server.\r\nCheck your internet connection and try again.%', 'aplication'), function () {
                }, app.lang.getStr('%Connection Error%', 'aplication'), app.lang.getStr('%Try again%', 'aplication'));
            }
        }, false);
        
        document.addEventListener("online", function () {
            app.offLine = false;

            if(app.logged){

                app.views.home.init();

            } else{

                //app.views.login.init();
                app.views.home.init();

            }
        }, false);

        if (device && device.platform === 'Android') {
            document.addEventListener("backbutton", function () {
                app.views.goBack();
            }, false);
        }

        //document.addEventListener("backbutton", app.onBackKeyDown, false);

        console.log("ANTES: " + window.localStorage.getItem("token"));

        //window.localStorage.clear();
        console.log(device.platform);
        if (device && device.platform === 'iOS') {

            $('#menuNavBar').css('margin-top','20px');
            //$('#vexCarousel').css('margin-top','20px');
            $('#content').css('padding-top','10px');
            $('#msgCount').css('margin-left', '-25px');
        }

        console.log(window.localStorage.getItem("token"));

        if (!window.localStorage.getItem("token")) {
            console.log('SEM TOKEN');
            app.webservice.registerDevice(
                {
                    device: {
                        kind: (device && device.platform === 'Android') ? '2' : '1',
                        latitude: '111',
                        longitude: '111',
                        radius: '111'
                    }
                },
            function (r) {
                console.log('RESULT DE REGISTRO');
                console.log(JSON.stringify(r));
                window.localStorage.setItem("token", r.token);
                mixpanel.identify(r.id);
                mixpanel.people.set({
                    "device_type": device.platform
                });
                mixpanel.people.set({
                    "device_type": device.platform
                });
                mixpanel.register({
                    "app_id": "57",
                    "app_system" : "staging"
                });                
                app.lang.config(function () {
                    if (app.loginRequired == true) {
                        app.views.login.init();
                    } else {
                        app.views.home.init();
                    }
                    //app.push.register();
                    //app.geolocation.start();
                    //app.views.chat.checkUnreadMessage();
                });
            }, function (e) {
                console.log('RESULT ERROR DE REGISTRO');
                console.log(JSON.stringify(e));
            });

        } else {
            console.log('com TOKEN');
            app.lang.config(function () {

                app.webservice.get(
                    'device',
                    {},
                    function (r) {
                        console.log('RESULT DE REGISTRO');
                        //$('#splashView').html('<br/><br/><br/><br/>' + r.push_token);
                        app.device = r;
                        mixpanel.identify(r.id);
                        mixpanel.register({
                            "app_id": "57",
                            "app_system" : "staging"
                        });                

                        console.log(JSON.stringify(r));
                        app.userToken = window.localStorage.getItem("user_token");

                        if (app.loginRequired == false ) {
                            app.views.home.init();
                        /* Attempt to validate the token */
                        }else if (app.loginRequired == true && app.userToken){
                            app.webservice.get(
                                'departments',
                                {},
                                function (result) {
                                    console.log("successCB");
                                    app.views.home.init();
                                },
                                function (err) {
                                    console.log("errorCB");
                                    app.views.login.init();
                                }
                            );
                        }else{
                            app.views.login.init();
                        }
                    }, function (e) {
                    console.log('RESULT ERROR DE REGISTRO');

                    console.log(JSON.stringify(e));
                }
                );

                //app.geolocation.start();
                //app.views.chat.checkUnreadMessage();
                
            });
        }
        app.push.init();


    },
    onBackKeyDown: function(e){
        e.preventDefault();
    },
    views: {
        currentStore: {},
        scrool: 0,
        stores: [],
        departments: [],
        productsDrawn: [],
        backFunction: null,
        backStack: [],
        homeInitCalled: 0,
        scrollPending: 0,
        browserRef: null,
        loadView: {
            show: function(){
                $('#loadView').removeClass('hide');
            },
            hide: function(){
                $('#loadView').addClass('hide');
            }
        },
        setDefaults: function(){
            
            //configurando espaçamento superior do app
            $('#menuNavBar').removeClass('hide');
            //$('body').css('padding-top', $('#menuNavBar').height() + 20);
            $('#backMenuNavBar').removeClass('hide');

            app.views.loadView.hide();
            
            //stop geo search
            app.geolocation.close();
        },
        goHome: function(e){
            $('#landingPageMenu').removeClass('hide');
            $('#loginSpinner').addClass('hide');
            app.views.chat.checkUnreadMessage();
            //app.views.products.showProductList(e);
            app.views.home.showStoreList();
            //app.views.home.showStoreListPre();
        },
        goBack: function(e){
            console.log('app.views.goBack');
            $('#landingPageMenu').removeClass('hide');
            app.views.backStack.pop();
            var length = app.views.backStack.length;
            if (length == 0){
                navigator.app.exitApp();
                return;
            } 
            var backToStr = app.views.backStack[length-1];
            var backTo = backToStr.split(":");
            if (backTo[0] == "StoreList"){
                app.views.backStack.pop();
                app.views.home.showStoreList();
            } else if (backTo[0] == "StoreDetail"){
                if (backTo.length == 3){
                    app.views.home.showStoreListPre();
                }else{
                    app.views.home.getStoreDetail(backTo[1], true, 'true');
                }
            } else if (backTo[0] == "StoreListByDept"){
                if (backTo[3] == "filter")
                    app.views.home.storeListByDepartment(backTo[1], backTo[2],true);
                else if (backTo[3] == "noFilter")
                    app.views.home.storeListByDepartment(backTo[1], backTo[2],false);
            } else if (backTo[0] == "ProductDetail"){
                app.views.backStack.pop();
                app.views.products.showProductDetail(backTo[1],backTo[2],backTo[3]);
            } else if (backTo[0] == "ProductList"){
                app.views.products.showProductListMore2(backTo[1],backTo[2]);
            } else if (backTo[0] == "Favorites"){
                app.views.home.getFavorites();
            } else if (backTo[0] == "Chats"){
                app.views.backStack.pop();
                app.views.chat.list();
            } else if (backTo[0] == "MapView"){
                app.views.backStack.pop();
                app.views.leaflet.showMap(backTo[1],backTo[2],backTo[3]);
            }else {
                console.log("****ERROR****:Back not recognized");
            }
            //app.views.backFunction();
            
        },
        showMenu: function(e){
             $('.navbar-collapse').collapse('show');
        },
        login: {
            init: function(){
                console.log("app.views.login.init()");
                $('.navbar-toggle').hide();
                $('.carousel').addClass('hide');
                $('#menubutton').addClass('hide');
                $('#landingPageMenu').addClass('hide');
                app.views.homeInitCalled = 0;
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
                            app.views.home.init();
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
        home: {
            totalPages: 0,
            currentPage: 0,
            store_id: [],
            storesChild: [],
            oStoreDetail: null,
            init: function (e) {
                console.log('app.views.home.init()');

                $('.navbar-toggle').show();

                if (app.views.homeInitCalled){
                  return;  
                } 
                app.views.homeInitCalled = 1;
               
                setTimeout(function () {

                    $('#splashView').addClass('hide');

                    $('#optSearch').html(app.lang.getStr('%Search%', 'aplication'));
                    $('#optPinned').html(app.lang.getStr('%Pinned%', 'aplication'));
                    $('#optVMap').html(app.lang.getStr('%V-Map%', 'aplication'));
                    $('#optVNotification').html(app.lang.getStr('%Notification%', 'aplication'));
                    $('#optStore').html(app.lang.getStr('%Stores%', 'homeView'));
                    $('#optProduct').html(app.lang.getStr('%Products%', 'aplication'));
                    
                    backStack = new Array();
                    
                    app.views.generateMenu();
                    
                }, 2000);
                            
                app.bindEvents();

            },
            logout: function (e) {
                window.localStorage.removeItem("user_token");
                app.views.login.init();
            },
            backCoverPage: function (e) {
                console.log('app.views.home.backCoverPage()');
                
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
                console.log('app.views.home.showStoreListPre');
                app.views.backStack = new Array();
                app.views.setDefaults();
                $('.carousel').removeClass('hide');
                $('#menubutton').removeClass('hide');
                $('.navbar').addClass('hide');
                app.views.generateMenu2();

                $('#storeList').html('<img src="img/load_image.gif" style="width: 48px;">');
                $('.carousel').carousel({
                    interval: 3000
                });


                app.views.home.oStoreDetail = null;
                        
                app.webservice.get(
                    'stores/?q[id_eq]=201',
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));

                        app.views.stores = result.stores;
                        app.views.backStack.push("StoreDetail:"+app.views.stores[0].id+":home");
                        app.views.home.storeDetail();
                    },
                    function (e) {
                        console.log(JSON.stringify(e));
                        app.views.loadView.hide();
                       
                    }
                );

                app.bindEvents();
            },
            showStoreList: function (e) {
                console.log('app.views.home.showStoreList');
                mixpanel.track("Home");
                app.views.setDefaults();
                var homeDeptId = -1;
                if (!e){
                $('.carousel').removeClass('hide');
                $('#menubutton').removeClass('hide');
                $('.navbar').addClass('hide');
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
                        app.views.home.oStoreDetail = null;
                        
                        app.webservice.get(
                            req,
                            {},
                            function (result) {
                                console.log(JSON.stringify(result));

                                $('#storeList').html('');

                                app.views.backStack.push("StoreList");
                                if (result.stores.length > 1) {
                                    app.views.stores = new Array();

                                    app.views.home.showStores(result,false,false,1);

                                    app.views.home.currentPage = 1;
                                    app.views.home.totalPages = result.pages;

                                    if (app.views.home.totalPages > 1) {

                                        $(window).unbind('scroll');

                                        $(window).on("scroll", function () { //pagination
                                            if (($(this).scrollTop() + $(this).height())*app.views.home.currentPage >= $('#storeList').parent().height()) {
                                                if (app.views.scrollPending == 0) {
                                                    app.views.scrollPending = 1;
                                                    app.views.home.paginacao('stores/', {},'stores');
                                                }
                                            }
                                        });
                                    }
                                    
                                    // Always hide filter since the departments are on the menu anyway
                                    app.views.home.getDepartment(true);
                                    
                                } else {
                                    app.views.stores = result.stores;
                                    console.log(JSON.stringify(app.views.stores));
                                    $('#rowStoreFilter').hide();
                                    //app.views.backStack.push("StoreDetail:"+app.views.stores[0].id);
                                    app.views.home.storeDetail();
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
            storeDetail: function (e) {
                console.log('app.views.home.storeDetail()');
                var store_id;

                if ($(e).attr('store_id')) {
                    $('.carousel').addClass('hide');
                    $('#menubutton').addClass('hide');
                    $('#landingPageMenu').addClass('hide');
                    $('.navbar').removeClass('hide');
                    
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
                app.views.home.getStoreDetail(store_id, btBack, $(e).attr('dadStore'));
                
            },
            getStoreDetail: function(store_id, btBack, dadStore){
                console.log('app.views.home.getStoreDetail()');
                app.views.loadView.show();
                
                app.webservice.get(
                    'stores/' + store_id,
                    {},
                    function (result) {
                        app.views.scrool = $(window).scrollTop();
                        app.views.home.oStoreDetail = result;
                        app.views.home.showStoreDetail(result, btBack, dadStore);
                        app.views.loadView.hide();
                    },
                    function (e) {
                        console.log(JSON.stringify(e));
                        app.views.loadView.hide();
                        
                    }
                );
            },
            showStoreDetail: function(store, btBack, dadStore){
                console.log('app.views.home.showStoreDetail');
                var aa = -1;
                var bb = -1;
                var cc = -1;
                var aboutStripped;
                app.webservice.get(
                    'stores/' + store.id + '/categories',
                    {},
                    function (result) {
                        //console.log(JSON.stringify(result));
                        aa = store.about.indexOf('**AA**'); //Members / Featured Members
                        bb = store.about.indexOf('**BB**'); //Vendors / Featured Vendors
                        cc = store.about.indexOf('**CC**'); //Products / Vendors
                        aboutStripped = stripAbout(store.about);
                        if (aa > -1) { aboutStripped = store.about.replace('**AA**','');}
                        if (bb > -1) { aboutStripped = store.about.replace('**BB**','');}
                        if (cc > -1) { aboutStripped = store.about.replace('**CC**','');}

                        app.draw(
                            '#content',
                            '#ProductView',
                            'ProductView',
                            {
                                index: store.id,
                                name: stripLeadingTag(store.name),
                                city: store.city,
                                uf: store.state,
                                logo: store.logo,
                                featured_product : !store.featured_product ? '' : store.featured_product,
                                about: convertLinks2(aboutStripped),
                                dadStore: dadStore,
                                favorite: store.favorite
                            },
                            '',
                            function () {
                                app.views.home.addCategorie2(result.categories);

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
                                
                                //if(!btBack || ((app.views.home.store_id.length == 1) && (dadStore=='true'))){
                                //    console.log('hide back button');
                                //    $('#divBtBack').addClass('hide');
                                //}
                                
                                if (store.corporate) {

                                    $('#store_name').addClass('hide');
                                    $('#backLink').addClass('hide');
                                    $('#btFav_0').addClass('hide');
                                }
                                
                                $('#storeCategorie').change(function () {
                                    app.views.home.filterByCategory($('#storeCategorie'));
                                });
                                if (store.favorite) {
                                    $('#btFav_' + store.id + ' span').removeClass('icon-star');
                                    $('#btFav_' + store.id + ' span').addClass('icon-star-filled');

                                    $('.btFavorite').attr('data-callback', 'app.views.home.removeFavorite');
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
                                if (hasCode(store.about,"showMapButton")){
                                    $('#mapButton').removeClass('hide');
                                }
                                if (hasCode(store.about,"hideChatButton")){
                                    $('#chatButton').addClass('hide');
                                }
                                if (hasCode(store.about,"hideContactButton")){
                                    $('#contactButton').addClass('hide');
                                }
                                
                                if(store.stores_count>0){
                                    
                                    $('#storeOptions').removeClass('hide');

                                    if (aa > -1) {
                                        $('#liOptProductLink').text('Members');
                                        $('#liOptStoreLink').text('Featured Members');
                                    }
                                    if (bb > -1) {
                                        $('#liOptProductLink').text('Vendors');
                                        $('#liOptStoreLink').text('Featured Vendors');
                                    }
                                    if (cc > -1) {
                                        $('#liOptProductLink').text('Offers');
                                        $('#liOptStoreLink').text('Vendors');
                                    }
                                    
                                    $('#list-stores').html('<img src="img/load_image.gif" style="width: 48px;">');
                                    $('#productList').html('<img src="img/load_image.gif" style="width: 48px;">');
                                    
                                    app.views.home.getStoresChild(store.id);

                                    
                                }else{
                                    
                                    $('#storeOptions').addClass('hide');
                                    $('#productListDiv').removeClass('hide');
                                    //$('#liOptStore').addClass('hide');
                                    $('#storeTabs').addClass('hide');
                                    $('#productList').html('<img src="img/load_image.gif" style="width: 48px;">');
                                    $('#list-stores').html('<li><p class="noProduct">' + app.lang.getStr('%No products posted%', 'aplication') + '</p></li>');
                        
                                }
                                console.log("Back functionality: dadStore:"+dadStore+" app.views.home.oStoreDetail.id:"+app.views.home.oStoreDetail.id);
                                if(dadStore=='false' && app.views.auxBackFuc!='search'){
                                    app.views.backFunction = app.views.products.backStoreDad;
                                    $('#btBack').attr('dad_id', app.views.home.store_id[app.views.home.store_id.length-1]);

                                }else if(app.views.auxBackFuc=='storesList'){
                                    
                                    app.views.backFunction = app.views.products.backHome;

                                }else if(app.views.auxBackFuc=='producs'){
                                    
                                    app.views.backFunction = app.views.products.returnToProductList;

                                }else if(app.views.auxBackFuc=='search'){
                                    app.views.backFunction = app.views.search.init;

                                }
                                app.views.home.store_id.push(app.views.home.oStoreDetail.id);
                        
                                app.views.products.showProductStoreList(store.id,store.stores_count);

                                app.bindEvents();
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
            getStoresChild: function(store_id){
                console.log('app.views.home.getStoresChild');
                
                app.webservice.get(
                    'stores/'+store_id+'/stores',
                    {},
                    function (result) {
                        console.log('result child store');
                        console.log(result);
                        
                        $('#list-stores').html('');
                        
                        app.views.home.storesChild = result.stores;
                        
                        app.views.home.addStore(result.stores, '#list-stores',0, true,'false',1);
                        app.views.home.currentPage = 1;
                        app.views.home.totalPages = result.pages;
                                    
                        $(window).on("scroll", function () {
                            if (($(this).scrollTop() + $(this).height())*app.views.home.currentPage >= $('#list-stores').parent().height()) {
                                if (app.views.scrollPending == 0) {
                                    app.views.scrollPending = 1;
                                    app.views.home.paginacao('stores/'+store_id+'/stores', {},'storeschild');
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
                console.log('app.views.home.showStoresChild');
                
                $('#liOptStore').addClass('active');
                $('#storesListDiv').removeClass('hide');
                
                $('#liOptProduct').removeClass('active');
                $('#productListDiv').addClass('hide');
                
            },
            showStoresProducts: function(e){
                console.log('app.views.home.showStoresProducts');
                
                $('#liOptProduct').addClass('active');
                $('#productListDiv').removeClass('hide');
                
                $('#liOptStore').removeClass('active');
                $('#storesListDiv').addClass('hide');
                
            },
            paginacao: function (url, options,type) {
                console.log('app.view.home.paginacao');
                if (app.views.home.totalPages > app.views.home.currentPage) {

                    app.views.home.currentPage += 1;
                    options['page'] = app.views.home.currentPage;
                    app.webservice.get(
                        url,
                        options,
                        function (result) {
                            console.log(JSON.stringify(result));
                            if (type.indexOf('storeschild') == 0) {
                                app.views.home.addStore(result.stores, '#list-stores',0, true,'false',app.views.home.currentPage);
                            }else if(type.indexOf('favorites') == 0){
                                app.views.home.addFavorite(result.stores, '#favoriteList', 0, true, 'false',app.views.home.currentPage);
                            }else{
                                    
                                app.views.home.showStores(result,false,false,app.views.home.currentPage);
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
                console.log('app.views.home.addCategorie2');
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
                                    var str = '<a href="#" data-callback="app.views.home.filterByCategory" class="list-group-item" cat_id="' + sub.id + '" cat_name="'+sub.name+'"><span style="padding-left:10px" id="cat_name">' + sub.name + '</span></a>';
                                    subCategoryHtml = subCategoryHtml.concat(str);
                                }
                            });
                            $('#categoryListProductView').append('<a href="#" data-callback="app.views.home.filterByCategory" class="list-group-item" cat_id="'+c.id+'" sub_ids="'+subIds+'" cat_name="'+c.name+'"><span id="cat_name">' + c.name + '</span></a>');
                            $('#categoryListProductView').append(subCategoryHtml);
                        } else {
                            $('#categoryListProductView').append('<a href="#" data-callback="app.views.home.filterByCategory" class="list-group-item" cat_id="'+c.id+'" cat_name="'+c.name+'"><span id="cat_name">' + c.name + '</span></a>');
                        }
                    }
                });
                if (countCat < 2) {
                    $('#filterPanelProductView').addClass('hide');
                }
            },
            addCategorie: function (cats) {
                console.log('app.views.home.addCategorie');
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
                console.log('app.views.home.filterByCategory()');
                $('#filterModalProductView').modal('hide');

                var cat_name = $(e).attr('cat_name');
                $('#productList').html('<img src="img/load_image.gif" style="width: 40px;"/>');

                $('#catFilterNameProductView').html(cat_name);
                $('#clearFilterProductView').removeClass('hide');
                $('#catFilterProductView').addClass('hide');

                app.webservice.get(
                    'stores/' + app.views.home.oStoreDetail.id + '/products/?q[product_category_id_eq]=' + $(e).attr('cat_id'),
                    {},
                    function (result) {
                        //console.log(JSON.stringify(result));
                        $('#productList').html('');

                        if (result.products.length > 0)
                            app.views.products.addProducts(result.products);
                        //else 
                    },
                    function (e) {
                        //console.log(JSON.stringify(e));
                        app.views.loadView.hide();
                    }
                );
            },
            clearFilter: function(e){
                console.log('app.views.home.clearFilter()');
                
                $('#catFilterNameProductView').html('');
                $('#clearFilterProductView').addClass('hide');
                $('#catFilterProductView').removeClass('hide');

                
                $('#productList').html('<img src="img/load_image.gif" style="width: 40px;"/>');
                
                //window.localStorage.removeItem("productCatName");
                //window.localStorage.removeItem("productCat");
                
                //app.views.products.showProductList();
                console.log('app.views.home.oStoreDetail.id'+app.views.home.oStoreDetail.id);
                app.views.products.showProductStoreList(app.views.home.oStoreDetail.id,app.views.home.stores_count);

                
            },
            filterByDepartmentFromMenu: function(e){
                console.log('app.views.home.filterByDepartmentFromMenu()');
                $('.carousel').addClass('hide');
                $('#menubutton').addClass('hide');
                $('.navbar').removeClass('hide');
                app.views.backStack = new Array();
                if ($(e).attr('dep_id') == '0') {
                    app.views.goHome();
                }else{
                    app.views.backStack.push("StoreListByDept:"+$(e).attr('dep_id')+":"+$(e).attr('dep_name')+":"+"filter");
                    app.views.home.storeListByDepartment($(e).attr('dep_id'),$(e).attr('dep_name'),true);
                }
            },
            filterByDepartment: function(e){
                console.log('app.views.home.filterByDepartment()');
                app.views.backStack.pop();
                app.views.backStack.push("StoreListByDept:"+$(e).attr('dep_id')+":"+$(e).attr('dep_name')+":"+"noFilter");
                app.views.home.storeListByDepartment($(e).attr('dep_id'),$(e).attr('dep_name'),false);
            },
            storeListByDepartment: function(dep_id, dep_name, hideFilter){
                console.log('app.views.home.storeListByDepartment()');
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
                                app.views.home.showStores(result, true, hideFilter,1);

                                app.views.home.currentPage = 1;
                                app.views.home.totalPages = result.pages;

                                if (app.views.home.totalPages > 1) {

                                    $(window).on("scroll", function () { //pagination
//                                        console.log(($(this).scrollTop() + $(this).height()) +' >= ' + $('#storeList').parent().height());
                                        if ($(this).scrollTop() + $(this).height() >= $('#storeList').parent().height()) {

                                            app.views.home.paginacao('stores?department=' + dep_id, {},'stores');
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
                console.log('app.views.home.getDepartment()');
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
                            $(this).attr('data-callback','app.views.home.filterByDepartment');
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
                console.log('app.views.home.showStores');
                
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
                    app.views.home.addStore(app.views.stores, '#storeList', i, search, 'true',currentPage);
                } else {
                
                    app.views.stores = result.stores;
                    $('#rowStoreFilter').hide();
                    if (app.views.backStack[0].indexOf("StoreList") == 0)
                        app.views.backStack.pop();//only if item on top of stack is storelist
                    app.views.backStack.push("StoreDetail:"+app.views.stores[0].id);
                    app.views.home.storeDetail();
                }
            },
            showFavorites: function (result, search, hideFilter,currentPage) {
                console.log('app.views.home.showSFavorites');
                
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
                    app.views.home.addFavorite(app.views.stores, '#favoriteList', i, search, 'true',currentPage);
                }
            },
            addStore: function(storeArray, divId, arrayIndex, search, dadStore,currentPage){
                console.log('app.views.home.addstore');
                var i = arrayIndex*currentPage;
                var aa = -1;
                var bb = -1;
                var cc = -1;
                var aboutStripped;

                $.each(storeArray, function (index, store) {
                    aa = store.about.indexOf('**AA**');
                    bb = store.about.indexOf('**BB**');
                    cc = store.about.indexOf('**CC**');
                    aboutStripped = stripAbout(store.about);

                    if (aa > -1) { aboutStripped = store.about.replace('**AA**','');}
                    if (bb > -1) { aboutStripped = store.about.replace('**BB**','');}
                    if (cc > -1) { aboutStripped = store.about.replace('**CC**','');}
                    
                    app.draw(
                        divId,
                        '#storeItem',
                        'storeItem',
                        {
                            name: stripLeadingTag(store.name),
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
                                $('#btFav_' + i + ' span').removeClass('icon-star');
                                $('#btFav_' + i + ' span').addClass('icon-star-filled');
                                $('#btFav_' + i).attr('data-callback', 'app.views.home.removeFavorite');
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
                            
                            if(store.stores_count>0){
                                $('#btnProduct_'+i).html(app.lang.getStr('%More%', 'storeItem'))
                            }
                            if (aa > -1){
                                $('#btnProduct_'+i).html(app.lang.getStr('Members', 'storeItem'))
                            }
                            if (bb > -1){
                                $('#btnProduct_'+i).html(app.lang.getStr('Vendors', 'storeItem'))
                            }
                            if (cc > -1){
                                $('#btnProduct_'+i).html(app.lang.getStr('Offers', 'storeItem'))
                            }
                            if(!dadStore){
                                $('#btnContact_'+i).attr('dadStore','false');
                                $('#btnProduct_'+i).attr('dadStore','false');
                            }
                            if (store.logo.indexOf('medium.png') > -1){
                                $('#storeImage_'+i).addClass('hide');
                                $('#storeDetail_'+i).addClass('col-xs-12 col-sm-12');
                                $('#readMore_'+i).addClass('hide');
                                $('#storeItem_'+store.id).attr('data-callback', '');
                            }
                            i++;
                            app.bindEvents();
                        }
                    );
                });  
            },
            addFavorite: function(storeArray, divId, arrayIndex, search, dadStore,currentPage){
                console.log('app.views.home.addstore');
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
                            name: stripLeadingTag(store.name),
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
                console.log('app.views.home.saveFavorite');

                app.webservice.post(
                    'favorites/',
                    'POST',
                    {
                        id: $(e).attr('store_index')
                    },
                function (result) {
                    console.log(JSON.stringify(result));
                    //change bt in store list
                    $('#btFav_' + $(e).attr('store_index') + ' span').removeClass('icon-star');
                    $('#btFav_' + $(e).attr('store_index') + ' span').addClass('icon-star-filled');

                    $('#btFav_' + $(e).attr('store_index')).attr('data-callback', 'app.views.home.removeFavorite');

                    //change bt in detail store
                    $(e).children('span').removeClass('icon-star');
                    $(e).children('span').addClass('icon-star-filled');

                    $(e).attr('data-callback', 'app.views.home.removeFavorite');

                },
                    function (e) {
                        console.log(JSON.stringify(e));
                    }
                );
            },
            removeFavorite: function (e) {
                console.log('app.views.home.removeFavorite');

                app.webservice.post(
                    'favorites/' + $(e).attr('store_index'),
                    'DELETE',
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));
                        $('#btFav_' + $(e).attr('store_index') + ' span').removeClass('icon-star-filled');
                        $('#btFav_' + $(e).attr('store_index') + ' span').addClass('icon-star');

                        $('#btFav_' + $(e).attr('store_index')).attr('data-callback', 'app.views.home.saveFavorite');

                        //change bt in detail store
                        $(e).children('span').removeClass('icon-star-filled');
                        $(e).children('span').addClass('icon-star');

                        $(e).attr('data-callback', 'app.views.home.saveFavorite');

                    },
                    function (e) {
                        console.log(JSON.stringify(e));
                    }
                );
            },
            getFavorites: function(e){
                console.log('app.views.home.showFavorites()');
                app.views.backStack.pop();

                app.views.backStack.push("Favorites");
                $('.carousel').addClass('hide');
                $('#menubutton').addClass('hide');
                $('#landingPageMenu').addClass('hide');
                $('.navbar').removeClass('hide');
                
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
                                
                                app.views.home.showFavorites(result, true, true,1);

                                app.views.home.currentPage = 1;
                                app.views.home.totalPages = result.pages;

                                if (app.views.home.totalPages > 1) {

                                    $(window).on("scroll", function () { //pagination
                                        if ($(this).scrollTop() + $(this).height() >= $('#favoriteList').parent().height()) {

                                            app.views.home.paginacao('favorites', {},'favorites');
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
            showContact: function (e) {
                console.log('app.views.home.showContact');
                console.log($(e).attr('store_index'));
                console.log($(e).attr('dadStore'));
                
                var store = '';
                
                if($(e).attr('dadStore')=='true' && app.views.home.oStoreDetail){
                    
                    store = app.views.home.oStoreDetail;
                    
                }else{
                    
                    store = $(e).attr('dadStore')=='true' ? app.views.stores[$(e).attr('store_index')] : app.views.home.storesChild[$(e).attr('store_index')];
                    
                }
                                
                $('#modalContact .modal-title').html(stripLeadingTag(store.name) + ' - ' + app.lang.getStr('%Contact%', 'contactView'));

                $('#btContactClose').html(app.lang.getStr('%Close%', 'contactView'));

                app.draw(
                    '#modalContact .modal-body',
                    '#contactView',
                    'contactView',
                    {
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

                        if (!store.phone || store.phone == '') {
                            $('.contactPhone').addClass('hide');
                        }

                        if (!store.email || store.email == '') {
                            $('.contactEmail').addClass('hide');
                        }
                        console.log('Site:' + store.website + '.');
                        if (!store.website || store.website == '') {
                            $('.contactWebsite').addClass('hide');
                        }
                        console.log("store.about:"+store.about);
                        if (store.about.indexOf("**hideAddress") > -1){
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
                    console.log("open 1");
                    ref = cordova.InAppBrowser.open($(e).attr('data-site'), '_blank', 'location=no,clearcache=yes,clearsessioncache=yes'); 
                }else{
                    console.log("open 2");
                    ref = cordova.InAppBrowser.open('http://' + $(e).attr('data-site'), '_blank', 'location=no,clearcache=yes,clearsessioncache=yes');  
                }

                ref.addEventListener('loadstop', function(event) {
                    console.log("loadstop");
                    console.log("event.url:"+event.url);
                    if (event.url.match("mobile/close")) {
                        ref.close();
                    }
                });
                //ref.addEventListener('loadstop', loadstopcb);
                ref.addEventListener('loadstart', loadstartcb);
                ref.addEventListener('loaderror', loaderrorcb);
            }
        },
        generateMenu2: function () {
            console.log('app.views.generateMenu2()');
            $('#vex-navbar2').html('');
            var strHome;
            $.each(app.views.departments, function (i, dep) {
                if (isHome(dep.name)){
                    strHome = dep.id;
                } else {
                    app.draw(
                        '#vex-navbar2',
                        '#menuItem2',
                        'menuItem2',
                        {
                            name: stripLeadingTag(dep.name),
                            id: dep.id
                        },
                        'append',
                        function () {
                            app.bindEvents();
                        }   
                    );
                }
            });
            app.draw(
                '#vex-navbar2',
                '#menuItemFavorite2',
                'menuItemFavorite2',
                {
                    name: app.lang.getStr('%Favorites%', 'aplication'),
                    id: 0
                },
                'append',
                function () {
                    app.bindEvents();
                }
            );
            app.draw(
                '#vex-navbar2',
                '#menuItemChats2',
                'menuItemChats2',
                {
                    name: app.lang.getStr('%Chats%', 'aplication'),
                    id: 0
                },
                'append',
                function () {
                    app.bindEvents();
                }
            );
            app.draw(
                '#vex-navbar2',
                '#menuItemMap2',
                'menuItemMap2',
                {
                    name: app.lang.getStr('%V-Map%', 'aplication'),
                    id: 0
                },
                'append',
                function () {
                    app.bindEvents();
                }
            );
            if (app.loginRequired){
                app.draw(
                    '#vex-navbar2',
                    '#menuItemLogout2',
                    'menuItemLogout2',
                    {
                        name: app.lang.getStr('%Logout%', 'aplication'),
                        id: 0
                    },
                    'append',
                    function () {
                        app.bindEvents();
                    }
                );
            }
            return strHome;
        },
        generateMenu: function () {
            console.log('app.views.generateMenu()');

            app.webservice.get(
                'departments',
                {},
                function (result) {
                    console.log(JSON.stringify(result));
                    app.views.departments = result.departments; // Cache for later use
                    var homeText = app.lang.getStr('%Home%', 'aplication');
                    $.each(app.views.departments, function (i, dep) {
                        if (isHome(dep.name)) homeText = stripLeadingTag(dep.name);
                    });
                    $('#vex-navbar').html('');
                    app.draw(
                        '#vex-navbar',
                        '#menuItem',
                        'menuItem',
                        {
                            name: homeText,
                            id: 0
                        },
                        'append',
                        function () {
                            app.bindEvents();
                        }
                    );

                    $.each(app.views.departments, function (i, dep) {
                        if (isHome(dep.name) == false ){
                            app.draw(
                                '#vex-navbar',
                                '#menuItem',
                                'menuItem',
                                {
                                    name: stripLeadingTag(dep.name),
                                    id: dep.id
                                },
                                'append',
                                function () {
                                    app.bindEvents();
                                }
                            );
                        }
                    });
                    app.draw(
                        '#vex-navbar',
                        '#menuItemFavorite',
                        'menuItemFavorite',
                        {
                            name: app.lang.getStr('%Favorites%', 'aplication'),
                            id: 0
                        },
                        'append',
                        function () {
                            app.bindEvents();
                        }
                    );

                    app.draw(
                        '#vex-navbar',
                        '#menuItemChats',
                        'menuItemChats',
                        {
                            name: app.lang.getStr('%Chats%', 'aplication'),
                            id: 0
                        },
                        'append',
                        function () {
                            app.bindEvents();
                        }
                    );
                    app.draw(
                        '#vex-navbar',
                        '#menuItemMap',
                        'menuItemMap',
                        {
                            name: app.lang.getStr('%V-Map%', 'aplication'),
                            id: 0
                        },
                        'append',
                        function () {
                            app.bindEvents();
                        }
                    );
                    app.views.goHome();
                },
                function (err) {
                    console.log(JSON.stringify(err));
                }
            );
            
        },
        products: {
            showProductList: function(e){
                console.log('app.views.products.showProductList');
                
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
                                app.views.products.addCategorieMenu(result.categories);
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
                                
                                app.views.products.addProducts(result.products);
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
                console.log('app.views.products.showProductListMore');
                var cat_name = decodeURI($(e).attr('cat_name'));
                var store_id = $(e).attr('store_id');
                app.views.backStack.push("ProductList:"+cat_name+":"+store_id);
                app.views.products.showProductListMore2(cat_name,store_id);
            },
            
            showProductListMore2: function(cat_name,store_id){
                console.log('app.views.products.showProductListMore2');
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
                                app.views.products.addCategorieMenu(result.categories);
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
                                $('#clearFilter').attr('data-callback', 'app.views.products.clearFilterMore');
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
                                        app.views.products.addProducts(result.products);
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
                console.log('app.views.products.addCategorieMenu()');
                var countCat = 0;
                $('#categoryList').html('');
                $.each(cats, function (index, c) {
                    //console.log('app.views.products.addCategorieMenu: c.id:'+c.id+' c.name:'+c.name);
                    if (c.count_products != 0) {

                        if (c.subcategories.length > 0) {
                            var subCategoryHtml = '';
                            var subIds = '';
                            $.each(c.subcategories, function (i, sub) {
                                subIds = subIds.concat(sub.id+" ");
                                if (sub.count_products != 0) {
                                    countCat += 1;
                                    var str = '<a href="#" data-callback="app.views.products.filterBycategory" class="list-group-item" cat_id="' + sub.id + '" cat_name="'+sub.name+'"><span style="padding-left:10px">' + sub.name + '</span></a>';
                                    subCategoryHtml = subCategoryHtml.concat(str);
                                }
                            });
                            $('#categoryList').append('<a href="#" data-callback="app.views.products.filterBycategory" class="list-group-item" cat_id="'+c.id+'" sub_ids="'+subIds+'" cat_name="'+c.name+'"><span>' + c.name + '</span></a>');
                            $('#categoryList').append(subCategoryHtml);
                        } else {
                            countCat += 1;
                            $('#categoryList').append('<a href="#" data-callback="app.views.products.filterBycategory" class="list-group-item" cat_id="'+c.id+'" cat_name="'+c.name+'"><span>' + c.name + '</span></a>');
                    }
                    }
                });
            },
            filterBycategory: function(e){
                console.log('app.views.products.filterBycategory()');
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
                        console.log('app.views.products.filterBycategory:result:'+JSON.stringify(result));
                        app.views.products.addProducts(result.products);
                    },
                    function (err) {
                        console.log(err);
                        app.views.loadView.hide();
                    }
                );
                
            },
            clearFilter: function(e){
                console.log('app.views.products.clearFilter()');
                
                $('#catFilterName').html("");
                $('#clearFilter').addClass('hide');
                $('#catFilter').removeClass('hide');
                
                $('#productList').html('<img src="img/load_image.gif" style="width: 40px;"/>');
                
                window.localStorage.removeItem("productCatName");
                window.localStorage.removeItem("productCat");
                
                app.views.products.showProductList();
                
            },
            clearFilterMore: function(e){
                console.log('app.views.products.clearFilterMore()');
                
                $('#catFilterName').html("");
                $('#clearFilter').addClass('hide');
                $('#catFilter').removeClass('hide');
                
                $('#productList').html('<img src="img/load_image.gif" style="width: 40px;"/>');
                var store_id = $(e).attr('store_id');
                app.views.products.showProductListMore2("*",store_id);
                
            },
            showProductStoreList: function (store_id,store_count) {
                console.log('app.views.products.showProductStoreList');

                $(window).unbind('scroll');
                
                $('#productList').html('<img src="img/load_image.gif" style="width: 40px;"/>');
                
                app.webservice.get(
                    'stores/' + store_id + '/products',
                    {},
                    function (result) {
//                        console.log(JSON.stringify(result));
                        app.views.products.addProducts(result.products);
                        console.log("result.products.length: "+result.products.length);
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
                console.log('app.views.products.addProducts()');
                if (productList.length == 0) {
                    $('#productList').html('<li><p class="noProduct">' + app.lang.getStr('%No products posted%', 'aplication') + '</p></li>');
                    return;
                }
                $('#productList').html('');
                app.views.productsDrawn = new Array();

                $.each(productList, function (index, prod) {
                    duplicate = false;
                    $.each(app.views.productsDrawn, function (i,prodid){
                        if (productList[index].product_id == prodid){
                            duplicate = true;
                        }
                    });
                    if (!duplicate){
                    app.views.productsDrawn.push(productList[index].product_id);
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

                            if (prod.pin != false || prod.store_id == 0) {

                                $('#pin_' + prod.id + ' i').removeClass('fa-pin');
                                $('#pin_' + prod.id + ' i').addClass('fa-pinned');
                                
                                if (prod.pin_id)
                                    $('#pin_' + prod.id).attr('pin_id', prod.pin_id);
                                else
                                    $('#pin_' + prod.id).attr('pin_id', prod.id);

                                $('#pin_' + prod.id).attr('data-callback', 'app.views.products.removePinFavorite');

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
                                $('#productDetail_'+index).addClass('col-xs-12 col-sm-12');
                            }
                            if (prod.name.indexOf('**banner**') == 0) {
                                $('#productItem_'+prod.id).attr('data-callback', '');
                            } else {
                                $('#readMore_'+index).removeClass('hide');
                            }
                            app.bindEvents();
                        }
                    );}
                });
            },
            pinFavorite: function (e) {
                console.log('app.views.products.pinFavorite');

                $('#pin_' + $(e).attr('product_id')).attr('data-callback', '');

                app.webservice.post(
                    'pins',
                    'POST',
                    {
                        publish_id: $(e).attr('product_id')
                    },
                function (result) {
                    console.log(JSON.stringify(result));
                    
                    $(e).children('i').removeClass('fa-pin');
                    $(e).children('i').addClass('fa-pinned');
                                
                    $(e).attr('pin_id', result.id);
                    $(e).attr('data-callback', 'app.views.products.removePinFavorite');

                },
                    function (e) {
                        console.log(JSON.stringify(e));
                        $('#pin_' + $(e).attr('product_id')).attr('data-callback', 'app.views.products.pinFavorite');
                    }
                );
            },
            removePinFavorite: function (e) {
                console.log('app.views.products.removePinFavorite');

                $('#pin_' + $(e).attr('product_id')).attr('data-callback', '');

                app.webservice.post(
                    'pins/' + $(e).attr('pin_id'),
                    'DELETE',
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));

                        $(e).children('i').removeClass('fa-pinned');
                        $(e).children('i').addClass('fa-pin');
                    
                        $(e).attr('data-callback', 'app.views.products.pinFavorite');

                        if ($(e).attr('remove') == 'true') {
                            $('#productItem_' + $(e).attr('pin_id')).remove();
//                            console.log($('#productList').children().length);
                            if ($('#productList').children().length == 0) {
                                $('#productList').html('<li><h3 class="noProduct">' + app.lang.getStr('%No products posted%', 'aplication') + '</h3></li>');
                            }
                        }
                    },
                    function (e) {
                        console.log(JSON.stringify(e));
                        $('#pin_' + $(e).attr('product_id')).attr('data-callback', 'app.views.products.removePinFavorite');

                    }
                );
            },
            productDetail: function (e) {
                console.log('app.views.products.productDetail()');
                //app.views.loadView.show();
                $('.carousel').addClass('hide');
                $('#menubutton').addClass('hide');
                $('.navbar').removeClass('hide');

                var store_id = $(e).attr('store_id');
                var prod_id = $(e).attr('prod_id');
                var data_pin = $(e).attr('data-pin');
                app.views.products.showProductDetail(store_id,prod_id,data_pin);
                
            },
            showProductDetail: function (store_id,prod_id,data_pin) {
                console.log('app.views.products.showProductDetail()');
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
                        app.views.products.addProductDetail(result, data_pin);
                        //app.views.loadView.hide();

                    },
                    function (e) {
                        console.log(JSON.stringify(e));
                        //app.views.loadView.hide();
                    }
                );
            },
            storeDetail: function(e){
                console.log('app.views.products.storeDetail()');

                
                app.views.auxBackFuc = 'producs';
                
                app.views.home.getStoreDetail($(e).attr('store_id'), true, 'false');
            },
            returnToProductList: function(){
                console.log('app.views.products.returnToProductList');
                
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

                                    app.views.products.addCategorieMenu(result.categories);
                                    app.bindEvents();

                                },
                                function (err) {
                                    console.log(err);
                                    app.views.loadView.hide();
                                }
                            );

                            app.views.products.filterBycategory();
                            
                            app.bindEvents();

                        }
                    );
                }else app.views.products.showProductList();
            },
            addProductDetail: function (result, data_pin) {
                console.log('app.views.products.addProductDetail()');
                //console.log(JSON.stringify(result));
                //app.views.backStack.push("ProductDetail:"+result.id);
                var effect = data_pin == 'true' ? '' : 'addSlide';
                var back = data_pin == 'true' ? 'app.views.pin.init' : 'app.views.products.backProductList';

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

                        if (result.pin != false || data_pin == 'true') {
                            
                            $('#pin_' + result.id + ' i').removeClass('fa-pin');
                            $('#pin_' + result.id + ' i').addClass('fa-pinned');
                        
                            $('#pin_' + result.id).attr('pin_id', result.id)
                            $('#pin_' + result.id).attr('data-callback', 'app.views.products.removePinFavorite');

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
                                $('#pagSlide').append('<li ><a id="item' + i + '" href="#" ' + cl + ' data-poss="' + i + '" data-callback="app.views.products.goSlide">' + (i + 1) + '</a></li>');
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
                console.log('app.views.products.goSlide()');
                window.mySwipe.slide($(e).attr('data-poss'), 400);
            },
            backHome: function () {
                console.log('app.views.products.backHome()');
                
                app.views.home.showStoreList();
                
//                app.draw('#content', '', '', {}, 'slideBack', function (e) {
//
//                    $(window).scrollTop(app.views.scrool);
//
//                    if (app.views.home.totalPages > 1) {
//                        $(window).on("scroll", function () { //pagination
//                            //                        console.log(($(this).scrollTop() + $(this).height()) +' >= ' + $('#storeList').parent().height());
//                            if ($(this).scrollTop() + $(this).height() >= $('#storeList').parent().height()) {
//
//                                app.views.home.paginacao('stores/');
//                            }
//                        });
//                    }
//                    app.bindEvents();
//
//                });
            },
            backStoreDad : function(e){
                console.log('app.views.products.backStoreDad()');
                
                var aux = true;
                var store_id = 0;
                
                while(aux){
                    
                    store_id = app.views.home.store_id.pop();
                    
                    if(store_id != app.views.home.oStoreDetail.id)
                        aux = false;
                }
                
                app.views.home.getStoreDetail(store_id, true, 'true');
                
            },
            backProductList: function (e) {
                console.log('app.views.products.backProductList()');

                app.draw('#content', '', '', {}, 'slideBack', function (e) {

                    app.bindEvents();

                });
            },
            shareProduct: function (e) {
                console.log('app.views.products.shareProduct()');
                window.plugins.socialsharing.share(
                    app.appName,
                    app.lang.getStr('The subject', 'aplication'),
                    null,
                    'http://ve-staging.herokuapp.com/');
            }
        },
        pin: {
            init: function (e) {
                console.log('app.views.pin.init()');

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
                                app.views.products.addProducts(result.pins);

                                $('.btPin').attr('remove', 'true');
                                $('.toProduct').attr('data-callback', 'app.views.pin.showProduct');
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
                console.log('app.views.pin.showProduct()');

                var prod_id = $(e).attr('prod_id');

                app.webservice.get(
                    'pins/' + prod_id,
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));
                        app.views.products.addProductDetail(result, e);
                    },
                    function (err) {
                        console.log(JSON.stringify(err));
                        app.views.loadView.hide();
                    }
                );
            }
        },
        search: {
            init: function (e) {
                console.log('app.views.search.int()');
                
                app.views.setDefaults();
                
                $('.linkHome').removeClass('selected');
                $(e).addClass('selected');
                
                $('#content').html('');
                
                app.webservice.get(
                    'departments',
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));
                        app.draw(
                            '#content',
                            '#searchView',
                            'searchView',
                            {},
                            '',
                            function () {

                                $.each(result.departments, function (i, dep) {
                                    app.draw(
                                        '#byDepartment .list-group',
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
                                app.bindEvents();
                            }
                        );
                    },
                    function (err) {
                        console.log(JSON.stringify(err));
                        app.views.loadView.hide();
                    }
                );
            },
            byName: function (e) {
                console.log('app.views.search.byName()');
                $('.breadcrumb > li').removeClass('active');
                $(e).parent().addClass('active');

                $('#byDepartment').addClass('hide');
                $('#byName').removeClass('hide');

            },
            byDepartment: function (e) {
                console.log('app.views.search.byDepartment()');
                $('.breadcrumb > li').removeClass('active');
                $(e).parent().addClass('active');

                $('#byDepartment').removeClass('hide');
                $('#byName').addClass('hide');
            },
            filterByDepartmentFromMenu: function(e){
                console.log('app.views.search.filterByDepartmentFromMenu()');
                app.views.backStack = new Array();
                app.views.backStack.push("StoreListByDept:"+$(e).attr('dep_id')+":"+$(e).attr('dep_name'));
                app.views.search.storeListByDepartment($(e).attr('dep_id'),$(e).attr('dep_name'));
            },
            filterByDepartment: function(e){
                console.log('app.views.search.filterByDepartment()');
                app.views.search.storeListByDepartment($(e).attr('dep_id'),$(e).attr('dep_name'));
            },
            storeListByDepartment: function (dep_id, dep_name) {
                console.log('app.views.search.storeListByDepartment()');
                app.webservice.get(
                    'stores/?q[store_departments_id_eq]=' + dep_id,
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));
                        app.draw(
                            '#content',
                            '#resultView',
                            'resultView',
                            {
                                search: dep_name
                            },
                            '',
                            function () {
                                if (result.stores.length > 1) {

                                    app.views.stores = new Array();

                                    app.views.home.showStores(result, true,false,1);

                                    app.views.home.currentPage = 1;
                                    app.views.home.totalPages = result.pages;

                                    if (app.views.home.totalPages > 1) {

                                        $(window).on("scroll", function () { //pagination
                                            if ($(this).scrollTop() + $(this).height() >= $('#storeList').parent().height()) {
                                                if (app.views.home.scrollPending == 0) {
                                                    app.views.home.scrollPending = 1;
                                                    app.views.home.paginacao('stores?department=' + dep_id, {},'stores');
                                                }
                                            }
                                        });
                                    }
                                
                                    $(window).scrollTop(0);
                                }else {
                                    app.views.stores = result.stores;
                                    console.log(JSON.stringify(app.views.stores));
                                    app.views.search.storeDetail(app.views.stores[0].id);
                                }
                                app.bindEvents();
                            }
                        );
                    },
                    function (e) {
                        console.log(JSON.stringify(e));
                        app.views.loadView.hide();
                    }
                );
            },
            filterByName: function (e) {

                if ($('#storeNameInput').val() === '') {

                    $('#resultByName').html('');

                    return;
                }

                app.webservice.get(
                    'stores?name=' + $('#storeNameInput').val(),
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));

                        $('#resultByName').html('');
                        app.views.stores = new Array();

                        var i = 0;

                        $.each(result.stores, function (index, store) {

                            if (!store.corporate) {

                                app.views.stores.push(store);

                                app.draw(
                                    '#resultByName',
                                    '#storeItem',
                                    'storeItem',
                                    {
                                        name: stripLeadingTag(store.name),
                                        city: store.city,
                                        uf: store.state,
                                        logo: store.logo,
                                        index: index,
                                        about: store.about
                                    },
                                'append',
                                    function () {
                                        app.bindEvents();
                                    }
                                );

                                i++;

                            }
                        });
                    },
                    function (e) {
                        console.log(JSON.stringify(e));
                        app.views.loadView.hide();
                    }
                );
            },
            storeDetail: function (store_id) {
                console.log('app.views.search.storeDetail()');
                app.views.auxBackFuc = 'search';
                app.views.home.getStoreDetail(store_id, true, 'false');
                
            }
        },
        leaflet: {
            showMap: function(latitude, longitude, branchOnly) {
                $('.carousel').addClass('hide');
                $('#menubutton').addClass('hide');
                $('#landingPageMenu').addClass('hide');
                $('.navbar').removeClass('hide');
                $('#backLink').addClass('hide');
                app.views.backStack.push("MapView:"+latitude+":"+longitude+":"+branchOnly);
                
                if (app.views.backStack.length > 1){
                    var ind = app.views.backStack.length-2;
                    $('#backStack').html(app.views.backStack[ind]);
                    $('#backLink').removeClass('hide');
                }else{
                    $('#backLink').addClass('hide');
                }
                
                app.draw(
                    '#content',
                    '#leafletView',
                    'leafletView',
                    {},
                    '',
                    function () {
                        //var mymap = L.map('mapid').setView([app.device.latitude, app.device.longitude], 8);
                        var mymap = L.map('mapid').setView([latitude,longitude], 13); // Wyoming
                        L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}', {
                            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
                            maxZoom: 18,
                            id: 'mapbox.streets',
                            accessToken: 'pk.eyJ1IjoibmFuY3lwaWVkcmEiLCJhIjoiY2l4ZXA1ejR6MDBnajJ0bnA1M3lzYWtobCJ9.CNGXj48Gw_Gs5moeZqbjyQ'
                        }).addTo(mymap);
                        
                        var option = {
                            latitude: latitude, 
                            longitude: longitude,
                            radius: 50
                        };
                        
                        app.webservice.get(
                            'maps',
                            option,
                            function (result) {
                                //console.log(JSON.stringify(result));
                                
                                var fuelIcon = L.icon({iconUrl: "img/Fuel.png", iconSize: [25,25]})
                                var foodIcon = L.icon({iconUrl: "img/Food.png", iconSize: [25,25]})
                                var hotelIcon = L.icon({iconUrl: "img/Hotel.png", iconSize: [25,25]})
                                var hospitallIcon = L.icon({iconUrl: "img/Hospital.png", iconSize: [25,25]})
                                var exitIcon = L.icon({iconUrl: "img/Exit.png"})
                                
                                $.each(result.stores, function (i, store) {
                                    var isSubBranch = false;
                                    $.each(app.views.home.storesChild, function(j, childStore){
                                        if (store.id == childStore.id) isSubBranch = true;
                                    });
                                    if (store.latitude != null && store.longitude != null && hasCode(store.about,"showOnMap") && isSubBranch){
                                        if (hasCode(store.about,"fuelIcon"))
                                            var marker = L.marker([store.latitude,store.longitude],{icon: fuelIcon}).addTo(mymap);
                                        else if (hasCode(store.about,"foodIcon"))
                                            var marker = L.marker([store.latitude,store.longitude],{icon: foodIcon}).addTo(mymap);
                                        else if (hasCode(store.about,"exitIcon"))
                                            var marker = L.marker([store.latitude,store.longitude],{icon: exitIcon}).addTo(mymap);
                                        else if (hasCode(store.about,"hotelIcon"))
                                            var marker = L.marker([store.latitude,store.longitude],{icon: hotelIcon}).addTo(mymap);
                                        else if (hasCode(store.about,"hospitalIcon"))
                                            var marker = L.marker([store.latitude,store.longitude],{icon: hotelIcon}).addTo(mymap);
                                        else
                                            var marker = L.marker([store.latitude,store.longitude]).addTo(mymap);

                                        var domelem = document.createElement('a');
                                        domelem.href = store.id;
                                        domelem.innerHTML = store.name;
                                        domelem.onclick = function() {
                                            alert(this.href);
                                            
                                            // do whatever else you want to do - open accordion etc
                                        };
                                        marker.bindPopup('<a href="#" class="btn btn-product" store_id="' + store.id + '" onclick="app.views.home.storeDetail(this);">' + store.name + '</a>');
                                        //marker.bindPopup(domelem);
                                        //marker.bindPopup("<p>"+store.name+"</p>"+store.about);
                                    }
                                });
                            }
                        );
                    },
                    function (err) {
                        console.log(JSON.stringify(err));
                    }
                );

            },
            getPosition: function (){
                console.log('app.views.leaflet.getPosition()');
                navigator.geolocation.getCurrentPosition(
                    function (position) {
                        console.log('GPS RESULT');
                        console.log('latitude: '+position.coords.latitude);
                        console.log('longitude: '+position.coords.longitude);

                        app.views.leaflet.showMap(position.coords.latitude, position.coords.longitude, false);
                    },
                    function (error) {
                        console.log('GPS ERROR');
                        console.log(JSON.stringify(error));
                    },
                    {timeout: 10000, enableHighAccuracy: true}
                );
                
            },
            getStore: function (e){
                var store_id = $(e).attr('store_index');
                app.webservice.get(
                    'maps?q[store_id_eq]='+store_id,
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));
                        $.each(result.stores, function (i, store) {
                            console.log("store: "+store.name);
                            app.views.leaflet.showMap(store.latitude, store.longitude, true);
                        });
                    },
                    function (err){
                        console.log(JSON.stringify(err));    
                    }
                );
            }
        },
        vMap: {
            map: '',
            infoWindow: null,
            userPoss: '',
            latlngbounds: '',
            directionsDisplay: '',
            directionsService: '',
            markerCluster: null,
            geocoder: '',
            category_id: null,
            department_id: null,
            streetMarker: null,
            gpsError: null,
            init: function (e) {
                console.log('app.views.vMapView.init()');
                $('.carousel').addClass('hide');
                $('#menubutton').addClass('hide');
                $('#landingPageMenu').addClass('hide');
                $('.navbar').removeClass('hide');
                $('#backLink').removeClass('hide');

                $('#splashView').addClass('hide');
                $('.navbar-fixed-bottom').addClass('hide');

                app.views.vMap.category_id = null;
                app.views.vMap.department_id = null;
                app.views.vMap.infoWindow = null;

                app.views.vMap.geocoder = new google.maps.Geocoder();
                app.views.vMap.directionsService = new google.maps.DirectionsService();
                app.views.vMap.directionsDisplay = new google.maps.DirectionsRenderer();

                app.views.vMap.category_id = null;
                app.views.vMap.department_id = null;
                
                app.views.vMap.gpsError = false;
                
                $('#content').html('');
                
                app.views.setDefaults();
                //app.views.loadView.show();$('#map_load_icon').removeClass('hide');
                
                app.draw(
                    '#content',
                    '#vMapView',
                    'vMapView',
                    {},
                    '',
                    function () {
                        app.bindEvents();

                        $('#mapContent').height($(window).height() - ($('#menuNavBar').height() + $('.mapDiv form').height()+50));
                        
                        $('#inAddress').autocomplete({
//                            appendTo: "#navBarVMap",
                            autoFocus: true,
                            source: function (request, response) {
                                app.views.vMap.geocoder.geocode({ 'address': $('#inAddress').val(), 'region': app.lang.preferredLanguage }, function (results, status) {
//                                    console.log(results);
                                    if (status == google.maps.GeocoderStatus.OK) {
                                        response($.map(results, function (item) {
                                            return {
                                                label: item.formatted_address,
                                                value: item.formatted_address,
                                                latitude: item.geometry.location.lat(),
                                                longitude: item.geometry.location.lng()
                                            }
                                        }));
                                    }else {
                                       // navigator.notification.alert(app.lang.getStr('%No adress found%', 'vMapView'), function () {
                                       // }, app.lang.getStr('%Error%', 'vMapView'), app.lang.getStr('%Close%', 'vMapView'));
                                    }
                                });
                            },
                            select: function (event, ui) {
                                $('#inAddress').val(ui.item.label);
//                                $("#txtLatitude").val(ui.item.latitude);
//                                $("#txtLongitude").val(ui.item.longitude);
                                app.views.vMap.getStoresByStreet(ui.item);
                            }
                        });
                        
                        $('#inAddress').focusout(function(){
                            if($('#inAddress').val()=='')
                                app.views.vMap.getStores();
                        });
                        
                        $('#inAddress').keypress(function(e) {
                            if ( e.which == 13 ) {
                                app.views.vMap.getStores();
                                return false;
                            }
                        });
                        
                        app.views.vMap.getPosition() ;
                        
                        if(window.localStorage.getItem("radius")){
                            $('#slRadius').val(window.localStorage.getItem("radius"));
                        }
                        
                        console.log('montando mapa' + app.device.latitude + ', ' + app.device.longitude);

                    }
                );
            },
            getPosition: function(){
                console.log('app.views.vMap.getPosition()');
                navigator.geolocation.getCurrentPosition(
                    function (position) {
                        console.log('GPS RESULT');
                        console.log(position);

                        app.device.latitude  = position.coords.latitude;
                        app.device.longitude = position.coords.longitude;
                        
//                        app.device.latitude  = 40.8285828;
//                        app.device.longitude = -72.9359057;
                        
                        app.views.vMap.renderMap();
                        app.views.vMap.localDepartment();

                        app.views.vMap.getStores();
                        
                        app.geolocation.start();
                        
                    },
                    function (error) {
                        //console.log('GPS ERROR');
                        //console.log(JSON.stringify(error));
                        
                        if(!app.views.vMap.gpsError){
                            
                            //navigator.notification.alert(app.lang.getStr('%Was not possible to pinpoint your location, please call your GPS.%', 'aplication'), function(){}, app.lang.getStr('%GPS error%', 'aplication'), app.lang.getStr('%Close%', 'aplication'));
                            
                            app.device.latitude  = null;
                            app.device.longitude = null;
                            
                            app.views.vMap.gpsError = true;
                            
                            app.views.vMap.renderMap();
                            app.views.vMap.localDepartment();

                            app.views.vMap.getStores();
                        }
                        
                        setTimeout(function(){
                           app.views.vMap.getPosition() ;
                        },5000);
                    },
                    {timeout: 10000, enableHighAccuracy: true}
                );
            },
            showMap: function(e){
                setTimeout(function(){
                    app.views.vMap.renderMap();
                    app.views.vMap.showStores();
                },300)
            },
            renderMap: function(){
                console.log('app.views.vMap.renderMap()');
                //console.log('RENDER MAP DEVICE> ' + app.device.latitude +', ' +app.device.longitude);

                var userLocation = new google.maps.LatLng(app.device.latitude, app.device.longitude);
                
                var mapOptions = {
                    center: userLocation,
                    zoom: 13,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                app.views.vMap.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

                google.maps.event.addListener(app.views.vMap.map, 'tilesloaded', function() {
                    // Visible tiles loaded!
                    console.log('LOAD MAPS TOTAL');

                    //app.views.loadView.hide();$('#map_load_icon').addClass('hide');

                });
                
                var marker = new google.maps.Marker({
                    map: app.views.vMap.map,
                    position: userLocation,
                    draggable: false,
                    clickable: false
                });

                app.views.vMap.userPoss = marker;
            },
            getStores: function () {
                console.log('app.views.vMap.getStores()');
                //console.log('DEVICE> ' + app.device.latitude +', ' +app.device.longitude);
                //console.log('MAP> ' + app.views.vMap.lat +', ' +app.views.vMap.long);

                var option = {
                    latitude: !app.views.vMap.lat ? app.device.latitude : app.views.vMap.lat,
                    longitude: !app.views.vMap.long ? app.device.longitude : app.views.vMap.long
                };

                if (app.views.vMap.category_id) {
                    option.category_id = app.views.vMap.category_id;
                }

                if (app.views.vMap.department_id) {
                    option.department_id = app.views.vMap.department_id;
                }
                
                if($('#slRadius').val()!=''){
                    
                    option.radius = $('#slRadius').val();
                    
                }
                
                if($('#inAddress').val()!=''){
                    
                    option.address = $('#inAddress').val();
                    app.views.vMap.userPoss.setMap(null);
                    
                    option.radius = null;
                    $('#slRadius').val('');
                    option.latitude = null;
                    option.longitude = null;
                    
                }else{
                    
                    if(app.views.vMap.streetMarker){
                        app.views.vMap.streetMarker.setMap(null);
                        app.views.vMap.streetMarker = null;
                    }
                    
                    app.views.vMap.userPoss.setMap(app.views.vMap.map);
                    
                }
                
                //app.views.loadView.show();$('#map_load_icon').removeClass('hide');
                
                app.webservice.get(
                    'maps',
                    option,
                    function (result) {
                        console.log(JSON.stringify(result));
                        //app.views.loadView.hide();$('#map_load_icon').addClass('hide');
                        
                        $('#storeList').html('');
                        app.views.stores = new Array();
                        
                        app.views.home.showStores(result, true,false,1);
                        
                        app.views.vMap.showStores();
                        
                    },
                    function (err) {
                        console.log(JSON.stringify(err));
                        //app.views.loadView.hide();$('#map_load_icon').addClass('hide');
                    }
                );
            },
            showStores: function () {
                console.log('app.views.vMap.showStores');
                app.views.vMap.removeAllMarker();
                
                app.views.vMap.latlngbounds = new google.maps.LatLngBounds();

                $.each(app.views.stores, function (i, store) {
                    var marker = new google.maps.Marker({
                        map: app.views.vMap.map,
                        position: new google.maps.LatLng(store.latitude, store.longitude),
                        draggable: false,
                        clickable: true
                        /*icon: 'img/store5.png'*/
                    });
                    
                    var html = app.views.vMap.buildContactStore(store);
                    
                    var myOptions = {
                        content: html
                    };

                    var infoWindow = new google.maps.InfoWindow(myOptions);

                    google.maps.event.addListener(marker, 'click', function (e) {

                        if (app.views.vMap.infoWindow)
                            app.views.vMap.infoWindow.close();

                        infoWindow.open(app.views.vMap.map, marker);
                        app.views.vMap.infoWindow = infoWindow;
                    });

                    app.views.vMap.latlngbounds.extend(marker.position);
                    app.views.vMap.marker.push(marker);
                });
                
                app.views.vMap.markerCluster = new MarkerClusterer(app.views.vMap.map, app.views.vMap.marker);
                
                if(app.views.vMap.marker.length>0){
                    
                    if(!app.views.vMap.streetMarker){
                        
                        app.views.vMap.latlngbounds.extend(app.views.vMap.userPoss.position);
                        
                    }else{
                        
                        app.views.vMap.latlngbounds.extend(app.views.vMap.streetMarker.position);
                        
                    }
                    
                    app.views.vMap.map.fitBounds(app.views.vMap.latlngbounds);
                    
                }else{
                    
                    app.views.vMap.map.setZoom(8);
                    
                }
                
                //centralizando o mapa
                if(!app.views.vMap.streetMarker){
                    
                    app.views.vMap.map.setCenter( new google.maps.LatLng(app.device.latitude,app.device.longitude) );
                    
                }else{
                    
                    app.views.vMap.map.setCenter( app.views.vMap.streetMarker.position );
                    
                }
                
                
                app.views.vMap.directionsDisplay.setMap(app.views.vMap.map);
                //console.log(app.views.vMap.marker);
            },
            buildContactStore: function (store) {
                console.log('app.vMap.buildContactStore()');
                
                var html = '<div class="storeItem" style="border: none;">';
                html +=         '<div class="row">';
                html +=         '    <div class="col-xs-4 col-sm-4 logoStoreDiv">';
                html +=         '        <img src="'+store.logo+'" class="img-responsive img-rounded" style="max-width: 100%;" store_index="{{index}}" onclick="app.views.home.storeDetail(this);"/>';
                html +=             '</div>';
                html +=         '    <div class="col-xs-8 col-sm-8">';
                html +=         '        <h5 class="text-left">' + stripLeadingTag(store.name) + '</h5>';
                html +=         '        <h6 class="text-left HstoreAbout">' + store.about + '</h6>';
                html +=         '    </div>';
                html +=         '</div>';
                html +=         '<div class="row">';
                html +=         '    <div class="col-xs-12 col-sm-12">';
                html +=         '        <h5 class="text-left HstoreAddress">' + store.city + ', ' + store.state + '</h5>';
                html +=         '    </div>';
                html +=         '</div>';
                
                if (store.phone) {
                    html += '       <div class="row">';
                    html +=         '    <div class="col-xs-12 col-sm-12">';
                    html += '           ' + app.lang.getStr('%CALL NOW%', 'vMapView') + ': <a href="#" onclick="window.location.href=\'tel:' + store.phone + '\';" class="btn-link">' + store.phone + '</a>';
                    html +=         '    </div>';
                    html += '       </div>';
                }
                if (store.email) {
                    html += '       <div class="row">';
                    html +=         '    <div class="col-xs-12 col-sm-12">';
                    html += '           ' + app.lang.getStr('%Email%', 'contactView') + ': <a href="mailto:' + store.email + '"  class="btn-link">' + store.email + '</a>';
                    html +=         '    </div>';
                    html += '       </div>';
                }

                html +=         '<div class="row">';
                html +=         '    <div class="col-xs-6 col-sm-6">';
                html +=         '        <a href="#" class="btn btn-product" store_id="' + store.id + '" onclick="app.views.vMap.showStoreDetail(this);">' + app.lang.getStr('%Produts%', 'storeItem') + '</a>';
                html +=         '    </div>';
                html +=         '    <div class="col-xs-6 col-sm-6">';
                html +=         '        <a href="#" class="btn btn-contact" lat="'+store.latitude+'" long="'+store.longitude+'" onclick="app.views.vMap.rote(this);">'+app.lang.getStr('%Rote%','vMapView')+'</a>';
                html +=         '    </div>';
                html +=         '</div>'
                html += '</div>'

                return html;
            },
            removeAllMarker: function () {
                console.log('app.views.vMap.removeAllMarker()');
                
                for (var i in app.views.vMap.marker) {
                    app.views.vMap.marker[i].setMap(null);
                    app.views.vMap.marker[i] = null;
                }

                app.views.vMap.marker = [];
                app.views.vMap.directionsDisplay.setDirections({routes: []});
                
                if(app.views.vMap.markerCluster)
                    app.views.vMap.markerCluster.clearMarkers();
                
            },
            rote: function (e) {
                console.log('app.views.vMap.route');
                var start = app.device.latitude + ', ' + app.device.longitude;
                var end = $(e).attr('lat') + ', ' + $(e).attr('long');

                var request = {
                    origin      : start,
                    destination : end,
                    travelMode  : $("input[name=slTransp]:checked").val(),
                    unitSystem  : (app.lang.getStr('%Feet%', 'vMapView')=='Feet' ? google.maps.UnitSystem.IMPERIAL : google.maps.UnitSystem.METRIC)
                };
                app.views.vMap.directionsService.route(request, function (response, status) {
//                    console.log(response);
//                    console.log(status);
                    if (status == google.maps.DirectionsStatus.OK) {
                        app.views.vMap.directionsDisplay.setDirections(response);
                        
                        if(app.views.vMap.streetMarker)
                            app.views.vMap.userPoss.setMap(app.views.vMap.map);
                        
                    } else{
                        navigator.notification.alert(app.lang.getStr('%No rote found%', 'vMapView'), function () {
                        }, app.lang.getStr('%Error%', 'vMapView'), app.lang.getStr('%Close%', 'vMapView'));
                    }
                });
            },
            showStoreDetail: function (e) {
                console.log('app.views.vMap.showStoreDetail');
                app.webservice.get(
                    'stores/' + $(e).attr('store_id'),
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));

                        app.views.stores = [result];
                        app.views.home.storeDetail();
                    },
                    function (err) {
                        console.log(JSON.stringify(err));
                        //app.views.loadView.hide();$('#map_load_icon').addClass('hide');
                    }
                );
            },
            showFilterStreet: function (e) {
                console.log('app.views.vMap.showFilterStreet');
                $('#liRadius').addClass('hide');
                $('#liStreet').removeClass('hide');
                
                $('#inAddress').val('');
                
                $('#dpdName').html('Street <b class="caret"></b>');
            },
            showFilterRadius: function (e) {
                console.log('app.views.vMap.showFilterRadius');
                
                $('#inAddress').val('');
                
                if(app.views.vMap.streetMarker){
                    
                    app.views.vMap.streetMarker.setMap(null);
                    app.views.vMap.streetMarker = null;
                    
                }
                
                app.views.vMap.lat = null;
                app.views.vMap.long = null;

                $('#hidRadius').val($(e).attr('radius'));
                
                window.localStorage.setItem("radius",$('#slRadius').val());
                
                app.views.vMap.getStores();
            },
            showDepFilter: function (e) {
                console.log('app.views.vMap.showDepFilter');
                $('#btContactClose').html(app.lang.getStr('%Close%', 'vMapView'));

                $('#modalFilterMap').modal('show');

                app.views.vMap.localDepartment();

            },
            localDepartment: function (e) {
                console.log('app.views.vMap.localDepartment');
                app.webservice.get(
                    'departments',
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));
                        $('#slCategory').html('<option value="">' + app.lang.getStr('%All Departments%', 'vMapView'));
                        $.each(result.departments, function (i, dep) {
                            app.draw(
                                '#slCategory',
                                '#storeCategoryItem',
                                'vMap',
                                {
                                    id: dep.id,
                                    name: stripLeadingTag(dep.name)
                                },
                            'append',
                                function () {
                                }
                            );
                        });
                        app.bindEvents();

                    },
                    function (err) {
                        console.log(JSON.stringify(err));
                        //app.views.loadView.hide();$('#map_load_icon').addClass('hide');
                    }
                );
            },
            getStoresByCategory: function (e) {
                console.log('app.views.vMap.getStoresByCategory()');
                app.views.vMap.department_id = null;
                app.views.vMap.category_id = $(e).val();
                app.views.vMap.getStores();
                $('#modalFilterMap').modal('hide');
            },
            getStoresByStreet: function (item) {
                console.log('app.views.vMap.getStoresByStreet()');
                
                if(app.views.vMap.streetMarker){
                    
                    app.views.vMap.streetMarker.setPosition(new google.maps.LatLng(item.latitude, item.longitude));
                    
                }else{
                    
                    var marker = new google.maps.Marker({
                        map: app.views.vMap.map,
                        position: new google.maps.LatLng(item.latitude, item.longitude),
                        draggable: true
                    });

                    app.views.vMap.streetMarker = marker;
                }
                
                app.views.vMap.getStores();
            }
        },
        notification: {
            isRadius : true,
            streets : [] ,
            departments : [],
            geocoder : null,
            init: function (e) {
                
                app.views.vMap.geocoder = new google.maps.Geocoder();
                console.log(JSON.stringify(app.device));
                app.draw(
                    '#content',
                    '#notificationView',
                    'notificationView',
                    {},
                    '',
                    function () {
                        
                        $('#slRadius').val(app.device.radius);
                        
                        $('#inpNotStreet').autocomplete({
                            source: function (request, response) {
                                app.views.vMap.geocoder.geocode({ 'address': $('#inpNotStreet').val(), 'region': app.lang.preferredLanguage }, function (results, status) {
                                    console.log(results);
                                    if (status == google.maps.GeocoderStatus.OK) {
                                        response($.map(results, function (item) {
                                            return {
                                                label: item.formatted_address,
                                                value: item.formatted_address,
                                                latitude: item.geometry.location.lat(),
                                                longitude: item.geometry.location.lng()
                                            }
                                        }));
                                    }
                                });
                            },
                            select: function (event, ui) {
                                
                                app.webservice.post( 
                                    'streets', 
                                    'PUT', 
                                    {"street": {"address":ui.item.value, "latitude":ui.item.latitude, "longitude":ui.item.longitude} }
                                    , function(r){
                                        console.log('SUCESSO ADD STREET: '+ JSON.stringify(r));
                                        var itemList = '<li class="list-group-item"><a href="#" data-callback="app.views.notification.removeStreet" class="btn btn-link" address="'+ui.item.label+'" street_id="'+r.id+'" id="st_'+r.id+'"><span class="icon icon-close"></span></a>'+ui.item.label+'</li>';
                                        $('#streetList').append(itemList);
                                
                                        app.bindEvents();
                                    }, function(e){
                                        console.log('ERRO ADD STREET');
                                        console.log(JSON.stringify(e));
                                    }
                                );
                            
//                                app.views.notification.streets.push(ui.item.label);
//                                console.log(app.views.notification.streets);
//                                app.views.notification.addStreet(ui.item);
                                
                                setTimeout(function(){$('#inpNotStreet').val('');}, 100);
                                
                                
                            }
                        });
                        
                        app.views.notification.localDepartment();
                        app.views.notification.showStreets();
                        app.bindEvents();
                    }
                );
            },
            update: function(){
                console.log('app.views.notification.update');
                
                var option = {'device':{}};
                
                if(app.views.notification.isRadius==true){
                    console.log('vai com radius');
                    option.device.radius = $('#slRadius').val();
                    option.device.streets = [];
                    
                }else{
                    console.log('vai com Street');
                    option.device.streets = app.views.notification.streets;
                    
                }
                
                option.device.department_ids = app.views.notification.departments;
//                console.log('OPTIONS>' + JSON.stringify(option));
                app.webservice.post( 
                    '', 
                    'PUT', 
                    option
                    , function(r){
                        console.log('SUCESSO NOTIFICATION: '+ JSON.stringify(r));

                    }, function(e){
                        console.log('ERRO NOTIFICATION');
                        console.log(JSON.stringify(e));
                    }
                );
            },
            chooseRadius: function(){
                console.log('app.views.notification.chooseRadius');
                app.views.notification.isRadius = true;
            },
            chooseStreet: function(){
                console.log('app.views.notification.chooseStreet');
                app.views.notification.isRadius = false;
            },
            removeStreet: function(e){
                
                app.webservice.post( 
                    'streets/' + $(e).attr('street_id'), 
                    'DELETE', 
                    {}
                    , function(r){
                        console.log('SUCESSO ADD STREET: '+ JSON.stringify(r));
                        $('#st_'+$(e).attr('street_id')).parent().remove();
                    }, function(e){
                        console.log('ERRO ADD STREET');
                        console.log(JSON.stringify(e));
                    }
                );                
            },
            showStreets: function(){
                console.log('app.views.notification.showStreets()');
                
                $.each(app.device.streets, function (i, streets) {
                    var itemList = '<li class="list-group-item"><a href="#" data-callback="app.views.notification.removeStreet" class="btn btn-link" address="'+streets.address+'" street_id="'+streets.id+'" id="st_'+streets.id+'"><span class="icon icon-close"></span></a>'+streets.address+'</li>';
                    $('#streetList').append(itemList);
                });
            },
            localDepartment: function () {
                console.log('app.views.vMap.localDepartment');
                $('#byDepartmentMap .list-group').html('<li class="list-group-item"><img src="img/load_image.gif" style="width: 28px;" /></li>');
                app.webservice.get(
                    'departments',
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));
                        $('#byDepartmentMap .list-group').html('');
                        $.each(result.departments, function (i, dep) {
                            app.draw(
                                '#byDepartmentMap .list-group',
                                '#NotificationCategoryItem',
                                'notification',
                                {
                                    id: dep.id,
                                    name: stripLeadingTag(dep.name)
                                },
                                'append',
                                function () {
                                }
                            );
                        });
                        console.log('MARCANDO CHECK');
                        console.log(JSON.stringify(app.device.departments));
                        $.each(app.device.departments, function (i, dep2) {
                            console.log(dep2);
                            $('#notCat' + dep2.id).attr("checked",true);
                        });
                        
                        app.bindEvents();

                    },
                    function (err) {
                        console.log(JSON.stringify(err));
                        //app.views.loadView.hide();$('#map_load_icon').addClass('hide');
                    }
                );
            },
            addRemoveCategory: function(e){
                console.log('app.views.vMap.addRemoveCategory');
                
                if($(e).is(':checked')){
                    console.log('checado');
                    app.views.notification.departments.push($(e).attr('category_id'));
                    
                    app.views.notification.update();
                    
                }else{
                    console.log('nao checado');
                    var aux = [];
                
                    for(var i=0; i<app.views.notification.departments.length; i++){
                        if(app.views.notification.departments[i]!=$(e).attr('category_id')){
                            aux.push(app.views.notification.departments[i]);
                        }
                    }

                    app.views.notification.departments = aux;
                    app.views.notification.update();
                }
            }
        },
        chat: {
            start: true,
            chekTime : '',
            stores  : [],
            init: function(e){
                console.log('app.views.chat.init()');
                console.log('store_index:'+$(e).attr('store_index'));

                if($(e).attr('dadStore')=='true' && app.views.home.oStoreDetail){
                    store = app.views.home.oStoreDetail;
                }else{
                    store = $(e).attr('dadStore')=='true' ? app.views.stores[$(e).attr('store_index')] : app.views.home.storesChild[$(e).attr('store_index')];
                }

                app.views.chat.openChat(store);
                
            },
            openChat: function(store){
                console.log('app.views.chat.openChat');
                $('.carousel').addClass('hide');
                $('#menubutton').addClass('hide');
                $('#landingPageMenu').addClass('hide');
                $('.navbar').removeClass('hide');
                $('#backLink').removeClass('hide');
                
                app.draw(
                    '#content',
                    '#chatView',
                    'chatView',
                    {
                        storeLogo : store.logo,
                        storeName : stripLeadingTag(store.name),
                        store_id  : store.id
                    },
                    '',
                    function () {
                        console.log('get message');
                        app.webservice.get(
                            'stores/'+store.id+'/messages',
                            {},
                            function (result) {
                                //console.log(JSON.stringify(result));
                                app.views.backStack.push("ChatView");
                                if(!app.device.email){
                                    $('#newChatForm').removeClass('hide');
                                    app.views.chat.start = false;
                                }

                                $('.chatContent').css('height', ($(window).height() - ($('#menuNavBar').outerHeight(true)+$('#navChatFooter').outerHeight(true))));
                                $('#chatList').css('height',($('.chatContent').height()-$('#storeTitle').outerHeight(true)));

                                $.each(result.messages, function (index, item) {
                                    app.views.chat.addMessage(item,stripLeadingTag(store.name));
                                });
                                setTimeout(function(){ 
                                    $("#chatList").animate({ scrollTop: $('#chatList').prop("scrollHeight")}, 1000);
                                }, 
                                500);

                                app.views.chat.checkUnreadMessage();                    
                            },
                            function (err) {
                                console.log(err);
                            }
                        );
                        
                        app.bindEvents();
                        
                    }
                ); 
            },
            addMessage: function(item,storeName){
                console.log('app.views.chat.addMessage');
                var name = '';
                if (item.kind == 1){
                    if (app.device.name) name = app.device.name;
                    else name = $('#chatUserName').val();
                }else {
                    if (storeName) name=storeName;
                    else name=app.views.home.oStoreDetail.name;
                }
                var dt = new Date(item.created_at);
                navigator.globalization.dateToString(
                    dt,
                    function (date) {
                        app.draw(
                            '#chatList',
                            '#chatItem',
                            'chatItem',
                            {
                                id      : item.id,
                                message : item.message,
                                msgDate : date.value,
                                email   : name,
                                kind    : name
                            },
                            'append',
                            function () {
                                app.bindEvents();
                            }
                        );
                    },
                    function () {console.log('Error getting dateString\n');},
                    {formatLength:'short', selector:'date and time'}
                );
            },
            list: function(e){
                console.log('app.views.chat.list()');
                app.views.backStack.push("Chats");
                $('.carousel').addClass('hide');
                $('#menubutton').addClass('hide');
                $('#landingPageMenu').addClass('hide');
                $('.navbar').removeClass('hide');

                app.draw(
                    '#content',
                    '#chatListView',
                    'chatListView',
                    {},
                    '',
                    function () {
                        
                        app.views.loadView.show();
                        
                        app.webservice.get(
                            'messages',
                            {},
                            function (result) {
                                console.log(result);
                                app.views.loadView.hide();
                                
                                app.views.chat.stores = result.stores;
                                
                                $.each(result.stores, function (index, item) {
                                    app.views.chat.addStore(item,index);
                                });
                                
                                if(result.stores.length==0){
                                    $('#chatStoreList').html(app.lang.getStr('%No chat is initialized%', 'chatView'));
                                }
                            },
                            function (err) {
                                console.log(err);
                                app.views.loadView.hide();
                            }
                        );
                        
                        app.bindEvents();
                        
                    }
                );
            },
            loadStoreChat: function(e){
                console.log('app.views.chat.loadStoreChat()');
                
                app.views.chat.openChat(app.views.chat.stores[$(e).attr('store_index')]);
                
            },
            addStore : function(storeChat,index){
                console.log('app.views.chat.addStore');
                app.draw(
                    '#chatStoreList',
                    '#chatStoreItem',
                    'chatView',
                    {
                        index          : index,
                        id             : storeChat.id,
                        img            : storeChat.logo,
                        storeName      : storeChat.name,
                        messages_count : storeChat.messages_count
                    },
                    'append',
                    function () {
                        if (storeChat.messages_count == 0){
                            $("#storeBadge_"+storeChat.id).removeClass('vex-badge');
                            $("#storeBadge_"+storeChat.id).addClass('gray-badge');
                        } else {
                            $("#storeBadge_"+storeChat.id).addClass('vex-badge');
                            $("#storeBadge_"+storeChat.id).removeClass('gray-badge');
                        }
                        app.bindEvents();
                    }
                );
            },
            sendMessage: function(e){
                console.log('app.views.chat.sendMessage()');
                
                if(!app.views.chat.start){
                    
                    if($('#chatUserName').val()=='' && !app.device.name){
                        $('.alert-danger').html(app.lang.getStr('%The field <b>Name</b> is mandatory%','chatView'));
                        $('.alert-danger').removeClass('hide');
                        $('#chatUserName').focus();
                        
                        
                        $('.chatContent').css('height', ($(window).height() - ($('#menuNavBar').outerHeight(true)+$('#navChatFooter').outerHeight(true))));
                        $('#chatList').css('height',($('.chatContent').height()-$('#storeTitle').outerHeight(true)));

                        return;
                    }
                    
                    if($('#chatUserEmail').val()==''&& !app.device.email){
                        $('.alert-danger').html(app.lang.getStr('%The field <b>Email</b> is mandatory%','chatView'));
                        $('.alert-danger').removeClass('hide');
                        $('#chatUserMessage').focus();
                        
                        $('.chatContent').css('height', ($(window).height() - ($('#menuNavBar').outerHeight(true)+$('#navChatFooter').outerHeight(true))));
                        $('#chatList').css('height',($('.chatContent').height()-$('#storeTitle').outerHeight(true)));

                        return;
                    }
                }
                
                if($('#chatUserMessage').val()==''){
                    $('.alert-danger').html(app.lang.getStr('%The field <b>Message</b> is mandatory%','chatView'));
                    $('.alert-danger').removeClass('hide');
                    $('#chatUserMessage').focus();
                    return;
                }
                
                app.webservice.post(
                    'stores/'+$(e).attr('store_id')+'/messages',
                    'POST',
                    { 
                        "message": {
                            "message": $('#chatUserMessage').val()
                        } 
                    },
                    function (result) {
                        console.log(JSON.stringify(result));
                        
                        app.views.chat.addMessage(result);
                        
                        $('#newChatForm').addClass('hide');
                        $('.alert-danger').addClass('hide');
                        
                        
                        $('.chatContent').css('height', ($(window).height() - ($('#menuNavBar').outerHeight(true)+$('#navChatFooter').outerHeight(true))));
                        $('#chatList').css('height',($('.chatContent').height()-$('#storeTitle').outerHeight(true)));
                        
                        $('#chatUserMessage').val('');
                        
                        if(!app.device.email){
                            app.webservice.post(
                                'device',
                                'PUT',
                                {
                                    device: {
                                        email : $('#chatUserEmail').val(),
                                        name  : $('#chatUserName').val()
                                    }
                                },
                                function (result) {
                                    console.log(JSON.stringify(result));
                                    app.device.name = result.name;
                                    app.device.email = result.email;
                                    
                                },
                                function (err) {
                                    console.log(JSON.stringify(err));
                                }
                            );
                        }
                    },
                    function (err) {
                        console.log(err);
                    }
                );
            },
            checkMensage: function(store_id, store_name){
                console.log('app.views.chat.checkMensage()');
                
                app.webservice.get(
                    'stores/'+store_id+'/messages/unread',
                    {},
                    function (result) {
                        $.each(result.messages, function (index, item) {
                            app.views.chat.addMessage(item,store_name);
                        });
                                
                        if(result.messages.length>0){
                            setTimeout(function(){ 
                                $("#chatList").animate({ scrollTop: $('#chatList').prop("scrollHeight")}, 1000);
                            }, 
                            500);
                        }
                    },
                    function (err) {
                        console.log(err);
                    }
                );
            },
            checkUnreadMessage: function(){
                console.log('app.views.chat.checkUnreadMessage()');
                
                app.webservice.get(
                    'messages',
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));
                        var count = 0;
                        $.each(result.stores, function (index, item) {
                            if (parseInt(item.id) == parseInt($('#storeTitleName').attr('store_id'))){
                                app.views.chat.checkMensage(item.id,item.name);
                            } else {
                                count += item.messages_count;
                            }
                            var badge_store_id = "#storeBadge_" + item.id;
                            if ($(badge_store_id) && item.messages_count > 0){
                                $(badge_store_id).html(item.messages_count);
                                $(badge_store_id).addClass('vex-badge');
                                $(badge_store_id).removeClass('gray-badge');
                            } else {
                                $(badge_store_id).html(item.messages_count);
                                $(badge_store_id).removeClass('vex-badge');
                                $(badge_store_id).addClass('gray-badge');
                            }
                        });
                        if(count>0){
                            $("#msgcount1").html(count);
                            $('#msgcount1').removeClass('hide');
                            $("#msgcount2").html(count);
                            $('#msgcount2').removeClass('hide');
                            $("#msgcount3").html(count);
                            $('#msgcount3').removeClass('hide');
                            $("#msgcount4").html(count);
                            $('#msgcount4').removeClass('hide');
                        }else{
                            $('#msgcount1').addClass('hide');
                            $('#msgcount2').addClass('hide');
                            $('#msgcount3').addClass('hide');
                            $('#msgcount4').addClass('hide');
                        }
                    },
                    function (err) {
                        console.log(err);
                    }
                );
            }
        }
    },
    showToken: function () {

        $('#modalContact .modal-title').html('TOKEN');

        $('#btContactClose').html(app.lang.getStr('%Close%', 'contactView'));

        $('#modalContact .modal-body').html('<input type="text" class="form-control"  value="' + app.device.push_token + '"/>');
        $('#modalContact').modal('show');

    }
};

//start point!
$(document).ready(function () {
    console.log('Run app');
    app.initialize();
});
function loadstartcb(event){
    console.log("loadstart");
}
function loadstopcb(event){
    console.log("loadstop");
}
function loaderrorcb(event){
    console.log("loaderror");
}
function stripAbout(about){
    // **hideAddress,showMapButton,hideChatButton,showOnMap,hideContactButton,fuelIcon,foodIcon,exitIcon,hotelIcon**
    aboutStripped = about;
    var strArray = about.split("**");
    if (strArray.length > 0){
        aboutStripped = strArray[strArray.length-1];
    }else {
        aboutStripped = about;
    }
    return aboutStripped;
}
function hasCode(about,code){
    var strArray = about.split("**");
    var strCodes;
    if (strArray.length > 1){
        strCodes = strArray[1];
        var codeArray = strCodes.split(",");
        for (i=0; i<codeArray.length; i++){
            if (code.indexOf(codeArray[i]) === 0)
                return true;
        }
    }
    return false;
}
function stripLeadingTag(inputText){
    var strArray;
    strArray = inputText.split("**");
    var len = strArray.length;
    if (len > 0) return strArray[len-1];
    else return inputText;
}
function isHome(inputText){
    var strArray;
    strArray = inputText.split("**");
    var len = strArray.length;
    if (len >= 2){
        if (strArray[1].indexOf('Home') > -1){ return true;}
    }
    return false;
}
function addReadMore2(text, store_id, id, readMode) { /* to make sure the script runs after page load */
    var descriptionStr = convertLinks(text);
    return strip(descriptionStr);
}
function addReadMore(text, store_id, id, readMode) { /* to make sure the script runs after page load */

    var max_length = 110; /* set the max content length before a read more link will be added */
    var link = '...<a href="#" class="read_more readMore toProduct" style="font-size: 100%;" data-callback="app.views.products.productDetail" store_id="' + store_id + '" prod_id="' + id + '" type="description" data-pin="false"> ' + readMode + '</a>';

    if (text.length > max_length) { /* check for content length */

        var short_content = text.substr(0, max_length); /* split the content in two parts */

        return (short_content + link);

    } else
        return text + link;
}

function lineBreak(text) {
    var max_length = 25;

    if (text.length > max_length) { /* check for content length */

        var short_content = text.substr(0, max_length);

        var rest = text.substr(max_length, text.length);

        if (rest.length > max_length) {
            short_content = short_content + '<br/>' + lineBreak(rest);

        } else
            short_content = short_content + '<br/>' + rest;

        return short_content;

    } else
        return text;
}

function strip(html)
{
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent || tmp.innerText || "";
}
function getCategoryId(cats,cat_name){
    var c_id = 0;
    $.each(cats, function (index, c) {
        if (c.count_products != 0) {
            if (c.subcategories.length > 0) {
                $.each(c.subcategories, function (i, sub) {
                    if (sub.name.indexOf(cat_name) == 0  && sub.name.length == cat_name.length){
                        c_id = sub.id;
                        return c_id;
                    }
                });
            } else {
                if (c.name.indexOf(cat_name) == 0 && c.name.length == cat_name.length){
                    c_id = c.id;
                    return c_id;
                }
            }
        }
    });
    return c_id;
}
function convertLinks2(text) {
    var div = document.createElement('div');
    div.innerHTML = text;
    var a = div.getElementsByTagName("a");
    
    for (i=0; i<a.length; i++){
        console.log("href: "+a[i].href);
        a[i].setAttribute("data-site",a[i].href);
        a[i].setAttribute("data-callback","app.views.home.openSite");
        a[i].href = "#"
    }
    console.log("innerHTML:"+div.innerHTML);
    return div.innerHTML;
}
function convertLinks(text) {
    var div = document.createElement('div');
    div.innerHTML = text;
    var pureText = div.innerText;
    links = linkify.find(pureText);
    for (j=0; j<links.length; j++){
        if (links[j].type.indexOf('url') > -1){
            if (links[j].href.indexOf('calendar') > -1) {
                text = text.replace(links[j].href, '<a href="#" data-callback="app.views.home.openSite" data-site="' + links[j].href + '" >' + "Calendar" + '</a>');
            } else {
                text = text.replace(links[j].href, '<a href="#" data-callback="app.views.home.openSite" data-site="' + links[j].href + '" >' + links[j].href + '</a>');
            }
        }
    }
    return text;
}
function findContact(text) {

    var reg = /([0-9]{3}) [0-9]{3}-[0-9]{4}/;
    var rtn;

    if (reg.test(text)) {

        rtn = reg.exec(text);

        text = text.replace(rtn[0], '<a href="#" onclick="window.location.href=\'tel:' + rtn[0] + '\';" class="btn btn-link">' + rtn[0] + '</a>');
    }

    //email
    reg = /[a-zA-Z0-9][a-zA-Z0-9\._-]+@([a-zA-Z0-9\._-]+\.)([a-zA-Z]{2,6})/;

    if (reg.test(text)) {

        rtn = reg.exec(text);

        text = text.replace(rtn[0], '<a href="mailto:' + rtn[0] + '" class="btn btn-link">' + rtn[0] + '</a>');

    }
    //sites
    reg = /http?:\/\/(www\.)?([0-9a-zA-Z]+[-._+&amp;])*[0-9a-zA-Z]+([-0-9a-zA-Z]+[.])+([a-zA-Z]{2,6})?(\/[a-z-A-Z0-9+&@#\/%?=~_|!:,.;]*)?/;
    reg1 = /https?:\/\/(www\.)?([0-9a-zA-Z]+[-._+&amp;])*[0-9a-zA-Z]+([-0-9a-zA-Z]+[.])+([a-zA-Z]{2,6})?(\/[a-z-A-Z0-9+&@#\/%?=~_|!:,.;]*)?/;

    if (reg.test(text)) {

        rtn = reg.exec(text);

        text = text.replace(rtn[0], '<a href="#" data-callback="app.views.home.openSite" data-site="' + rtn[0] + '" class="btn btn-link">' + rtn[0] + '</a>');

    }
    else if (reg1.test(text)) {

        rtn = reg1.exec(text);

        text = text.replace(rtn[0], '<a href="#" data-callback="app.views.home.openSite" data-site="' + rtn[0] + '" class="btn btn-link">' + rtn[0] + '</a>');

    } else {
        //sites
        reg = /www?([0-9a-zA-Z]+[-._+&amp;])*[0-9a-zA-Z]+([-0-9a-zA-Z]+[.])+([a-zA-Z]{2,6})?(\/[a-z-A-Z0-9+&@#\/%?=~_|!:,.;]*)?/;

        if (reg.test(text)) {
            //console.log(text);
            rtn = reg.exec(text);

            text = text.replace(rtn[0], '<a href="#" data-callback="app.views.home.openSite" data-site="' + rtn[0] + '" class="btn btn-link">' + rtn[0] + '</a>');

        }
    }

    return text;
}