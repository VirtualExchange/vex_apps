var vMap = {
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
                console.log('app.vMapView.init()');
                $('.carousel').addClass('hide');
                $('#menubutton').addClass('hide');
                $('#landingPageMenu').addClass('hide');
                $('#landingPageMenu').collapse('hide');
                $('.navbar').removeClass('hide');
                $('#backLink').removeClass('hide');

                $('#splashView').addClass('hide');
                $('.navbar-fixed-bottom').addClass('hide');

                app.vMap.category_id = null;
                app.vMap.department_id = null;
                app.vMap.infoWindow = null;

                app.vMap.geocoder = new google.maps.Geocoder();
                app.vMap.directionsService = new google.maps.DirectionsService();
                app.vMap.directionsDisplay = new google.maps.DirectionsRenderer();

                app.vMap.category_id = null;
                app.vMap.department_id = null;
                
                app.vMap.gpsError = false;
                
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
                                app.vMap.geocoder.geocode({ 'address': $('#inAddress').val(), 'region': app.lang.preferredLanguage }, function (results, status) {
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
                                app.vMap.getStoresByStreet(ui.item);
                            }
                        });
                        
                        $('#inAddress').focusout(function(){
                            if($('#inAddress').val()=='')
                                app.vMap.getStores();
                        });
                        
                        $('#inAddress').keypress(function(e) {
                            if ( e.which == 13 ) {
                                app.vMap.getStores();
                                return false;
                            }
                        });
                        
                        app.vMap.getPosition() ;
                        
                        if(window.localStorage.getItem("radius")){
                            $('#slRadius').val(window.localStorage.getItem("radius"));
                        }
                        
                        console.log('montando mapa' + app.device.latitude + ', ' + app.device.longitude);

                    }
                );
            },
            getPosition: function(){
                console.log('app.vMap.getPosition()');
                navigator.geolocation.getCurrentPosition(
                    function (position) {
                        console.log('GPS RESULT');
                        console.log(position);

                        app.device.latitude  = position.coords.latitude;
                        app.device.longitude = position.coords.longitude;
                        
//                        app.device.latitude  = 40.8285828;
//                        app.device.longitude = -72.9359057;
                        
                        app.vMap.renderMap();
                        app.vMap.localDepartment();

                        app.vMap.getStores();
                        
                        app.geolocation.start();
                        
                    },
                    function (error) {
                        //console.log('GPS ERROR');
                        //console.log(JSON.stringify(error));
                        
                        if(!app.vMap.gpsError){
                            
                            //navigator.notification.alert(app.lang.getStr('%Was not possible to pinpoint your location, please call your GPS.%', 'aplication'), function(){}, app.lang.getStr('%GPS error%', 'aplication'), app.lang.getStr('%Close%', 'aplication'));
                            
                            app.device.latitude  = null;
                            app.device.longitude = null;
                            
                            app.vMap.gpsError = true;
                            
                            app.vMap.renderMap();
                            app.vMap.localDepartment();

                            app.vMap.getStores();
                        }
                        
                        setTimeout(function(){
                           app.vMap.getPosition() ;
                        },5000);
                    },
                    {timeout: 10000, enableHighAccuracy: true}
                );
            },
            showMap: function(e){
                setTimeout(function(){
                    app.vMap.renderMap();
                    app.vMap.showStores();
                },300)
            },
            renderMap: function(){
                console.log('app.vMap.renderMap()');
                //console.log('RENDER MAP DEVICE> ' + app.device.latitude +', ' +app.device.longitude);

                var userLocation = new google.maps.LatLng(app.device.latitude, app.device.longitude);
                
                var mapOptions = {
                    center: userLocation,
                    zoom: 13,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };

                app.vMap.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

                google.maps.event.addListener(app.vMap.map, 'tilesloaded', function() {
                    // Visible tiles loaded!
                    console.log('LOAD MAPS TOTAL');

                    //app.views.loadView.hide();$('#map_load_icon').addClass('hide');

                });
                
                var marker = new google.maps.Marker({
                    map: app.vMap.map,
                    position: userLocation,
                    draggable: false,
                    clickable: false
                });

                app.vMap.userPoss = marker;
            },
            getStores: function () {
                console.log('app.vMap.getStores()');
                //console.log('DEVICE> ' + app.device.latitude +', ' +app.device.longitude);
                //console.log('MAP> ' + app.vMap.lat +', ' +app.vMap.long);

                var option = {
                    latitude: !app.vMap.lat ? app.device.latitude : app.vMap.lat,
                    longitude: !app.vMap.long ? app.device.longitude : app.vMap.long
                };

                if (app.vMap.category_id) {
                    option.category_id = app.vMap.category_id;
                }

                if (app.vMap.department_id) {
                    option.department_id = app.vMap.department_id;
                }
                
                if($('#slRadius').val()!=''){
                    
                    option.radius = $('#slRadius').val();
                    
                }
                
                if($('#inAddress').val()!=''){
                    
                    option.address = $('#inAddress').val();
                    app.vMap.userPoss.setMap(null);
                    
                    option.radius = null;
                    $('#slRadius').val('');
                    option.latitude = null;
                    option.longitude = null;
                    
                }else{
                    
                    if(app.vMap.streetMarker){
                        app.vMap.streetMarker.setMap(null);
                        app.vMap.streetMarker = null;
                    }
                    
                    app.vMap.userPoss.setMap(app.vMap.map);
                    
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
                        
                        app.home.showStores(result, true,false,1);
                        
                        app.vMap.showStores();
                        
                    },
                    function (err) {
                        console.log(JSON.stringify(err));
                        //app.views.loadView.hide();$('#map_load_icon').addClass('hide');
                    }
                );
            },
            showStores: function () {
                console.log('app.vMap.showStores');
                app.vMap.removeAllMarker();
                
                app.vMap.latlngbounds = new google.maps.LatLngBounds();

                $.each(app.views.stores, function (i, store) {
                    var marker = new google.maps.Marker({
                        map: app.vMap.map,
                        position: new google.maps.LatLng(store.latitude, store.longitude),
                        draggable: false,
                        clickable: true
                        /*icon: 'img/store5.png'*/
                    });
                    
                    var html = app.vMap.buildContactStore(store);
                    
                    var myOptions = {
                        content: html
                    };

                    var infoWindow = new google.maps.InfoWindow(myOptions);

                    google.maps.event.addListener(marker, 'click', function (e) {

                        if (app.vMap.infoWindow)
                            app.vMap.infoWindow.close();

                        infoWindow.open(app.vMap.map, marker);
                        app.vMap.infoWindow = infoWindow;
                    });

                    app.vMap.latlngbounds.extend(marker.position);
                    app.vMap.marker.push(marker);
                });
                
                app.vMap.markerCluster = new MarkerClusterer(app.vMap.map, app.vMap.marker);
                
                if(app.vMap.marker.length>0){
                    
                    if(!app.vMap.streetMarker){
                        
                        app.vMap.latlngbounds.extend(app.vMap.userPoss.position);
                        
                    }else{
                        
                        app.vMap.latlngbounds.extend(app.vMap.streetMarker.position);
                        
                    }
                    
                    app.vMap.map.fitBounds(app.vMap.latlngbounds);
                    
                }else{
                    
                    app.vMap.map.setZoom(8);
                    
                }
                
                //centralizando o mapa
                if(!app.vMap.streetMarker){
                    
                    app.vMap.map.setCenter( new google.maps.LatLng(app.device.latitude,app.device.longitude) );
                    
                }else{
                    
                    app.vMap.map.setCenter( app.vMap.streetMarker.position );
                    
                }
                
                
                app.vMap.directionsDisplay.setMap(app.vMap.map);
                //console.log(app.vMap.marker);
            },
            buildContactStore: function (store) {
                console.log('app.vMap.buildContactStore()');
                
                var html = '<div class="storeItem" style="border: none;">';
                html +=         '<div class="row">';
                html +=         '    <div class="col-xs-4 col-sm-4 logoStoreDiv">';
                html +=         '        <img src="'+store.logo+'" class="img-responsive img-rounded" style="max-width: 100%;" store_index="{{index}}" onclick="app.home.storeDetail(this);"/>';
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
                html +=         '        <a href="#" class="btn btn-product" store_id="' + store.id + '" onclick="app.vMap.showStoreDetail(this);">' + app.lang.getStr('%Produts%', 'storeItem') + '</a>';
                html +=         '    </div>';
                html +=         '    <div class="col-xs-6 col-sm-6">';
                html +=         '        <a href="#" class="btn btn-contact" lat="'+store.latitude+'" long="'+store.longitude+'" onclick="app.vMap.rote(this);">'+app.lang.getStr('%Rote%','vMapView')+'</a>';
                html +=         '    </div>';
                html +=         '</div>'
                html += '</div>'

                return html;
            },
            removeAllMarker: function () {
                console.log('app.vMap.removeAllMarker()');
                
                for (var i in app.vMap.marker) {
                    app.vMap.marker[i].setMap(null);
                    app.vMap.marker[i] = null;
                }

                app.vMap.marker = [];
                app.vMap.directionsDisplay.setDirections({routes: []});
                
                if(app.vMap.markerCluster)
                    app.vMap.markerCluster.clearMarkers();
                
            },
            rote: function (e) {
                console.log('app.vMap.route');
                var start = app.device.latitude + ', ' + app.device.longitude;
                var end = $(e).attr('lat') + ', ' + $(e).attr('long');

                var request = {
                    origin      : start,
                    destination : end,
                    travelMode  : $("input[name=slTransp]:checked").val(),
                    unitSystem  : (app.lang.getStr('%Feet%', 'vMapView')=='Feet' ? google.maps.UnitSystem.IMPERIAL : google.maps.UnitSystem.METRIC)
                };
                app.vMap.directionsService.route(request, function (response, status) {
//                    console.log(response);
//                    console.log(status);
                    if (status == google.maps.DirectionsStatus.OK) {
                        app.vMap.directionsDisplay.setDirections(response);
                        
                        if(app.vMap.streetMarker)
                            app.vMap.userPoss.setMap(app.vMap.map);
                        
                    } else{
                        navigator.notification.alert(app.lang.getStr('%No rote found%', 'vMapView'), function () {
                        }, app.lang.getStr('%Error%', 'vMapView'), app.lang.getStr('%Close%', 'vMapView'));
                    }
                });
            },
            showStoreDetail: function (e) {
                console.log('app.vMap.showStoreDetail');
                app.webservice.get(
                    'stores/' + $(e).attr('store_id'),
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));

                        app.views.stores = [result];
                        app.home.storeDetail();
                    },
                    function (err) {
                        console.log(JSON.stringify(err));
                        //app.views.loadView.hide();$('#map_load_icon').addClass('hide');
                    }
                );
            },
            showFilterStreet: function (e) {
                console.log('app.vMap.showFilterStreet');
                $('#liRadius').addClass('hide');
                $('#liStreet').removeClass('hide');
                
                $('#inAddress').val('');
                
                $('#dpdName').html('Street <b class="caret"></b>');
            },
            showFilterRadius: function (e) {
                console.log('app.vMap.showFilterRadius');
                
                $('#inAddress').val('');
                
                if(app.vMap.streetMarker){
                    
                    app.vMap.streetMarker.setMap(null);
                    app.vMap.streetMarker = null;
                    
                }
                
                app.vMap.lat = null;
                app.vMap.long = null;

                $('#hidRadius').val($(e).attr('radius'));
                
                window.localStorage.setItem("radius",$('#slRadius').val());
                
                app.vMap.getStores();
            },
            showDepFilter: function (e) {
                console.log('app.vMap.showDepFilter');
                $('#btContactClose').html(app.lang.getStr('%Close%', 'vMapView'));

                $('#modalFilterMap').modal('show');

                app.vMap.localDepartment();

            },
            localDepartment: function (e) {
                console.log('app.vMap.localDepartment');
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
                console.log('app.vMap.getStoresByCategory()');
                app.vMap.department_id = null;
                app.vMap.category_id = $(e).val();
                app.vMap.getStores();
                $('#modalFilterMap').modal('hide');
            },
            getStoresByStreet: function (item) {
                console.log('app.vMap.getStoresByStreet()');
                
                if(app.vMap.streetMarker){
                    
                    app.vMap.streetMarker.setPosition(new google.maps.LatLng(item.latitude, item.longitude));
                    
                }else{
                    
                    var marker = new google.maps.Marker({
                        map: app.vMap.map,
                        position: new google.maps.LatLng(item.latitude, item.longitude),
                        draggable: true
                    });

                    app.vMap.streetMarker = marker;
                }
                
                app.vMap.getStores();
            }
        },
}