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

    initialize: function () {
        console.log('app.initialize');
        $.extend(this, appCore);
        $.extend(this, account);
        $.extend(this, ownerLogin);
        $.extend(this, ownerRegister);
        $.extend(this, ownerChat);
        $.extend(this, vMap);
        $.extend(this, chat);
        $.extend(this, notification);
        $.extend(this, leaflet);
        $.extend(this, search);
        $.extend(this, pin);
        $.extend(this, products);
        $.extend(this, login);
        $.extend(this, home);
        $.extend(this, views);
        $.extend(this, purchase);
        app.events();
    },

    events: function () {
        console.log('app.events');

        $('#appTile').html(app.appName);
        $('#splashViewTitle').html(app.appName);
        document.title = app.Name;

        document.addEventListener('deviceready', this.onDeviceReady, false);
        
        window.addEventListener('native.keyboardshow', app.showKeyboard);
        window.addEventListener('native.keyboardhide', app.hideKeyboard);
        
    },
    onDeviceReady: function () {
        console.log('app.onDeviceReady');

        window.open = cordova.InAppBrowser.open;
        app.deviceReady = true;
        document.addEventListener("resume", function() {
            app.chat.checkUnreadMessage();
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
                app.home.init();

            } else{
                //app.login.init();
                app.home.init();
            }
        }, false);

        if (device && device.platform === 'Android') {
            document.addEventListener("backbutton", function () {
                app.views.goBack();
            }, false);
        }

        $(document).ajaxSend(function(event, jqXHR, settings) {
            if (settings.url.indexOf("dev.phowma") > -1){
                $('.contentAjust').addClass('hide');
                app.views.loadView.show();
            }
        });
        $(document).ajaxComplete(function(event, jqXHR, settings) {
            if (settings.url.indexOf("dev.phowma") > -1){
                $('.contentAjust').removeClass('hide');
                app.views.loadView.hide();
            }
        });
		
        if (device && device.platform === 'iOS') {

            $('#menuNavBar').css('margin-top','20px');
            $('#content').css('padding-top','10px');
            $('#msgCount').css('margin-left', '-25px');
        }
        var old_token_cleared = window.localStorage.getItem("old_token_cleared");
        console.log("old_token_cleared: "+old_token_cleared);
        if (!old_token_cleared){
            console.log("old_token_cleared not found");
            window.localStorage.removeItem("token");
            window.localStorage.setItem("old_token_cleared","true");
        }

        if (!window.localStorage.getItem("token")) {
            console.log('Token does not exist');

            navigator.geolocation.getCurrentPosition(
                function (position) {
                    console.log('GPS RESULT');
                    console.log('latitude: '+position.coords.latitude);
                    console.log('longitude: '+position.coords.longitude);
                    app.registerDevice(position.coords.latitude, position.coords.longitude);
                },
                function (error) {
                    console.log('GPS ERROR');
                    console.log(JSON.stringify(error));
                    app.registerDevice(40.7128, -74.0059);
                },
                {timeout: 3000, enableHighAccuracy: true}
            );

        } else {
            console.log('Token exists');
            app.lang.config(function () {

                app.webservice.get(
                    'device',
                    {},
                    function (r) {
                        console.log('Get device success');
                        console.log(JSON.stringify(r));
                        app.device = r;
                        mixpanel.identify(r.id);
                        mixpanel.register({
                            "app_id": app.token
                        });                

                        app.userToken = window.localStorage.getItem("user_token");

                        if (app.loginRequired == false ) {
                            app.home.init();
                        /* Attempt to validate the token */
                        }else if (app.loginRequired == true && app.userToken){
                            app.webservice.get(
                                'session',
                                {},
                                function (result) {
                                    console.log("result: "+JSON.stringify(result));
                                    console.log("User Token is valid");
                                    app.clientStores = result.client.store_ids;
                                    app.home.init();
                                },
                                function (err) {
                                    console.log("err: "+JSON.stringify(err));
                                    console.log("User Token is not valid");
                                    app.login.init();
                                }
                            );
                        }else{
                            app.login.init();
                        }
                    }, function (e) {
                    console.log('Get Device error');
                    console.log(JSON.stringify(e));
                    }
                );
            });
        }
    },
    onBackKeyDown: function(e){
        e.preventDefault();
    },
    registerDevice: function (latitude, longitude) {
        app.webservice.registerDevice(
           {
                device: {
                    kind: (device && device.platform === 'Android') ? '2' : '1',
                    latitude: latitude,
                    longitude: longitude,
                    radius: '10000'
                }
            },
            function (r) {
                console.log('Register device success');
                console.log(JSON.stringify(r));
                window.localStorage.setItem("token", r.token);
                mixpanel.identify(r.id);
                mixpanel.people.set({
                    "device_type": device.platform
                });
                mixpanel.register({
                    "app_id": app.token
                });                
                app.lang.config(function () {
                    if (app.loginRequired == true) {
                        app.login.init();
                    } else {
                        app.home.init();
                    }
                });
            }, 
            function (e) {
                console.log('Register device error');
                console.log(JSON.stringify(e));
            }
        );
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
    console.log('document.ready');
    app.initialize();
});
function loadstartcb(event){
    navigator.notification.activityStart("Please Wait","Loading...");
}
function loadstopcb(event){
    navigator.notification.activityStop();
}
function loaderrorcb(event){
    navigator.notification.activityStop();
}
function showHideBackButton(name){
    var length = app.views.backStack.length;
    
    // Only push on stack if not already on stack
    if (length > 0){
        var backToStr = app.views.backStack[length-1];
        if (name.indexOf(backToStr) != 0) app.views.backStack.push(name);
    } else {
        app.views.backStack.push(name);
    }

    if (app.views.backStack.length > 1){
        var ind = app.views.backStack.length-2;
        $('#backStack').html(app.views.backStack[ind]);
        $('#backLink').removeClass('hide');
    }else{
        $('#backLink').addClass('hide');
    }
}
function stripAbout(about){
    // **hideAddress,showMapButton,hideChatButton,showOnMap,hideContactButton,fuelIcon,foodIcon,exitIcon,hotelIcon,hideFavoriteButton**
    aboutStripped = about;
    var strArray = about.split("**");
    if (strArray.length > 0){
        aboutStripped = strArray[strArray.length-1];
    }else {
        aboutStripped = about;
    }
    strArray = aboutStripped.split("~~");
    if (strArray.length > 0){
        aboutStripped = strArray[strArray.length-1];
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
            codeArray[i].indexOf(code)
            if (codeArray[i].indexOf(code) === 0)
                return true;
        }
    }
    return false;
}
function getCustomName(about,code){
    var strArray = about.split("**");
    var strCodes;
    if (strArray.length > 1){
        strCodes = strArray[1];
        var codeArray = strCodes.split(",");
        for (i=0; i<codeArray.length; i++){
            if (codeArray[i].indexOf(code) === 0){
                buttonArray = codeArray[i].split(";");
                if (buttonArray.length >=2 ) return buttonArray[1];
                else return "";
            }
        }
    }
    return "";
}
function getCustomType(about,code){
    var strArray = about.split("**");
    var strCodes;
    if (strArray.length > 1){
        strCodes = strArray[1];
        var codeArray = strCodes.split(",");
        for (i=0; i<codeArray.length; i++){
            if (codeArray[i].indexOf(code) === 0){
                buttonArray = codeArray[i].split(";");
                if (buttonArray.length >=3 ) return buttonArray[2];
                else return "";
            }
        }
    }
    return "";
}
function getCustomLink(about,code){
    var strArray = about.split("**");
    var strCodes;
    if (strArray.length > 1){
        strCodes = strArray[1];
        var codeArray = strCodes.split(",");
        for (i=0; i<codeArray.length; i++){
            if (codeArray[i].indexOf(code) === 0){
                buttonArray = codeArray[i].split(";");
                if (buttonArray.length >=4 ) return buttonArray[3];
                else return "";
            }
        }
    }
    return "";
    
}
function getTabName(about,code){
    var strArray = about.split("**");
    var strCodes;
    if (strArray.length > 1){
        strCodes = strArray[1];
        var codeArray = strCodes.split(",");
        for (i=0; i<codeArray.length; i++){
            if (codeArray[i].indexOf(code) === 0){
                buttonArray = codeArray[i].split(";");
                if (buttonArray.length >=2 ) return buttonArray[1];
                else return "";
            }
        }
    }
    return "";
    
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
    var link = '...<a href="#" class="read_more readMore toProduct" style="font-size: 100%;" data-callback="app.products.productDetail" store_id="' + store_id + '" prod_id="' + id + '" type="description" data-pin="false"> ' + readMode + '</a>';

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
        a[i].setAttribute("data-callback","app.home.openSite");
        a[i].href = "#"
    }
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
                text = text.replace(links[j].href, '<a href="#" data-callback="app.home.openSite" data-site="' + links[j].href + '" >' + "Calendar" + '</a>');
            } else {
                text = text.replace(links[j].href, '<a href="#" data-callback="app.home.openSite" data-site="' + links[j].href + '" >' + links[j].href + '</a>');
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

        text = text.replace(rtn[0], '<a href="#" data-callback="app.home.openSite" data-site="' + rtn[0] + '" class="btn btn-link">' + rtn[0] + '</a>');

    }
    else if (reg1.test(text)) {

        rtn = reg1.exec(text);

        text = text.replace(rtn[0], '<a href="#" data-callback="app.home.openSite" data-site="' + rtn[0] + '" class="btn btn-link">' + rtn[0] + '</a>');

    } else {
        //sites
        reg = /www?([0-9a-zA-Z]+[-._+&amp;])*[0-9a-zA-Z]+([-0-9a-zA-Z]+[.])+([a-zA-Z]{2,6})?(\/[a-z-A-Z0-9+&@#\/%?=~_|!:,.;]*)?/;

        if (reg.test(text)) {
            //console.log(text);
            rtn = reg.exec(text);

            text = text.replace(rtn[0], '<a href="#" data-callback="app.home.openSite" data-site="' + rtn[0] + '" class="btn btn-link">' + rtn[0] + '</a>');

        }
    }

    return text;
}
function hideHomeMenu() {
    $('.carousel').addClass('hide');
    $('#menubutton').addClass('hide');
    $('#landingPageMenu').addClass('hide');
    $('#landingPageMenu').collapse('hide');
    $('#searchMenu').addClass('hide');
    $('.navbar').removeClass('hide');
}
function showHomeMenu() {
    $('.carousel').removeClass('hide');
    $('#menubutton').removeClass('hide');
    $('#landingPageMenu').removeClass('hide');
    $('#landingPageMenu').collapse('hide');
    $('#searchMenu').removeClass('hide');
    $('.navbar').addClass('hide');
}
function getJsonFromUrl(url) {
  if(!url) url = location.href;
  var question = url.indexOf("?");
  var hash = url.indexOf("#");
  if(hash==-1 && question==-1) return {};
  if(hash==-1) hash = url.length;
  var query = question==-1 || hash==question+1 ? url.substring(hash) : 
  url.substring(question+1,hash);
  var result = {};
  query.split("&").forEach(function(part) {
    if(!part) return;
    part = part.split("+").join(" "); // replace every + with space, regexp-free version
    var eq = part.indexOf("=");
    var key = eq>-1 ? part.substr(0,eq) : part;
    var val = eq>-1 ? decodeURIComponent(part.substr(eq+1)) : "";
    var from = key.indexOf("[");
    if(from==-1) result[decodeURIComponent(key)] = val;
    else {
      var to = key.indexOf("]",from);
      var index = decodeURIComponent(key.substring(from+1,to));
      key = decodeURIComponent(key.substring(0,from));
      if(!result[key]) result[key] = [];
      if(!index) result[key].push(val);
      else result[key][index] = val;
    }
  });
  return result;
}function handleOpenURL(url) {
  console.log("received url: " + url);
  params = getJsonFromUrl(url);
  console.log("params['id']: "+params['id']);
  if (params['chat'] == 'true'){
	app.chat.goToChat(params['id']);
  } else {	  
    app.home.getStoreDetail(params['id'], true, 'true');
  }
}
    