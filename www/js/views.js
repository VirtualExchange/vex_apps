var views = {
    views: {
        currentStore: {},
        scrool: 0,
        stores: [],
        departments: [],
        productsDrawn: [],
        backFunction: null,
        backStack: [],
        displayOnMap: [],
        homeInitCalled: 0,
        scrollPending: 0,
        browserRef: null,
        mapStore: [],
        storeDirect: 0,
        storeDirectChat: 0,
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
            if (app.views.storeDirectChat){
                hideHomeMenu();
                app.chat.goToChat(app.views.storeDirectChat);
                app.views.storeDirectChat = 0;
            }else if (app.views.storeDirect){
                hideHomeMenu();
                app.views.backStack.push("StoreDetail:"+app.views.storeDirect);
                var store = app.views.storeDirect;
                app.views.storeDirect = 0;
                app.home.getStoreDetail(store, true, 'true');
                
            } else {			
                console.log("app.views.goHome");
                $('#landingPageMenu').removeClass('hide');
                $('#loginSpinner').addClass('hide');
                app.chat.checkUnreadMessage();
                //app.products.showProductList(e);
                app.home.showStoreList();
                //app.home.showStoreListPre();
            }
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
            console.log("backToStr: "+backToStr);
            var backTo = backToStr.split(":");
            if (backTo[0] == "StoreList"){
                app.views.backStack.pop();
                app.home.showStoreList();
            } else if (backTo[0] == "StoreDetail"){
                if (backTo.length == 3){
                    app.home.showStoreListPre();
                }else{
                    app.home.getStoreDetail(backTo[1], true, 'true');
                }
            } else if (backTo[0] == "StoreListByDept"){
                if (backTo[3] == "filter")
                    app.home.storeListByDepartment(backTo[1], backTo[2],true);
                else if (backTo[3] == "noFilter")
                    app.home.storeListByDepartment(backTo[1], backTo[2],false);
            } else if (backTo[0] == "ProductDetail"){
                app.views.backStack.pop();
                app.products.showProductDetail(backTo[1],backTo[2],backTo[3]);
            } else if (backTo[0] == "ProductList"){
                app.products.showProductListMore2(backTo[1],backTo[2]);
            } else if (backTo[0] == "Favorites"){
                app.home.getFavorites();
            } else if (backTo[0] == "Pinned"){
                app.pin.init();
            } else if (backTo[0] == "Chats"){
                app.views.backStack.pop();
                app.chat.list();
            } else if (backTo[0] == "MapView"){
                app.views.backStack.pop();
                app.leaflet.showMap(backTo[1],backTo[2],backTo[3]);
            } else if (backTo[0] == "SearchView"){
                app.views.backStack.pop();
                app.search.init();
            } else if (backTo[0] == "OwnerLogin"){
                app.views.backStack.pop();
                app.ownerLogin.init();
            } else if (backTo[0] == "ownerChatList"){
                app.views.backStack.pop();
                app.ownerChat.list();
            } else if (backTo[0] == "ownerChatCustomerList"){
                app.views.backStack.pop();
                app.ownerChat.loadStoreList(backTo[1]);
            }else {
                console.log("****ERROR****:Back not recognized");
            }
            //app.views.backFunction();
            
        },
        showMenu: function(e){
             $('.navbar-collapse').collapse('show');
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
            /*
            app.draw(
                '#vex-navbar2',
                '#menuItemSearch2',
                'menuItemSearch2',
                {
                    name: app.lang.getStr('%Search%', 'aplication'),
                    id: 0
                },
                'append',
                function () {
                    app.bindEvents();
                }
            );
            */
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
                '#menuItemPinned2',
                'menuItemPinned2',
                {
                    name: app.lang.getStr('%Pinned%', 'aplication'),
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
            /*
            app.draw(
                '#vex-navbar2',
                '#menuItemAccount2',
                'menuItemAccount2',
                {
                    name: app.lang.getStr('%Account%', 'aplication'),
                    id: 0
                },
                'append',
                function () {
                    app.bindEvents();
                }
            );
            */
            app.draw(
                '#vex-navbar2',
                '#menuItemOwner2',
                'menuItemOwner2',
                {
                    name: app.lang.getStr('%Owner%', 'aplication'),
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
                    /*
                    app.draw(
                        '#vex-navbar',
                        '#menuItemSearch',
                        'menuItemSearch',
                        {
                            name: app.lang.getStr('%Search%', 'aplication'),
                            id: 0
                        },
                        'append',
                        function () {
                            app.bindEvents();
                        }
                    );
                    */
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
                        '#menuItemPinned',
                        'menuItemPinned',
                        {
                            name: app.lang.getStr('%Pinned%', 'aplication'),
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
                    /*
                    app.draw(
                        '#vex-navbar',
                        '#menuItemAccount',
                        'menuItemAccount',
                        {
                            name: app.lang.getStr('%Account%', 'aplication'),
                            id: 0
                        },
                        'append',
                        function () {
                            app.bindEvents();
                        }
                    );
                    */
                    app.draw(
                        '#vex-navbar',
                        '#menuItemOwner',
                        'menuItemOwner',
                        {
                            name: app.lang.getStr('%Owner%', 'aplication'),
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
    },
}