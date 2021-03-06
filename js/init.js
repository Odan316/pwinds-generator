requirejs.config({
    waitSeconds: 30,
    urlArgs: "bust=" + (new Date()).getTime(),
    shim : {
        "bootstrap" : { "deps" :['jquery'] },
        "bootstrap-treeview" : { "deps" :['jquery'] }
    },
    paths: {
        "require": "../vendor/requirejs/require",
        "jquery": "../vendor/jquery/dist/jquery.min",
        "bootstrap": "../vendor/bootstrap/dist/js/bootstrap.min",
        "lodash": "../vendor/lodash/dist/lodash.min",
        "bootstrap-treeview": "../vendor/bootstrap-treeview/dist/bootstrap-treeview.min",
        "text": "../vendor/requirejs-plugins/lib/text",
        "json": "../vendor/requirejs-plugins/src/json"
    }
});

require([
    'app',
    'bootstrap'
], function (App) {
    "use strict";
    String.prototype.capitalizeFirstLetter = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    String.prototype.beautifyTag = function () {
        return this.capitalizeFirstLetter().replace(/_/g, " ");
    };

    App.run();
});