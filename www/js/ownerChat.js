var ownerChat = {
    ownerChat: {
        start           : true,
        chekTime        : '',
        stores          : [],
        devices         : [],
        init: function(e){
            console.log('app.ownerChat.init()');
            app.ownerChat.openChat(app.views.stores[$(e).attr('store_index')]);
        },
        openChat: function(device_id, store_id){
            console.log('app.ownerChat.openChat');
            app.draw(
                '#content',
                '#ownerChatView',
                'ownerChatView',
                {
                    device_id   : device_id,
                    store_id    : store_id
                },
                '',
                function () {
                    showHideBackButton("ChatCustomer");
                    app.webservice.getOwner(
                        'devices/'+device_id+'/messages?store_id='+store_id,
                        {},
                        function (result) {
                            console.log(JSON.stringify(result));
                            $('.chatContent').css('height', ($(window).height() - ($('#menuNavBar').outerHeight(true)+$('#navChatFooter').outerHeight(true))));
                            $('#chatList').css('height',($('.chatContent').height()-$('#storeTitle').outerHeight(true)));

                            $.each(result.messages, function (index, item) {
                                app.ownerChat.addMessage(item,result.device);
                            });

                            $("#ownerChatList").scrollTop($('#chatList').prop("scrollHeight"));

                        },
                        function (err) {
                            console.log(JSON.stringify(err));
                        }
                    );

                    app.bindEvents();

                }
            );
        },
        addMessage: function(item,device){
            console.log('app.ownerChat.addMessage');
            var name = '';
            if (item.kind == 1){
                if (device) name = device.name;
                else name = $('#chatUserName').val();
            }else {
                name = "Me";
            }
                
            var dt = new Date(item.created_at);
            navigator.globalization.dateToString(
                dt,
                function (date) {
                    app.draw(
                        '#ownerChatList',
                        '#ownerChatItem',
                        'ownerChatItem',
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
        checkForNewMessages: function(){
            app.ownerChat.chekTime = setInterval(function(){
                app.webservice.getOwner(
                    'messages/stores',
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));
                    },
                    function (err) {
                        console.log(err);
                    }
                );
            },5000);
        },
        list: function(e){
            console.log('app.ownerChat.list()');
            app.draw(
                '#content',
                '#ownerChatListView',
                'ownerChatView',
                {},
                '',
                function () {

                    showHideBackButton("ownerChatList");
                    app.webservice.getOwner(
                        'messages/stores',
                        {},
                        function (result) {
                            console.log(JSON.stringify(result));
                            $('#storeName').html(app.stores.name);
                            app.ownerChat.stores = result.stores;

                            if(result.stores){

                                $.each(result.stores, function (index, item) {
                                    app.ownerChat.addStore(item,index);
                                });

                                if(result.stores.length==0){
                                    $('#ownerChatStoreList').html(app.lang.getStr('%No chat is initialized%', 'chatView'));
                                }
                            }else{

                                app.ownerChat.devices = result.devices;
                                store_id = app.stores.id;
                                $.each(result.devices, function (index, item) {
                                    app.ownerChat.addCustomer(item,index,store_id);
                                });

                                if(result.devices.length==0){
                                    $('#ownerChatStoreList').html(app.lang.getStr('%No chat is initialized%', 'chatView'));
                                }
                            }
                        },
                        function (err) {
                            console.log(err);
                        }
                    );
                    app.bindEvents();
                }
            );
        },
        loadStoreListFromLink: function(e){
            console.log("app.ownerChat.loadStoreListFromLink");
            var store_id = $(e).attr('store_id');
            console.log("store_id: "+store_id);
            app.ownerChat.loadStoreList(store_id);
        },
        loadStoreList: function(store_id){
            console.log('app.ownerChat.loadStoreList()');
            app.draw(
                '#content',
                '#ownerChatCustomerView',
                'ownerChatView',
                {
                    store_id: store_id
                },
                '',
                function () {
                    showHideBackButton("ownerChatCustomerList:"+store_id);
                    $("#refreshButton").attr('store_id',store_id);
                    $('#btBackRow').removeClass('hide')
                    app.webservice.getOwner(
                        'stores/' + store_id + '/messages',
                        {},
                        function (result) {
                            console.log(JSON.stringify(result));
                            app.ownerChat.devices = result.devices;

                            $.each(result.devices, function (index, item) {
                                app.ownerChat.addCustomer(item,index,store_id);
                            });

                            if(result.devices.length==0){
                                $('#ownerChatStoreList').html(app.lang.getStr('%No chat is initialized%', 'chatView'));
                            }
                        },
                        function (err) {
                            console.log(JSON.stringify(err));
                        }
                    );

                    app.bindEvents();
                }
            );
        },
        loadStoreChat: function(e){
            console.log('app.ownerChat.loadStoreChat()');
                
            app.ownerChat.openChat($(e).attr('device_id'), $(e).attr('store_id'));

        },
        addStore: function(storeChat,index){
            console.log('app.ownerChat.addStore()');
            app.draw(
                '#ownerChatStoreList',
                '#ownerChatStoreItem',
                'ownerChatView',
                {
                    index          : index,
                    id             : storeChat.id,
                    img            : storeChat.logo,
                    storeName      : stripLeadingTag(storeChat.name),
                    messages_count : storeChat.messages_count
                },
                'append',
                function () {
                    app.bindEvents();
                }
            );
            if (storeChat.messages_count == 0){
                $("#storeBadge_"+storeChat.id).removeClass('vex-badge');
                $("#storeBadge_"+storeChat.id).addClass('gray-badge');
            } else {
                $("#storeBadge_"+storeChat.id).addClass('vex-badge');
                $("#storeBadge_"+storeChat.id).removeClass('gray-badge');
            }
        },
        addCustomer: function(storeChat,index,store_id){
            console.log("app.ownerChat.addCustomer()");
            app.draw(
                '#ownerChatStoreList',
                '#ownerChatCustomerItem',
                'ownerChatView',
                {
                    index          : index,
                    store_id       : store_id,
                    device_id      : storeChat.id,
                    storeName      : storeChat.name,
                    messages_count : storeChat.messages_count
                },
                'append',
                function () {
                    app.bindEvents();
                    if (storeChat.messages_count == 0){
                        $("#storeBadge_"+storeChat.id).removeClass('vex-badge');
                        $("#storeBadge_"+storeChat.id).addClass('gray-badge');
                    } else {
                        $("#storeBadge_"+storeChat.id).addClass('vex-badge');
                        $("#storeBadge_"+storeChat.id).removeClass('gray-badge');
                    }
                }
            );
        },
        sendMessage: function(e){
            console.log('app.ownerChat.sendMessage()');
            if($('#chatUserMessage').val()==''){
                $('.alert-danger').html(app.lang.getStr('%The field <b>Message</b> is mandatory%','chatView'));
                $('.alert-danger').removeClass('hide');
                $('#chatUserMessage').focus();
                return;
            }

            app.webservice.ownerPost(
                'devices/' + $(e).attr('device_id') + '/messages?store_id=' + $(e).attr('store_id'),
                'POST',
                {
                    message: {
                        message     : $('#chatUserMessage').val()
                    }
                },
                function (result) {
                    console.log(JSON.stringify(result));
                    app.ownerChat.addMessage(result);

                    $('#newChatForm').addClass('hide');
                    $('.alert-danger').addClass('hide');


                    $('.chatContent').css('height', ($(window).height() - ($('#menuNavBar').height()+$('#navChatFooter').height() + 100)));
                    $('#chatList').css('height',($('.chatContent').height()-$('#chatStoreInfo').height() - 60) + 'px');
                    $("#chatList").animate({scrollTop: $('#chatList').prop("scrollHeight")}, 500);
                    $('#chatUserMessage').val('');

                },
                function (err) {
                    console.log(JSON.stringify(err));
                }
            );
        },
        checkMensage: function(device_id){
            console.log('app.ownerChat.checkMEnsage()');
            app.ownerChat.chekTime = setInterval(function(){

                if($('#chatUserMessage').length){
                    app.webservice.getOwner(
                        'stores/'+device_id+'/messages/unread',
                        {},
                        function (result) {
                            console.log(result);
                            $.each(result.messages, function (index, item) {
                                app.ownerChat.addMessage(item);
                            });

                            if(result.messages.length>0){
                                $("#chatList").animate({scrollTop: $('#chatList').prop("scrollHeight")}, 500);
                            }
                        },
                        function (err) {
                            console.log(err);
                        }
                    );
                }else{
                    clearInterval(app.ownerChat.chekTime);
                }

            },5000);
        },
        checkUnreadMessage: function(){
            console.log('app.ownerChat.checkUnreadMessage()');
            setInterval(function(){

                app.webservice.getOwner(
                    'messages',
                    {},
                    function (result) {
                        console.log(JSON.stringify(result));
                        var count = 0;

                        var messages = result.devices ? result.devices : result.stores;

                        $.each(messages, function (index, item) {
                            count += item.messages_count;
                        });

                        if(count>0){
                            $('#msgCount').removeClass('hide');
                            $('#msgCount').html(count);

                            if($('#chatStoreList').length){
                                $('#chatStoreList').html('');
                                $.each(result.stores, function (index, item) {
                                    app.ownerChat.addStore(item,index);
                                });
                            }
                        }else{
                            $('#msgCount').addClass('hide');
                        }
                    },
                    function (err) {
                        console.log(err);
                    }
                );
            },15000);
        }
    }
}