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
     * @extends Entity
     * @inheritDoc Entity
     */
    let VariantEntity = function() {
        let Entity = require('components/Entity');
        Entity.call(this);

        /**
         * Minimal dice value, when finding randomized result in _variants
         *
         * @type {int|null}
         * @private
         */
        let _min = null;

        /**
         * Maximal dice value, when finding randomized result in _variants
         * @type {int|null}
         * @private
         */
        let _max = null;

        /**
         * Link on other entity for generating instead of child entity
         *
         * @type {StorageLink|null}
         * @private
         */
        let _generate_outer = null;

        /**
         * Dice formula that calculates in-game number as value
         *
         * @type {String|null}
         * @private
         */
        let _roll_result = null;

        let parentLoad = this.load;

        this.getMin = function() {
            return _min;
        };

        this.getMax = function() {
            return _max;
        };

        this.hasOuterLink = function() {
            return _generate_outer != null;
        };

        this.getOuterLink = function() {
            return _generate_outer;
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
            if("generate_outer" in data) {
                _generate_outer = new StorageLink(data.generate_outer);
            }
            if("roll_result" in data) {
                _roll_result = data.roll_result;
            }
        };
    };

    return VariantEntity;
});