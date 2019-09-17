ApexChat.Callbacks = {};
window.addEventListener("message", function(event){
    if(event.source == window){
        // ignore events from myself
        console.log('Ignoring event from ' + event.origin, event)
        return
    }
    var result;
    console.log('message rx', event)
    switch(event.data.method){
        case "ApexChat.Cookies.set":
            ApexChat.Cookies.set(event.data.arguments[0], event.data.arguments[1], evenet.data.arguments[2]);
            break;
        case "ApexChat.Cookies.get":
            ApexChat.Cookies.get(event.data.arguments[0], function(result){
                event.source.postMessage({
                    id: event.data.id,
                    method: event.data.method + ".result",
                    result: result
                }, '*'); //event.origin);
            })
            break;
        case "ApexChat.Cookies.get.result":
        case "ApexChat.Cookies.set.result":
            var callback = ApexChat.Callbacks[event.data.id];
            if(callback){
                callback(result)
            }else{
                console.warn('No callback!', event)
            }
            delete ApexChat.Callbacks[event.data.id];
            break;
    }

    // this "if" avoids infinte loops of posting back and forth, and self-posting
    if(event.data.method.indexOf(".result") == -1 && event.source != window){
        
    }
}, false);

ApexChat.Cookies = {
    set: function (name, value, days) {
        if(ApexChat.framed){
            window.postMessage({
                method: "ApexChat.Cookies.set",
                arguments: Array.prototype.slice.call(arguments)
            }, '*');
            return
        }
        var expires;
        if (name) {
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toGMTString();
            }
            else {
                expires = "";
            }
            document.cookie = name + "=" + escape(value) + expires + "; path=/";
        }
    },
    setShort: function (name, value, seconds) {
        var expires;
        if (name) {
            if (seconds) {
                var date = new Date();
                date.setTime(date.getTime() + (seconds * 1000));
                expires = "; expires=" + date.toGMTString();
            }
            else {
                expires = "";
            }
            document.cookie = name + "=" + escape(value) + expires + "; path=/";
        }
    },
    get: function (name, callback) {
        if(ApexChat.framed){
            var id = (new Date()).getTime()

            ApexChat.Callbacks[id] = callback
            window.postMessage({
                id: id,
                method: "ApexChat.Cookies.get",
                arguments: [name]
            }, '*');
            return
        }
        if (name) {
            var match = document.cookie.match(new RegExp(name + "=(.*?)(?:;|$)"));
            if (match) {
                callback(unescape(match[1].replace(/\+/g, "%20")))
            }else{
                callback()
            }
        }else{
            callback()
        }
    },

    list: function (callback) {
        if(ApexChat.framed){
            var id = (new Date()).getTime()

            ApexChat.Callbacks[id] = callback
            window.postMessage({
                id: id,
                method: "ApexChat.Cookies.list",
                arguments: []
            }, '*');
            return
        }
        var pairs = document.cookie.split(new RegExp("; "));
        if (pairs.length > 0 && pairs[0] !== "") {
            var keys = new Array(pairs.length);
            for (var i = 0; i < pairs.length; i++) {
                keys[i] = pairs[i].match(/(.+?)=/)[1];
            }
            callback(keys)
        }
        callback([]);
    },

    // delete is a reserved word, so appending an underscore
    del: function (name) {
        this.set(name, "", -1);
    }
};