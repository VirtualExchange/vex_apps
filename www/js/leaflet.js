var leaflet = {
        leaflet: {
            test: function(e){
                app.leaflet.hierarchy();
            },
            hierarchy: function(mymap,store_id,page){
                console.log("Store start: "+store_id+" page: "+page);
                
                var req = "";
                if (!store_id) req = 'stores';
                else req = 'stores/' + store_id+'/stores';
                
                var options = {};
                if (!page) options['page'] = 1;
                else options['page'] = page;
                
                app.webservice.get(
                    req,
                    options,
                    function (result) {
                        console.log(JSON.stringify(result));
                        $.each(result.stores, function (i, store) {
                            var parent_id = store_id;
                            if (store.stores_count > 0){
                                app.leaflet.hierarchy(mymap,store.id);
                            }
                            console.log("parent_id: "+parent_id+" ,store.name: "+store.name+" ,store.id: "+store.id);
                            $.each(app.home.displayOnMap, function(j,mapStore){
                                if (mapStore.id == store.id){
                                    app.leaflet.showStore(mymap,mapStore);
                                }
                            });
                        });
                        if (result.pages > 1 && options['page'] < result.pages){
                            console.log("Next store_id: "+store_id+" page: "+options['page']);
                            app.leaflet.hierarchy(mymap,store_id, options['page']+1);
                        } 
                        console.log("Store finish: "+store_id);
                    },
                    function (err){
                        console.log(JSON.stringify(err));
                    }
                );
            },
            showMap: function(latitude, longitude, branchOnly) {
                $('.carousel').addClass('hide');
                $('#menubutton').addClass('hide');
                $('#landingPageMenu').addClass('hide');
                $('#landingPageMenu').collapse('hide');
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
                                console.log(JSON.stringify(result));
                                if (branchOnly){
                                    app.home.displayOnMap = result.stores;
                                    app.leaflet.showStore(mymap,app.home.mapStore);
                                    app.leaflet.hierarchy(mymap,app.home.mapStore.id);
                                } else {
                                    $.each(result.stores, function (i, store) {
                                        app.leaflet.showStore(mymap,store);
                                    });
                                    
                                }
                            }
                        );
                    },
                    function (err) {
                        console.log(JSON.stringify(err));
                    }
                );

            },
            showStore: function (mymap,store) {
                var fuelIcon = L.icon({iconUrl: "img/Fuel.png", iconSize: [25,25]})
                var foodIcon = L.icon({iconUrl: "img/Food.png", iconSize: [25,25]})
                var hotelIcon = L.icon({iconUrl: "img/Hotel.png", iconSize: [25,25]})
                var hospitallIcon = L.icon({iconUrl: "img/Hospital.png", iconSize: [25,25]})
                var exitIcon = L.icon({iconUrl: "img/Exit.png"})
                if (store.latitude != null && store.longitude != null && hasCode(store.about,"showOnMap")){
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
                    domelem.innerHTML = stripLeadingTag(store.name);
                    domelem.onclick = function() {
                        alert(this.href);
                        // do whatever else you want to do - open accordion etc
                    };
                    marker.bindPopup('<a href="#" class="btn btn-product" store_id="' + store.id + '" onclick="app.home.storeDetail(this);">' + stripLeadingTag(store.name) + '</a>');
                    //marker.bindPopup(domelem);
                    //marker.bindPopup("<p>"+store.name+"</p>"+store.about);
                }
                
            },
            getPosition: function (){
                console.log('app.leaflet.getPosition()');
                navigator.geolocation.getCurrentPosition(
                    function (position) {
                        console.log('GPS RESULT');
                        console.log('latitude: '+position.coords.latitude);
                        console.log('longitude: '+position.coords.longitude);

                        app.leaflet.showMap(position.coords.latitude, position.coords.longitude, false);
                    },
                    function (error) {
                        console.log('GPS ERROR');
                        console.log(JSON.stringify(error));
                        app.leaflet.showMap(40.7128, -74.0059, false);
                    },
                    {timeout: 3000, enableHighAccuracy: true}
                );
                
            },
            getStore: function (e){
                var store_id = $(e).attr('store_index');
                mixpanel.track("Map",{"store_id":store_id });
                app.webservice.get(
                    'maps?q[store_id_eq]='+store_id,
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));
                        $.each(result.stores, function (i, store) { 
                            console.log("id: "+store.id+" name: "+store.name+" lat: "+store.latitude+" long: "+store.longitude);
                            if (i == 0) {
                                app.home.mapStore = store;
                                app.leaflet.showMap(store.latitude, store.longitude, true);
                            }
                        });
                    },
                    function (err){
                        console.log(JSON.stringify(err));    
                    }
                );
            }
        },
}