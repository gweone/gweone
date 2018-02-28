var ecs = {};
(function () {
    ecs.ready = function (callback) {     
        if (document.readyState === "complete") {
            callback();
        }   
        else if (typeof(jQuery) != 'undefined') {
            $(function () { callback(); });
        }
        else if (document.addEventListener) {
            // Use the handy event callback
            document.addEventListener("DOMContentLoaded", function (e) {
                callback(e);
            }, false);
        } else if (document.attachEvent) {
            document.attachEvent("onreadystatechange", function (e) {
                if (document.readyState === "complete") {
                    callback(e);
                }
            });
        }
    };
})();
