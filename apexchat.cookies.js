ApexChat.Callbacks = {};
window.addEventListener("message", function(event){
    
    var result;
    switch(event.data.method){
        case "ApexChat.Cookies.set":
            result = ApexChat.Cookies.set.apply(ApexChat.Cookies, event.data.arguments)
            break;
        case "ApexChat.Cookies.get":
            result = ApexChat.Cookies.get.apply(ApexChat.Cookies, event.data.arguments)
            break;
        case "ApexChat.Cookies.get.result":
        case "ApexChat.Cookies.set.result":
            var callback = ApexChat.Callbacks[event.data.id];
            if(callback){
                callback.apply(ApexChat.Cookies, result)
            }
            delete ApexChat.Callbacks[event.data.id];
            break;
    }

    // this "if" avoids infinte loops of posting back and forth, and self-posting
    if(event.data.method.indexOf(".result") == -1 && event.source != window){
        // only post if not a result
        event.source.postMessage({
            method: event.data.method + ".result",
            result: result
        }, event.origin);
    }
}, false);

ApexChat.Cookies = {
        set: function (name, value, days) {
        	if(ApexChat.framed){
          	    window.postMessage({
            	    method: "ApexChat.Cookies.set",
            	    arguments: Array.prototype.slice.call(arguments)
                });
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
          	    window.postMessage({
                    id: id,
            	    method: "ApexChat.Cookies.get",
            	    arguments: [name]
                });
                ApexChat.Callbacks[id] = callback
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
          	    window.postMessage({
                    id: id,
            	    method: "ApexChat.Cookies.list",
            	    arguments: []
                });
                ApexChat.Callbacks[id] = callback
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

ApexChat.Cookies.set('test', 'this is a test');
ApexChat.Cookies.get('test', function(result){
    document.getElementById('out').innerHTML = result
})