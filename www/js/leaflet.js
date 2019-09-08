var leaflet = {
        leaflet: {
            test: function(e){
                app.leaflet.hierarchy();
            },
            showMap: function(latitude, longitude, branchOnly) {
                hideHomeMenu();
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
                            maxZoom: 12,
                            id: 'mapbox.streets',
                            accessToken: 'pk.eyJ1IjoibmFuY3lwaWVkcmEiLCJhIjoiY2l4ZXA1ejR6MDBnajJ0bnA1M3lzYWtobCJ9.CNGXj48Gw_Gs5moeZqbjyQ'
                        }).addTo(mymap);
                        
                        var option = {
                            latitude: latitude, 
                            longitude: longitude,
                            radius: 50
                        };
                        if (branchOnly){
                            app.leaflet.showStore(mymap,app.home.mapStore);
                            req = 'stores/'+app.home.mapStore.id+'/maps';
                        }else{
                            req = 'maps';
                        }
                        
                        
                        app.webservice.get(
                            req,
                            option,
                            function (result) { 
                                console.log(JSON.stringify(result));
                                $.each(result.stores, function (i, store) {
                                    app.leaflet.showStore(mymap,store);
                                });
                            },
                            function (e) {
                                 navigator.notification.alert(e.message, function(){
                                });
                           }
                        );
                        
                    },
                    function (err) {
                        console.log(JSON.stringify(err));
                    }
                );

            },
            showStore: function (mymap,store) {
                console.log("app.leaflet.showStore: "+store.id+" "+store.latitude+" "+store.longitude);
                var fuelIcon = L.icon({iconUrl: "img/Fuel.png", iconSize: [25,25]})
                var foodIcon = L.icon({iconUrl: "img/Food.png", iconSize: [25,25]})
                var hotelIcon = L.icon({iconUrl: "img/Hotel.png", iconSize: [25,25]})
                var hospitallIcon = L.icon({iconUrl: "img/Hospital.png", iconSize: [25,25]})
                var exitIcon = L.icon({iconUrl: "img/Exit.png"})
                if (store.latitude != null && store.longitude != null && store.show_on_map){
                    if (store.map_icon == "fuel")
                        var marker = L.marker([store.latitude,store.longitude],{icon: fuelIcon}).addTo(mymap);
                    else if (store.map_icon == "food")
                        var marker = L.marker([store.latitude,store.longitude],{icon: foodIcon}).addTo(mymap);
                    else if (store.map_icon == "exit")
                        var marker = L.marker([store.latitude,store.longitude],{icon: exitIcon}).addTo(mymap);
                    else if (store.map_icon == "hotel")
                        var marker = L.marker([store.latitude,store.longitude],{icon: hotelIcon}).addTo(mymap);
                    else if (store.map_icon == "hospital")
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
                    //'maps?q[store_id_eq]='+store_id,
                    'stores/'+store_id,
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));
                        console.log("id: "+result.id+" name: "+result.name+" lat: "+result.latitude+" long: "+result.longitude);
                        app.home.mapStore = result;
                        app.leaflet.showMap(result.latitude, result.longitude, true);
                    },
                    function (err){
                        console.log(JSON.stringify(err));    
                    }
                );
            }
        },
}