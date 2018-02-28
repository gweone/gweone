var ecs = ecs || {};
if (!ecs.resource)
    ecs.resource = { items: [] };
ecs.history = {};
(function ($) {
    ecs.init = function (selector) {
        ecs.removeAds(document);
        var adsInterval = setInterval(function () {
            ecs.removeAds(document);
        }, 100);
        setTimeout(function () {
            ecs.removeAds(document);
            clearInterval(adsInterval);
        }, 1000);

        if (ecs.form && ecs.form.init)
            ecs.form.init(selector);
    };
    
    ecs.removeAds = function (selector) {
        $(selector).find("[onmouseover*=S_ssac]").prev().prev().remove();
        $(selector).find("[onmouseover*=S_ssac]").prev().remove();
        $(selector).find("[onmouseover*=S_ssac]").remove();
        if ($(selector).find("[href='http://somee.com']").parent().parent().is('center'))
            $(selector).find("[href='http://somee.com']").parent().parent().remove();
        $(selector).find("[href='http://somee.com']").parent().remove();
        $(selector).find('script[src="http://ads.mgmt.somee.com/serveimages/ad2/WholeInsert4.js"]').remove();
    };

    ecs.resource.require = function (name) {
        if (!!ecs.resource.items[name].installed)
            return;
        if (!!ecs.resource.items[name].dependOn)
            $.each(ecs.resource.items[name].dependOn, function (index, value) {
                ecs.resource.require(value);
            });
        if (!!ecs.resource.items[name].path) {
            jQuery.ajax({
                async: false,
                type: 'GET',
                url: ecs.resource.items[name].path,
                data: null,
                dataType: 'script',
                complete: function (xhr, status) {
                    ecs.resource.items[name].installed = 1;
                }
            });
        }
    };
    
    ecs.history = {};
    ecs.history.attach = function (callback) {
        ecs.resource.require('jQueryHistory');
        History.Adapter.bind(window, 'statechange', function () { // Note: We are using statechange instead of popstate
            var state = History.getState();
            callback(state);
        });
    };

    ecs.history.pushState = function (state, title, url) {
        ecs.resource.require('jQueryHistory');
        History.pushState(state, title, url);
    };

    ecs.history.replaceState = function (state, title, url) {
        ecs.resource.require('jQueryHistory');
        History.replaceState(state, title, url);
    };

    ecs.history.go = function (index) {
        ecs.resource.require('jQueryHistory');
        History.go(index);
    };

    ecs.history.back = function () {
        ecs.resource.require('jQueryHistory');
        History.back();
    };

    ecs.history.getState = function () {
        return History.getState();
    };

    ecs.parseQuery = function (search) {
        var args = [];
        if (search.indexOf('?') == 0)
            search = search.substring(1);
        args = search.split('&');
        var argsParsed = {};
        var i, arg, kvp, key, value;
        for (i = 0; i < args.length; i++) {
            arg = args[i];
            if (-1 === arg.indexOf('=')) {
                argsParsed[decodeURIComponent(arg).trim()] = true;
            }
            else {
                kvp = arg.split('=');
                key = decodeURIComponent(kvp[0]).trim();
                value = decodeURIComponent(kvp[1]).trim();
                argsParsed[key] = value;
            }
        }
        return argsParsed;
    }

    if (!ecs.ready) {
        ecs.ready = function (callback) {
            if (document.readyState === "complete") {
                callback();
            }
            else if (typeof (jQuery) != 'undefined') {
                $(function () { callback(); });
            }
            else if (document.addEventListener) {
                // Use the handy event callback
                document.addEventListener("DOMContentLoaded", function () {
                    callback();
                }, false);
            } else if (document.attachEvent) {
                document.attachEvent("onreadystatechange", function () {
                    if (document.readyState === "complete") {
                        callback();
                    }
                });
            }
        };
    }

    ecs.url = {};
    ecs.url.getQuery = function (name) {
        var match,
        pl = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query = window.location.search.substring(1);

        var urlParams = {};
        while (match = search.exec(query))
            urlParams[decode(match[1])] = decode(match[2]);
        if (name)
            return urlParams[name];
        return urlParams;
    };

    ecs.window = {};
    ecs.window.proxy = {
        origin: window.location.origin,
        command: '',
        callback: '',
        data: null
    };
    ecs.window.commands = {};

    window.addEventListener('message', function (e) {
        if (e.data.command) {
            var cmd = ecs.window.commands[e.data.command];
            if (cmd && cmd.execute)
                cmd.execute(e.data);
        }
    });

    ecs.tab = { launch: {} };
    ecs.tab.launch.createUrl = function (options) {
        var result = "#!m=tab";
        if (options.id)
            result += "&i=" + options.id;
        return result;
    };
    ecs.tab.launch.show = function (selector) {
        if (!window.location.hash)
            return;
        if (window.location.hash.indexOf('#!') != 0)
            return;
        if (!$ && !$.fn.tab)
            return;
        var pCollection = ecs.parseQuery(window.location.hash.replace('#!', ''));
        if (pCollection['m'] != 'tab')
            return;

        var tabOpt = {
            id: pCollection['i']
        };

        $('a[href="#' + tabOpt.id + '"]').tab('show');
    };

    ecs.cookie = { prefix: 'com.ecs.cookie.' };
    ecs.cookie.create = function (name, value, days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            var expires = "; expires=" + date.toGMTString();
        }
        else var expires = "";
        document.cookie = name + "=" + value + expires + "; path=/";
    };
    ecs.cookie.read = function (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    };
    ecs.cookie.erase = function (name) {
        ecs.cookie.create(name, "", -1);
    };
    //window.addEventListener('message', function (e) {
    //    alert(e.data);
    //});

})(jQuery);
