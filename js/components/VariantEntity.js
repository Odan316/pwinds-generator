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
         * Dice formula that calculates in-game number of entities.
         * DEPRECATED, use "roll_result" instead
         *
         * @type {String[]|null}
         * @private
         * @deprecated
         */
        var _numbers = null;

        /**
         * Static value, entity simply returns it
         *
         * @type {String|null}
         * @private
         */
        var _static = null;

        /**
         * Dice formula that calculates in-game number as value
         *
         * @type {String|null}
         * @private
         */
        var _roll_result = null;

        var parentLoad = this.load;

        this.getMin = function() {
            return _min;
        };

        this.getMax = function() {
            return _max;
        };

        /**
         * @deprecated
         * @returns {boolean}
         */
        this.hasNumbers = function() {
            return _numbers != null;
        };

        /**
         * @deprecated
         * @returns {String[]}
         */
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

        this.isRollResult = function(){
            return _roll_result != null;
        };

        /**
         * Returns dice formula for number generating
         *
         * @returns {String}
         */
        this.getDiceResultFormula = function(){
            return _roll_result;
        };

        /**
         * @inherit
         *
         * @param data
         * @param data.min
         * @param data.max
         * @param data.additional
         * @param data.optional
         * @param data.generate_outer
         * @param data.static
         * @param data.roll_result
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
            if("roll_result" in data) {
                _roll_result = data.roll_result;
            }
        };
    };

    return VariantEntity;
});