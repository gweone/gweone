var gweone = gweone || {};
(function () {
    gweone.pulsa = {};
    gweone.pulsa.cookie = { prefix: 'com.gweone.pulsa.cookie.' };

    gweone.pulsa.cookie.create = function (name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        }
        else var expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    };
    gweone.pulsa.cookie.read = function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    };
    gweone.pulsa.cookie.erase = function (name) {
        gweone.pulsa.cookie.create(name, "", -1);
    };
    gweone.pulsa.cookie.setToken = function (data) {
        if (data == null)
            return;
        data.expires_in = 24 * 60 * 60;
        for (var key in data) {
            gweone.pulsa.cookie.create(gweone.pulsa.cookie.prefix + key, data[key], data.expires_in / (24 * 60 * 60));
        }
        var date = new Date();
        date.setTime(date.getTime() + (data.expires_in * 1000));
        gweone.pulsa.cookie.create(gweone.pulsa.cookie.prefix + "expire_time", date.getTime(), data.expires_in / (24 * 60 * 60));
    };
    gweone.pulsa.cookie.getToken = function () {
        var token = null;
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ')
                c = c.substring(1, c.length);
            if (c.indexOf(gweone.pulsa.cookie.prefix) == 0) {
                if (!token)
                    token = {};
                token[c.split('=')[0].replace(gweone.pulsa.cookie.prefix, '')] = c.split('=')[1];
            }

        }
        return token;
    };
    gweone.pulsa.cookie.clearToken = function () {
        var token = gweone.pulsa.cookie.getToken();
        for (key in token) {
            gweone.pulsa.cookie.erase(gweone.pulsa.cookie.prefix + key);
        }
    };
    gweone.pulsa.cookie.isValidToken = function () {
        var token = gweone.pulsa.cookie.getToken();
        if (token && token.expire_time > new Date().getTime())
            return true;
        return false;
    };

    gweone.pulsa.fn = {};
    gweone.pulsa.fn.getFunction = function (code, argNames) {
        var fn = window, parts = (code || "").split(".");
        while (fn && parts.length) {
            fn = fn[parts.shift()];
        }
        if (typeof (fn) === "function") {
            return fn;
        }
        argNames.push(code);
        return Function.constructor.apply(null, argNames);
    };
    gweone.pulsa.fn.getFragment = function (data) {
        if (!data)
            return null;
        return gweone.pulsa.fn.parseQueryString(data);
    };
    gweone.pulsa.fn.parseQueryString = function (queryString) {
        var data = {},
            pairs, pair, separatorIndex, escapedKey, escapedValue, key, value;

        if (queryString === null) {
            return data;
        }

        pairs = queryString.split("&");

        for (var i = 0; i < pairs.length; i++) {
            pair = pairs[i];
            separatorIndex = pair.indexOf("=");

            if (separatorIndex === -1) {
                escapedKey = pair;
                escapedValue = null;
            } else {
                escapedKey = pair.substr(0, separatorIndex);
                escapedValue = pair.substr(separatorIndex + 1);
            }

            key = decodeURIComponent(escapedKey);
            value = decodeURIComponent(escapedValue);

            data[key] = value;
        }

        return data;
    };

    gweone.pulsa.fn.addQueryString = function (uri, parameters) {
        var delimiter = (uri.indexOf('?') == -1) ? '?' : '&';
        for (var parameterName in parameters) {
            var parameterValue = parameters[parameterName];
            uri += delimiter + encodeURIComponent(parameterName) + '=' + encodeURIComponent(parameterValue);
            delimiter = '&';
        }
        return uri;
    };

    gweone.pulsa.fn.query = function (url, data, callback) {
        $.ajax({
            url: url,
            jsonp: "callback",
            dataType: "jsonp",
            data : data,
            success: function (response) {
                callback(response);
            }
        });
    };

    gweone.pulsa.initialize = function () {        
        if (gweone.pulsa.cookie.isValidToken()) {
            var reff = gweone.pulsa.fn.parseQueryString(window.location.search.replace('?', ''))['referral'];
            if (!reff || gweone.pulsa.cookie.getToken()['Code'] == reff)
                return;
        }
        gweone.pulsa.fn.query('http://services.gweone.com/api/Pulsa/GetReferral',
            {
                key: Math.random(),
                reff: gweone.pulsa.fn.parseQueryString(window.location.search.replace('?', ''))['referral'] || ''
            },
            function (data) {
                gweone.pulsa.cookie.setToken(data);
            })
    };

    gweone.pulsa.initialize();
})();