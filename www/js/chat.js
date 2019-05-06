var chat = {
        chat: {
            start: true,
            chekTime : '',
            stores  : [],
            init: function(e){
                console.log('app.chat.init()');
                console.log('store_index:'+$(e).attr('store_index'));

                if($(e).attr('dadStore')=='true' && app.home.oStoreDetail){
                    store = app.home.oStoreDetail;
                }else{
                    store = $(e).attr('dadStore')=='true' ? app.views.stores[$(e).attr('store_index')] : app.home.storesChild[$(e).attr('store_index')];
                }

                app.chat.openChat(store);
                
            },
            goToChat: function(store_id){
                app.webservice.get(
                    'stores/' + store_id,
                    {},
                    function (result) {
                        console.log("store detail: "+JSON.stringify(result));
                        app.home.oStoreDetail = result;
						app.chat.openChat(result);
                    },
                    function (e) {
                        console.log(JSON.stringify(e));
                    }
				);
			},
            openChat: function(store){
                console.log('app.chat.openChat');
                mixpanel.track("Chat",{"store_id":store.id });
                hideHomeMenu();
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
                                    app.chat.start = false;
                                }

                                $('.chatContent').css('height', ($(window).height() - ($('#menuNavBar').outerHeight(true)+$('#navChatFooter').outerHeight(true))));
                                $('#chatList').css('height',($('.chatContent').height()-$('#storeTitle').outerHeight(true)));

                                $.each(result.messages, function (index, item) {
                                    app.chat.addMessage(item,stripLeadingTag(store.short_name));
                                });
                                setTimeout(function(){ 
                                    $("#chatList").animate({ scrollTop: $('#chatList').prop("scrollHeight")}, 1000);
                                }, 
                                500);

                                app.chat.checkUnreadMessage();                    
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
                console.log('app.chat.addMessage');
                var name = '';
                if (item.kind == 1){
                    if (app.device.name) name = app.device.name;
                    else name = $('#chatUserName').val();
                }else {
                    if (storeName) name=storeName;
                    else name=app.home.oStoreDetail.short_name;
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
                console.log('app.chat.list()');
                mixpanel.track("Chats");
                app.views.backStack.push("Chats");
                hideHomeMenu();

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
                                
                                app.chat.stores = result.stores;
                                
                                $.each(result.stores, function (index, item) {
                                    app.chat.addStore(item,index);
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
                console.log('app.chat.loadStoreChat()');
                
                app.chat.openChat(app.chat.stores[$(e).attr('store_index')]);
                
            },
            addStore : function(storeChat,index){
                console.log('app.chat.addStore');
                app.draw(
                    '#chatStoreList',
                    '#chatStoreItem',
                    'chatView',
                    {
                        index          : index,
                        id             : storeChat.id,
                        img            : storeChat.logo,
                        storeName      : storeChat.formatted_name,
                        FormattedName  : storeChat.formatted_name,
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
                console.log('app.chat.sendMessage()');
                
                if(!app.chat.start){
                    
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
                        
                        app.chat.addMessage(result);
                        
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
                console.log('app.chat.checkMensage()');
                
                app.webservice.get(
                    'stores/'+store_id+'/messages/unread',
                    {},
                    function (result) {
                        $.each(result.messages, function (index, item) {
                            app.chat.addMessage(item,store_name);
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
                console.log('app.chat.checkUnreadMessage()');
                
                app.webservice.get(
                    'messages',
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));
                        var count = 0;
                        $.each(result.stores, function (index, item) {
                            if (parseInt(item.id) == parseInt($('#storeTitleName').attr('store_id'))){
                                app.chat.checkMensage(item.id,item.name);
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
        },
}