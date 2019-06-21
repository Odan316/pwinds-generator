define([
    'require',
    'jquery',
    'lodash',
    'components/VariantEntity',
    'components/StorageLink'
], function(require, $, _, VariantEntity, StorageLink){
    /**
     * Base entity class, also serves as root entity class
     *
     * @constructor
     */
    var Entity = function(){
        /**
         * Entity tag, for in search via path
         *
         * @type {String|null}
         * @private
         */
        var _tag = null;

        /**
         * Entity title, for interface
         *
         * @type {String|null}
         * @private
         */
        var _title = null;

        /**
         * Dice formula, for randomizing result from _variants
         * Has default value as d12
         *
         * @type {String|null}
         * @private
         */
        var _dice = "d12";

        /**
         * List of child entities, calculator rolls _dice and finds appropriate child by _min and _max
         *
         * @type {Entity[]|null}
         * @private
         */
        var _variants = null;

        /**
         * Template for generation combined entity
         *
         * @type {Entity[]|null}
         * @private
         */
        var _template = null;

        /**
         * List of additional entities, calculator generates every entity from list. Each element is path to entity in tree.
         *
         * @type {StorageLink[]|null}
         * @private
         */
        var _additional = null;

        /**
         * List of optional entities, similar to 'additional', but shows as separate block.
         *
         * @type StorageLink[]|null}
         * @private
         */
        var _optional = null;

        /**
         * Loads JSON data in Entity object
         *
         * @param data
         * @param data.tag
         * @param data.title
         * @param data.dice
         * @param data.variants
         * @param data.additional
         * @param data.optional
         */
        this.load = function(data) {
            if("tag" in data){
                _tag = data.tag;
            }
            if("title" in data){
                _title = data.title;
            }
            if("dice" in data){
                _dice = data.dice;
            }
            if("variants" in data){
                _variants = [];
                _.forEach(data.variants, function(value){
                    var innerEntity = new VariantEntity();
                    innerEntity.load(value);
                    _variants.push(innerEntity);
                });
            }
            if("additional" in data){
                _additional = [];
                _.forEach(data.additional, function(value){
                    _additional.push(new StorageLink(value));
                });
            }
            if("optional" in data){
                _optional = [];
                _.forEach(data.optional, function(value){
                    _optional.push(new StorageLink(value));
                });
            }
            if("template" in data){
                _template = [];
                _.forEach(data.template, function(value){
                    var innerEntity = new VariantEntity();
                    innerEntity.load(value);
                    _template.push(innerEntity);
                });
            }
        };

        /**
         * Returns entity tag
         *
         * @returns {String|null}
         */
        this.getTag = function() {
            return _tag;
        };

        /**
         * Return entity title of (if it is empty) beautified tag
         *
         * @returns {String|null}
         */
        this.getTitle = function() {
            if (_title !== null) {
                return _title;
            } else {
                return _tag.beautifyTag();
            }
        };

        /**
         * Returns entity dice
         *
         * @returns {String|null}
         */
        this.getDice = function() {
            return _dice;
        };

        /**
         * Transforms entity into simple array with subtree
         *
         * @returns {{text}}
         */
        this.getTreeNode = function() {
            var node = {
                tag: this.getTag(),
                title: this.getTag().beautifyTag()
            };
            var nodes = this.getSubTree();
            if(nodes.length > 0){
                node.nodes = nodes;
            }

            return node;
        };

        /**
         * Transforms _variants entities to simple subtree
         *
         * @returns {Array}
         */
        this.getSubTree = function() {
            var subTree = [];

            _.forEach(_variants, function(entity){
                subTree.push(entity.getTreeNode());
            });

            return subTree;
        };

        /**
         * Return entity by tag
         *
         * @param tag
         * @returns {Entity}
         */
        this.getChildEntityByTag = function(tag) {

            var entity = _.find(_variants, function(o) { return o.getTag() === tag; });

            if(entity !== undefined){
                return entity;
            } else {
                //TODO: надо обрабатывать
                console.log("Entity '"+_tag+"' | No child entity with tag '" + tag + "'");
                return null;
            }
        };

        /**
         * Return entity by roll
         *
         * @param roll
         * @returns {Entity}
         */
        this.getChildEntityByRoll = function(roll) {

            var entity = _.find(_variants, function(o) { return o.getMin() <= roll && o.getMax() >= roll; });

            if(entity !== undefined){
                return entity;
            } else {
                //TODO: надо обрабатывать
                console.log("Entity '"+_tag+"' | No child entity with roll '" + roll + "'");
                return null;
            }
        };

        /**
         * Return true if entity has variants|childs
         * @returns {boolean}
         */
        this.hasVariants = function() {
            return _variants != null && _variants.length > 0;
        };

        /**
         * Return true if entity has additional properties
         * @returns {boolean}
         */
        this.hasAdditional = function() {
            return _additional != null && _additional.length > 0;
        };

        /**
         * Returns array of storage links for additional entities
         * @returns {StorageLink[]|null}
         */
        this.getAdditionalEntitiesLinks = function() {
            return _additional;
        };

        /**
         * Return true if entity has optional properties
         * @returns {boolean}
         */
        this.hasOptional = function() {
            return _optional != null && _optional.length > 0;
        };

        /**
         * Returns array of storage links for optional entities
         * @returns {StorageLink[]|null}
         */
        this.getOptionalEntitiesLinks = function() {
            return _optional;
        };

        /**
         * Returns true if entity has template for combine entities to result
         * @returns {boolean}
         */
        this.hasTemplate = function() {
            return _template != null;
        };

        /**
         * Returns template for combine entities to result
         * @type {Entity[]|null}
         */
        this.getTemplate = function() {
            return _template;
        };
    };

    return Entity;

});