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
         * @param vars {{}}
         */
        this.getEntity = function(storage, vars) {
            let entity = storage.getRootEntity(this.handlePathPart(_path[0], vars));

            if(_path.length > 1){
                for(let i = 1; i < _path.length; i++){
                    entity = entity.getChildEntityByTag(this.handlePathPart(_path[i], vars));
                }
            }

            return entity;
        };

        this.handlePathPart = function(pathPart, vars){
            if(pathPart.charAt(0) === '$'){
                if(vars[pathPart] !== undefined){
                    pathPart = vars[pathPart];
                }
            }

            return pathPart;
        };

        /**
         * Returns custom dice formula (if set)
         * @returns {String|null}
         */
        this.getDice = function() {
            let formula = _dice !== null ? _dice : "1";

            let customDice = $("#diceRollerCache").val();

            if (!_.isEmpty(customDice)) {
                formula = _.replace(formula, '$dice', customDice);
            }

            return formula;
        };
    };

    return StorageLink;
});