define([], function(){
    /**
     * Object, that contains error rather than normal generated entity
     * @constructor
     */
    var GeneratedErrorEntity = function(errorType) {
        this.type = errorType;
    }

    return GeneratedErrorEntity;
});