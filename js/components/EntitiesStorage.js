define([
    'jquery',
    'lodash',
    'components/Entity'
], function($, _, Entity){

    /**
     * Object, that contains tree of entities and gives main functions
     *
     * @constructor
     */
    var EntitiesStorage = function() {
        /**
         * List of root entities
         *
         * @type {Entity[]|null}
         * @private
         */
        var _rootEntities = null;

        this.load = function(data) {
            _rootEntities = [];
            _.forEach(data, function(value){
                var rootEntity = new Entity();
                rootEntity.load(value);
                _rootEntities.push(rootEntity);
            });
        };

        /**
         * Returns simplified tree of entities
         *
         * @returns {Array}
         */
        this.getTree = function() {
            let tree = [];

            _.forEach(_rootEntities, function(entity){
                tree.push(entity.getTreeNode());
            });

            return tree;
        };

        /**
         * Return entity by tag
         *
         * @param tag
         * @returns {Entity}
         */
        this.getRootEntity = function(tag) {

            let entity = _.find(_rootEntities, function(o) { return o.getTag() === tag; });

            if(entity !== undefined){
                return entity;
            } else {
                //TODO: надо обрабатывать
                console.log("EntitiesStorage | No root entity with tag '" + tag + "'");
                return null;
            }
        }
    };

    return EntitiesStorage;
});
