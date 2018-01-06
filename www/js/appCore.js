/*! APP CORE CLASS */
var appCore = {
    watchID  : '',
    device   : {
        latitude  : '',
        longitude : '',
        email     : '',
        name      : ''
    },
//    host     : 'http://api.vexapps.com/',
//    url      : 'http://api.vexapps.com/api/devices/',
    ownerUrl     : 'http://dev.virtualopenexchange.com/api/',
    url      : 'http://dev.virtualopenexchange.com/mobile/api/',
    token    : 'ZYsK4ghLQl2atAPYvU9fqg',
    appName  : 'Virtual Exchange',
    senderID : "441867489546",
    lastGeoDate : null,
    offLine : false,
//    logged : false,
    logged : false,
    loginRequired: true,
    chatToken : null,
    clientStores : [],
    userToken : '',
    stores   : {
        id        : '',
        logo      : '',
        name      : '',
        corporate : ''
    },
    bindEvents: function() {

        $('a[data-callback]').unbind('click');
        $('a[data-callback]').unbind('touchstart');

        $('button[data-callback]').unbind('click');
        $('button[data-callback]').unbind('touchstart');
        
        FastClick.attach(document.body);

        $('a[data-callback]').on('click', function(e) {
            e.preventDefault();
            if ($(this).is('a[data-callback]')) {
                var callback = $(this).attr('data-callback');
                app.call(callback, window, $(this));
            }
        });

        $('button[data-callback]').on('click', function(e) {
            e.preventDefault();
            if ($(this).is('button[data-callback]')) {
                var callback = $(this).attr('data-callback');
                app.call(callback, window, $(this));
            }
        });
    },
    call: function(functionName, context /*, args */) {
        //thanks to: http://stackoverflow.com/questions/359788/how-to-execute-a-javascript-function-when-i-have-its-name-as-a-string
        var args = Array.prototype.slice.call(arguments, 2);
        var namespaces = functionName.split(".");
        var func = namespaces.pop();
        for (var i = 0; i < namespaces.length; i++) {
            context = context[namespaces[i]];
        }
        return context[func].apply(context, args);
    },
    //atualiza o app com a nova pagina
    //targetSelector - elemento aonde será adicionado o html
    //sourceSelector - elemento de origem do html
    //effect - efeito de transição entre as telas
    //callbackAfter - função a ser chamada depois que a tela é carregada
    draw: function(targetSelector, sourceSelector, screen, model, effect, callbackAfter) {
//        console.log('EFFECT: ' + effect);
        if (effect === 'append') {
            $(targetSelector).append(tim(app.lang.getStr($(sourceSelector).html(), screen), model));
            if (callbackAfter)
                callbackAfter();

        } else if (effect === 'slide') {

            var old = $(targetSelector).html();

            $(targetSelector).html('<div id="tempCarousel" class="carousel slide" data-ride="carousel"><div class="carousel-inner"><div class="item active old">a</div><div class="item new">b</div></div></div>');
            $('.item.old').html(old);
            $('.item.new').html(tim(app.lang.getStr($(sourceSelector).html(), screen), model));
            callbackAfter();

            $('#tempCarousel').carousel({
                interval: false
            });
            $('#tempCarousel').carousel('next');
            $('#tempCarousel').carousel('pause');

            $('#tempCarousel').unbind('slid.bs.carousel');
            $('#tempCarousel').bind('slid.bs.carousel', function(e) {
                // callbackAfter();
                $(window).scrollTop(0);
            });
        } else if (effect === 'addSlide') {
            console.log('carrocel:' + $('#tempCarousel').length);
            if(!$('#tempCarousel').length){
                
                var old = $(targetSelector).html();

                $(targetSelector).html('<div id="tempCarousel" class="carousel slide" data-ride="carousel"><div class="carousel-inner"><div class="item active old">a</div><div class="item new1">b</div></div></div>');
                $('.item.old').html(old);
                $('.item.new1').html(tim(app.lang.getStr($(sourceSelector).html(), screen), model));
                callbackAfter();

                $('#tempCarousel').carousel({
                    interval: false
                });
                $('#tempCarousel').carousel('next');
                $('#tempCarousel').carousel('pause');

                $('#tempCarousel').unbind('slid.bs.carousel');
                $('#tempCarousel').bind('slid.bs.carousel', function(e) {
                    // callbackAfter();
                    $(window).scrollTop(0);
                });
                
            }else{
                
                var nChild = $('#tempCarousel .carousel-inner').children();
                
                $('#tempCarousel .carousel-inner').append('<div class="item new' + (nChild.length) + '">b</div>');
                console.log('Child: ' + nChild.length);
                $('.new' + nChild.length).html(tim(app.lang.getStr($(sourceSelector).html(), screen), model));

                $('#tempCarousel').carousel('next');
                $('#tempCarousel').carousel('pause');

                $('#tempCarousel').unbind('slid.bs.carousel');
                $('#tempCarousel').bind('slid.bs.carousel', function(e) {
                    callbackAfter();

                });    
            }
            
        } else if (effect === 'removeSlide') {

            var nChild = $('#tempCarousel .carousel-inner').children();
            $('#tempCarousel').carousel('prev');
            $('#tempCarousel').carousel('pause');
            $('#tempCarousel').unbind('slid.bs.carousel');
            $('#tempCarousel').bind('slid.bs.carousel', function(e) {
//                console.log('chamou: ' + nChild.length);
                $('.new' + nChild.length).remove();

                callbackAfter();
            });
        } else if (effect === 'slideBack') {
            
            var nChild = $('#tempCarousel .carousel-inner').children();
            
            $('#tempCarousel').carousel('prev');
            $('#tempCarousel').carousel('pause');
            $('#tempCarousel').unbind('slid.bs.carousel');
            
            $('#tempCarousel').bind('slid.bs.carousel', function(e) {

                $('.new' + (nChild.length-1)).remove();
                
                if($('#tempCarousel .carousel-inner').children().length==1)
                    $(targetSelector).html($('.item.old').html());
                
                callbackAfter();
            });
        } else {

            $(targetSelector).html(tim(app.lang.getStr($(sourceSelector).html(), screen), model));
            if (callbackAfter)
                callbackAfter();
        }
    },
    /*! LANGUAGE */

    lang: {
        preferredLanguage: 'en',
        config: function(successCB, errorCB) {
            console.log('lang.config');
            if (app.deviceReady) {
                console.log('app.deviceReady');
                 if(navigator.globalization){
                    navigator.globalization.getPreferredLanguage(
                            function(language) {

                                app.lang.preferredLanguage = language.value;

                                console.log('preferred Language: ' + app.lang.preferredLanguage);

                                switch (app.lang.preferredLanguage) {
                                    case 'pt-BR':
                                        console.log('CASE pt-BR');
                                        app.lang.data = lang_ptBR;
                                        break;
                                    default:
                                        console.log('CASE lang_enUS');
                                        app.lang.preferredLanguage = 'en-US';
                                        app.lang.data = lang_enUS;
                                        break;
                                };

                                successCB();

                            },
                            function() {
                                errorCB();
                            }
                    );

                    navigator.globalization.getDatePattern(
                        function (date) { 
                            
                            var pattern = date.pattern;
                            
                            while(pattern.search('d')!=-1){
                                pattern = pattern.replace('d', 'D');
                            }
                            
                            while(pattern.search('y')!=-1){
                                pattern = pattern.replace('y', 'Y');
                            }
                            
                            app.lang.date.pattern = pattern;
                        },
                        function () { 
                            console.log('Error getting pattern\n'); 

                        },
                        { formatLength: 'short', selector: 'date and time' }
                    );
                }else{
                    app.lang.preferredLanguage = 'en-US';
                    app.lang.data = lang_enUS;
                                        
                    app.lang.date.pattern = 'M/D/yyyy h:mm a';
                    
                    successCB();
                }
            }
        },
        getStr: function(str, screen) {
//            console.log('-------------------lang.getStr----------------------');
//            console.log('preferredLanguage: ' + this.preferredLanguage);
            //console.log(JSON.stringify(this.data));
            if ((typeof this.data[this.preferredLanguage] != 'undefined')) {

//                console.log('traduzindo a tela: ' + screen);
                
                for (var s in this.data[this.preferredLanguage][screen]) {
                    //console.log(s);
                    while(str.search(s)!=-1){
                        str = str.replace(s, this.data[this.preferredLanguage][screen][s]);
                    }
                }
            }
            return str;
        },
        data: {},
        date: {
            pattern : 'M/D/yyyy h:mm a',
            dateToString: function(date,success,error){
                navigator.globalization.dateToString(
                    date,
                    success,
                    error,
                    { formatLength: 'short', selector: 'date and time' }
                );
            }
        }
        
    },
    push: {
        init: function() {
          console.log("app.push.init");
            var push = PushNotification.init({
                android: {
                    senderID: app.senderID
                },
                ios: {
                    alert: "true",
                    badge: true,
                    sound: 'false'
                },
                windows: {}
            });
            push.on('registration', function(data) {
                console.log("app.push.init.registration");
                console.log("data.registrationId:"+data.registrationId);
                if (device && device.platform === 'Android'){
                    kind = '2';
                } else if (device && device.platform === 'iOS'){
                    kind = '1';
                }
                app.webservice.post(
                    'device',
                    'PUT',
                    {
                        device:{
                            id: window.localStorage.getItem("token"),
                            push_token  : data.registrationId,
                            kind        : kind
                        }
                    },
                    function(r){
                        console.log('RESULT DE REGISTRO');
                        console.log(JSON.stringify(r));
                        app.device.email = r.email;
                        app.device.name = r.name;
                        //window.localStorage.setItem("token", r.id);
                    }, function(e){
                        console.log('RESULT ERROR DE REGISTRO');
                        console.log(JSON.stringify(e));
                    }
                );
            });

            push.on('notification', function(data) {
                console.log("app.push.init.notification");
                console.log('data.message: '+data.message);
                console.log('data.title: '+data.title);
                if (data.message.indexOf("You have new message") == 0){
                    setTimeout(app.chat.checkUnreadMessage,1000);
                } else {
                    navigator.notification.alert(
                        data.message,
                        function () {}, 
                        ''
                    );
                }
                
                //console.log('data.count: '+data.count);
                //console.log('data.sound: '+data.sound);
                //console.log('data.image: '+data.image);
                //console.log('data.additionalData: '+data.additionalData);
                //navigator.notification.vibrate(1500);
                
                // data.message,
                // data.title,
                // data.count,
                // data.sound,
                // data.image,
                // data.additionalData
            });

            push.on('error', function(e) {
                console.log("app.push.init.error");
                // e.message
            });            
        },
        callback: function(){},
        register: function() {
            console.log('app.push.register');
            var pushNotification = window.plugins.pushNotification;

            if (device && device.platform === 'Android') {
                console.log('app==android');
                pushNotification.register(
                    app.push.successHandler,
                    app.push.errorHandler,
                    {
                        "senderID": app.senderID,
                        "ecb": "app.push.onNotificationGCM"
                    }
                );

            } else {
                console.log('app==ios');
                pushNotification.register(
                    app.push.successHandler,
                    app.push.errorHandler,
                    {
                        "badge": "true",
                        "sound": "true",
                        "alert": "true",
                        "ecb": "app.push.onNotificationAPN"
                    }
                );
            }
        },
        successHandler: function(result) {
            console.log('successHandler: ' + result);
			
            if (!device || device.platform != 'Android') {
				
                app.webservice.post(
                    '',
                    'PUT',
                    {
                        device:{
                            id		: window.localStorage.getItem("token"),
                            push_token  : result,
                            kind        : '1'
                        }
                    },
                    function(r){
                        console.log('RESULT DE REGISTRO');
                        console.log(JSON.stringify(r));
                        //window.localStorage.setItem("token", r.id);
                        //app.push.callback();
                    }, function(e){
                        console.log('RESULT ERROR DE REGISTRO');
                        console.log(JSON.stringify(e));
                        app.push.callback();
                    }
                );
            }
        },
        errorHandler: function(error) {
            console.log('errorHandler: ' + error);
        },
        onNotificationGCM: function(e) {
            console.log('onNotificationGCM: ' + e.event);
            //pushNotification.setApplicationIconBadgeNumber(this.successHandler, e.msgcnt);
            switch (e.event)
            {
                case 'registered':

                    if (e.regid.length > 0)
                    {
//                        console.log('registration id = '+e.regid);
                        app.webservice.registerDevice(
                            {
                                device:{
                                    push_token  : e.regid,
                                    kind        : '2'
                                }
                            }, 
                            function(r){
//                                console.log('RESULT DE REGISTRO');
//                                console.log(JSON.stringify(r));
                                window.localStorage.setItem("token", r.id);
                                app.push.callback();
                            }, function(e){
                                console.log('RESULT ERROR DE REGISTRO');
                                console.log(JSON.stringify(e));
                                app.push.callback();
                            }
                        );
                    }
                    break;

                case 'message':
                    // this is the actual push notification. its format depends on the data model from the push server
                    console.log('message = ' + e.message + ' msgcnt = ' + e.msgcnt);

                    navigator.notification.vibrate(1500);
                    break;

                case 'error':
                    console.log('GCM error = ' + e.msg);
                    break;

                default:
                    console.log('An unknown GCM event has occurred');
                    break;
            }
        }
    },
    /*! WEBSERVICE */
    webservice: {
        get: function(path, args, successCB, errorCB) {
            console.log('app.webservice.get(): ' + app.url + path, JSON.stringify(args));

            if(!app.checkConnection()){
                return;
            }
            
            $.ajax({
                type: 'GET',
                dataType: 'json',
                url: app.url + path,
                data: args,
//                crossDomain: true,
                headers: {
                    "Authorization": "Token token=" + app.token,
                    'X-Access-Token': app.userToken,
                    'X-Device-Token': window.localStorage.getItem("token")
                },
                success: function(data) {
                    successCB(data);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if(textStatus==="timeout"){
                        navigator.notification.alert(app.lang.getStr('%Lost connection to the server.\r\nCheck your internet connection and try again.%', 'aplication'), 
                            function () {}, 
                            app.lang.getStr('%Connection Error%', 'aplication'), app.lang.getStr('%Try again%', 'aplication'));
                    }else{
                        /*navigator.notification.alert(textStatus, 'Close');*/
                    } 
                    var err = {
                        a: jqXHR,
                        msg: textStatus,
                        message: 'Webservice Error: '+errorThrown
                    };
                    errorCB(err);
                    console.log("jqXHR.responseText: "+jqXHR.responseText);
                    console.log("textStatus: "+textStatus);
                    console.log("errorThrown: "+errorThrown);
                }
            });
        },
        getOwner: function(path, args, successCB, errorCB) {
            console.log('app.webservice.getOwner(): ' + app.ownerUrl + path, JSON.stringify(args));

            if(!app.checkConnection()){
                return;
            }
            
            $.ajax({
                type: 'GET',
                dataType: 'json',
                url: app.ownerUrl + path,
                data: args,
//                crossDomain: true,
                headers: {
                    "X-User-Email" : window.localStorage.getItem("ownerEmail"),
                    'X-User-Token' : window.localStorage.getItem("ownerToken"),
                    "contentType": "application/json"
                },
                success: function(data) {
                    successCB(data);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    var err = {
                        a: jqXHR,
                        msg: textStatus,
                        message: 'Webservice Error: '+errorThrown
                    };
                    errorCB(err);
                    console.log(jqXHR.responseText);
                }
            });
        },
        post: function(path, type, args, successCB, errorCB) {
            console.log('app.webservice.post(): ' + (app.url  + '/' + path), JSON.stringify(args));

            if(!app.checkConnection()){
                return;
            }
            
            $.ajax({
                type: type,
                dataType: 'json',
                url: app.url + path,
                crossDomain: true,
                data: args,
                //		processData: false,
                //		async: true,
                headers: {
                  "Authorization": "Token token=" + app.token,
                  'X-Access-Token': app.userToken,
                  'X-Device-Token': window.localStorage.getItem("token"),
                  "contentType": "application/json"
                },
                success: function(data) {
                    successCB(data);
                },
                error: function(a, b, c) {
                    var err = {
                        a: a,
                        msg: b,
                        message: 'Webservice Error: '+c
                    };
                    errorCB(err);
                }
            });
        },
        ownerPost: function(path, type, args, successCB, errorCB) {
            console.log('app.webservice.post(): ' + (app.ownerUrl  + '/' + path), JSON.stringify(args));

            if(!app.checkConnection()){
                return;
            }
            
            $.ajax({
                type: type,
                dataType: 'json',
                url: app.ownerUrl + path,
                crossDomain: true,
                data: args,
                //		processData: false,
                //		async: true,
                headers: {
                    "X-User-Email" : window.localStorage.getItem("ownerEmail"),
                    'X-User-Token' : window.localStorage.getItem("ownerToken"),
                    "contentType"  : "application/json"
                },
                success: function(data) {
                    successCB(data);
                },
                error: function(a, b, c) {
                    var err = {
                        a: a,
                        msg: b,
                        message: 'Webservice Error: '+c
                    };
                    errorCB(err);
                }
            });
        },
        registerDevice: function(args,successCB,errorCB){
            console.log('app.webservice.registerDevice(): ' + app.url +' > ' + app.token);
            console.log(JSON.stringify(args));
            if(app.offLine){
                return;
            }
            
            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: app.url + 'device/',
                crossDomain: true,
                data: args,
                //		processData: false,
                //		async: true,
                headers: {
                    "Authorization": "Token token=" + app.token,
                    "contentType": "application/json"
                },
                success: function(data) {
                    successCB(data);
                },
                error: function(a, b, c) {
                    var err = {
                        a: a,
                        msg: b,
                        message: 'Webservice Error: '+ c
                    };
                    errorCB(err);
                }
            });
        },
        ownerLogin: function(args,successCB,errorCB){
            console.log('app.owner.ownerLogin(): ' + app.ownerUrl+' args: '+JSON.stringify(args));
            if(!app.checkConnection()){
                return;
            }

            $.ajax({
                type: 'POST',
                dataType: 'json',
                url: app.ownerUrl + 'sessions',
                crossDomain: true,
                data: args,
                headers: {
                    "contentType": "application/json"
                },
                success: function(data) {
                    successCB(data);
                },
                error: function(a, b, c) {
                    var err = {
                        a: a,
                        msg: b,
                        message: 'Webservice Error: '+ c
                    };
                    errorCB(err);
                }
            });
        }
    },
    checkConnection: function(){

        if(!app.offLine)

            return true;

        else return false;
        
        return true;
        
    },
    geolocation: {
        start: function(){
            console.log('app.geolocation.start()');
            
            if (device && device.platform === 'Android') {
                this.watchID =  navigator.geolocation.watchPosition(function(position){
                        
                    app.geolocation.checkPosition(position);

                 }, function(error){

                     app.geolocation.showError(error);

                 }, {timeout: 10000, enableHighAccuracy: true});
            }else{
	    	setTimeout(function(){
			this.watchID =  setInterval(function(){
					navigator.geolocation.getCurrentPosition(function(position){
                        
                        		app.geolocation.checkPosition(position);
                       
		       		}, function(error){
		       			console.log('ERROR GEO IOS');
					app.geolocation.showError(error);
                        
				}, {timeout: 10000, enableHighAccuracy: true});
			},3000);
		},1000);
            }

        },
        checkPosition: function(position){
            //console.log('----------------------' + JSON.stringify(position));
            //console.log('----------------------' + ((position.timestamp - app.lastGeoDate)/1000) +'>=' + '30');

            if(app.views.vMap.userPoss)
                app.views.vMap.userPoss.setPosition(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
			
		app.device.latitude  = position.coords.latitude;
	        app.device.longitude = position.coords.longitude;
			
		//console.log('CHECK POSITION DEVICE> ' + app.device.latitude +', ' + app.device.longitude);
			
            if(!app.lastGeoDate || (((position.timestamp - app.lastGeoDate)/1000)>=30)){
                app.lastGeoDate = position.timestamp;

                app.webservice.post( 
                    'position', 
                    'PUT', 
                    {
                        device: {
                            latitude  : position.coords.latitude,
                            longitude : position.coords.longitude
                        }
                    }, function(r){
//                            console.log('SUCESSO GEO: '+ JSON.stringify(r));
                    }, function(e){
                        console.log('ERRO GEO');
                        console.log(JSON.stringify(e));
                    }
                );
            }
        },
        showError: function(error){
            console.log(JSON.stringify(error));
            //navigator.notification.alert(app.lang.getStr('%Was not possible to pinpoint your location, please call your GPS.%', 'aplication'), function(){}, app.lang.getStr('%GPS error%', 'aplication'), app.lang.getStr('%Close%', 'aplication'));

        },
        close: function(){
            
            navigator.geolocation.clearWatch(this.watchID);
            
        }
    },
    showKeyboard : function(e){
    },
    hideKeyboard : function(e){
        
        $('.chatContent').css('height', ($(window).height() - ($('#menuNavBar').outerHeight(true)+$('#navChatFooter').outerHeight(true))));
        $('#chatList').css('height',($('.chatContent').height()-$('#storeTitle').outerHeight(true)));
        $("#chatList").scrollTop($('#chatList').prop("scrollHeight")); 
        
    }
};

