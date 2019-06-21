define([
    'require',
    'jquery',
    'lodash',
    'components/Entity',
    'components/StorageLink'
], function(require, $, _, Entity, StorageLink){
    /**
     * Class of child entity, that lies in entities tree (always in variants array)
     *
     * @constructor
     */
    var VariantEntity = function() {
        var Entity = require('components/Entity');
        Entity.call(this);

        /**
         * Minimal dice value, when finding randomized result in _variants
         *
         * @type {int|null}
         * @private
         */
        var _min = null;

        /**
         * Maximal dice value, when finding randomized result in _variants
         * @type {int|null}
         * @private
         */
        var _max = null;

        /**
         * Link on other entity for generating instead of child entity
         *
         * @type {StorageLink|null}
         * @private
         */
        var _generate_outer = null;

        /**
         * Dice formula that calculates in-game number of entities
         *
         * @type {String[]|null}
         * @private
         */
        var _numbers = null;

        /**
         * Static value, entity simply returns it
         *
         * @type {String|null}
         * @private
         */
        var _static = null;

        var parentLoad = this.load;

        this.getMin = function() {
            return _min;
        };

        this.getMax = function() {
            return _max;
        };

        this.hasNumbers = function() {
            return _numbers != null;
        };

        this.getNumbers = function() {
            return _numbers;
        };

        this.hasOuterLink = function() {
            return _generate_outer != null;
        };

        this.getOuterLink = function() {
            return _generate_outer;
        };

        this.isStatic = function(){
            return _static != null;
        };

        this.getStaticValue = function(){
          return _static;
        };

        /**
         * @inherit
         *
         * @param data
         * @param data.min
         * @param data.max
         * @param data.additional
         * @param data.optional
         * @param data.numbers
         * @param data.generate_outer
         * @param data.static
         */
        this.load = function(data) {
            parentLoad.call(this, data);

            if("min" in data){
                _min = data.min;
            }
            if("max" in data){
                _max = data.max;
            }
            if("numbers" in data){
                _numbers = data.numbers;
            }
            if("generate_outer" in data) {
                _generate_outer = new StorageLink(data.generate_outer);
            }
            if("static" in data) {
                _static = data.static;
            }
        };
    };

    return VariantEntity;
});