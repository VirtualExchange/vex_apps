var notification = {
        notification: {
            isRadius : true,
            streets : [] ,
            departments : [],
            geocoder : null,
            init: function (e) {
                
                app.vMap.geocoder = new google.maps.Geocoder();
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
                                app.vMap.geocoder.geocode({ 'address': $('#inpNotStreet').val(), 'region': app.lang.preferredLanguage }, function (results, status) {
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
                                        var itemList = '<li class="list-group-item"><a href="#" data-callback="app.notification.removeStreet" class="btn btn-link" address="'+ui.item.label+'" street_id="'+r.id+'" id="st_'+r.id+'"><span class="icon icon-close"></span></a>'+ui.item.label+'</li>';
                                        $('#streetList').append(itemList);
                                
                                        app.bindEvents();
                                    }, function(e){
                                        console.log('ERRO ADD STREET');
                                        console.log(JSON.stringify(e));
                                    }
                                );
                            
//                                app.notification.streets.push(ui.item.label);
//                                console.log(app.notification.streets);
//                                app.notification.addStreet(ui.item);
                                
                                setTimeout(function(){$('#inpNotStreet').val('');}, 100);
                                
                                
                            }
                        });
                        
                        app.notification.localDepartment();
                        app.notification.showStreets();
                        app.bindEvents();
                    }
                );
            },
            update: function(){
                console.log('app.notification.update');
                
                var option = {'device':{}};
                
                if(app.notification.isRadius==true){
                    console.log('vai com radius');
                    option.device.radius = $('#slRadius').val();
                    option.device.streets = [];
                    
                }else{
                    console.log('vai com Street');
                    option.device.streets = app.notification.streets;
                    
                }
                
                option.device.department_ids = app.notification.departments;
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
                console.log('app.notification.chooseRadius');
                app.notification.isRadius = true;
            },
            chooseStreet: function(){
                console.log('app.notification.chooseStreet');
                app.notification.isRadius = false;
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
                console.log('app.notification.showStreets()');
                
                $.each(app.device.streets, function (i, streets) {
                    var itemList = '<li class="list-group-item"><a href="#" data-callback="app.notification.removeStreet" class="btn btn-link" address="'+streets.address+'" street_id="'+streets.id+'" id="st_'+streets.id+'"><span class="icon icon-close"></span></a>'+streets.address+'</li>';
                    $('#streetList').append(itemList);
                });
            },
            localDepartment: function () {
                console.log('app.notification.localDepartment');
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
                console.log('app.notification.addRemoveCategory');
                
                if($(e).is(':checked')){
                    console.log('checado');
                    app.notification.departments.push($(e).attr('category_id'));
                    
                    app.notification.update();
                    
                }else{
                    console.log('nao checado');
                    var aux = [];
                
                    for(var i=0; i<app.notification.departments.length; i++){
                        if(app.notification.departments[i]!=$(e).attr('category_id')){
                            aux.push(app.notification.departments[i]);
                        }
                    }

                    app.notification.departments = aux;
                    app.notification.update();
                }
            }
        },
}