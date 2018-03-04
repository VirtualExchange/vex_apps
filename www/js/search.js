var search = {
        search: {
            init: function (e) {
                app.views.loadView.show();
                mixpanel.track("Search");
                console.log('app.search.init()');
                $('.carousel').addClass('hide');
                $('#menubutton').addClass('hide');
                $('#landingPageMenu').addClass('hide');
                $('#landingPageMenu').collapse('hide');
                $('.navbar').removeClass('hide');
                
                app.views.backStack.push("SearchView");
                //$('.linkHome').removeClass('selected');
                //$(e).addClass('selected');
                
                app.webservice.get(
                    'departments',
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));
                        app.views.loadView.hide();
                        app.draw(
                            '#content',
                            '#searchView',
                            'searchView',
                            {},
                            '',
                            function () {
                                app.search.typeAhead();
                                if (result.departments.length == 0){
                                    $('#searchTab').addClass('hide');
                                }
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
            typeAhead: function() {
                const suggestions = [
                {name: 'animal'},
                {name: 'bread'}, 
                {name: 'car'}, 
                {name: 'cast'},
                {name: 'carp'}]
                var url = app.url + 'stores/search';
                var bloodhoundSuggestions = new Bloodhound({
                    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('name'),
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    sufficient: 3,
                    /*local: suggestions,*/
                    prefetch: {
                        url: url,
                        ttl: 1,
                        prepare: function (settings) {
                            settings.headers = {
                                'Authorization' : "Token token=" + app.token,
                                'X-Access-Token': app.userToken,
                                'X-Device-Token': window.localStorage.getItem("token")
                            };
                            return settings;
                        },
                        filter: function(response) {
                            result = response.stores.concat(response.products);
                            return result;
                        }                        
                    }
                });
                
                $("#storeNameInput").typeahead(
                    {
                        items: 4,
                        source: bloodhoundSuggestions.ttAdapter(),
                        displayText: function(item) {
                            console.log("suggestion:item.display: "+item.display);
                            return item.display;
                        },
                        matcher: function (item) {
                            console.log("item: "+item);
                            console.log("item.name: "+item.name);
                            var it = item.name;
                            return ~it.toLowerCase().indexOf(this.query.toLowerCase());
                        },
                        afterSelect: function(item) {
                            console.log('item.name: ' + item.name + " item.id: "+item.id);
                            $('#autocomplete').val(item.name);
                            if (item.product_id){
                                app.products.showProductDetail(item.store_id,item.id,'false')
                            } else {
                                app.views.backStack.push("StoreDetail:"+item.id);
                                app.search.storeDetail(item.id);
                            }
                        },                          
                    }
                );
            },
            byName: function (e) {
                console.log('app.search.byName()');
                $('.breadcrumb > li').removeClass('active');
                $(e).parent().addClass('active');

                $('#byDepartment').addClass('hide');
                $('#byName').removeClass('hide');

            },
            byDepartment: function (e) {
                console.log('app.search.byDepartment()');
                $('.breadcrumb > li').removeClass('active');
                $(e).parent().addClass('active');

                $('#byDepartment').removeClass('hide');
                $('#byName').addClass('hide');
            },
            filterByDepartmentFromMenu: function(e){
                console.log('app.search.filterByDepartmentFromMenu()');
                app.views.backStack = new Array();
                app.views.backStack.push("StoreListByDept:"+$(e).attr('dep_id')+":"+$(e).attr('dep_name'));
                app.search.storeListByDepartment($(e).attr('dep_id'),$(e).attr('dep_name'));
            },
            filterByDepartment: function(e){
                console.log('app.search.filterByDepartment()');
                app.views.backStack.push("StoreListByDept:"+$(e).attr('dep_id')+":"+$(e).attr('dep_name')+":"+"noFilter");
                app.home.storeListByDepartment($(e).attr('dep_id'),$(e).attr('dep_name'),false);
            },
            storeListByDepartment: function (dep_id, dep_name) {
                console.log('app.search.storeListByDepartment()');
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

                                    app.home.showStores(result, true,false,1);

                                    app.home.currentPage = 1;
                                    app.home.totalPages = result.pages;

                                    if (app.home.totalPages > 1) {

                                        $(window).on("scroll", function () { //pagination
                                            if ($(this).scrollTop() + $(this).height() >= $('#storeList').parent().height()) {
                                                if (app.home.scrollPending == 0) {
                                                    app.home.scrollPending = 1;
                                                    app.home.paginacao('stores?department=' + dep_id, {},'stores');
                                                }
                                            }
                                        });
                                    }
                                
                                    $(window).scrollTop(0);
                                }else {
                                    app.views.stores = result.stores;
                                    console.log(JSON.stringify(app.views.stores));
                                    app.search.storeDetail(app.views.stores[0].id);
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
                console.log('app.search.storeDetail()');
                //app.views.auxBackFuc = 'search';
                app.home.getStoreDetail(store_id, true, 'true');
                
            }
        },
}