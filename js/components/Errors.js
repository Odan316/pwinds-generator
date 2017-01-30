define([
    'jquery',
    'lodash'
], function($, _){

    /**
     * Object, that contains error codes
     * @constructor
     */
    var Errors = function() {
        this.ERROR_ENTITY_NOT_FOUND = 1;

        var _errorTitles = {
            1: "Requested entity is not found"
        };

        this.getErrorText = function(errorType) {
            return _errorTitles[errorType];
        };
    }

    return Errors;
});