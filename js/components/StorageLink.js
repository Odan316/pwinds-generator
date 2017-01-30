define([
    'jquery',
    'lodash'
], function($, _){

    /**
     * Link on entity in storage entities tree
     *
     * @param {String|Array} linkInfo
     * @constructor
     */
    var StorageLink = function(linkInfo) {
        /**
         * Path to entity
         *
         * @type {Array|null}
         * @private
         */
        var _path = null;

        /**
         * Dice for rolling, if entity must be generated
         *
         * @type {null}
         * @private
         */
        var _dice;

        /**
         * Constructor
         */
        if(_.isString(linkInfo)){
            _path = linkInfo.split('.');
        } else if(_.isArray(linkInfo)){
            _path = linkInfo[0].split('.');
            _dice = linkInfo[1];
        }

        /**
         * Returns entity by path
         *
         * @param storage {EntitiesStorage}
         */
        this.getEntity = function(storage) {
            var entity = storage.getRootEntity(_path[0]);

            if(_path.length > 1){
                for(var i = 1; i < _path.length; i++){
                    entity = entity.getChildEntityByTag(_path[i]);
                }
            }

            return entity;
        };

        /**
         * Returns custom dice formula (if set)
         * @returns {String|null}
         */
        this.getDice = function() {
            return _dice;
        }
    }

    return StorageLink;
});