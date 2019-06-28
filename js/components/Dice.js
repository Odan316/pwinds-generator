define([
    'lodash'
], function(_){
    /**
     * Object that can return random integer via dice formula
     *
     * @constructor
     */
    var Dice = function() {
        /**
         * Property for debugging - you can set consequence of rolls
         *
         * @type {number[]}
         */
        this.loadedDices = [];

        /**
         * Returns random integer via dice formula
         *
         * @param {String} diceFormula with template {x}d{y}+{z} or {x}d{y}-{z}, where 'x' and 'z' are alimentary
         * @returns {number}
         */
        this.roll = function(diceFormula) {
            var result = this.loadedDices.shift();
            if (result === undefined){
                if(_.isNumber(diceFormula) || _.isEqual(diceFormula, _.toNumber(diceFormula))){
                    return _.toNumber(diceFormula);
                }
                var regexp = /^(\d*)d(\d+)[-+]*(\d*)[-+]*(\d*)$/;
                var formulaArray = diceFormula.match(regexp);

                if(formulaArray != null) {
                    var multiplier = (formulaArray[1] !== "" ? formulaArray[1] : 1);
                    var addition = (formulaArray[3] !== "" ? formulaArray[3] : 0);
                    var addition2 = (formulaArray[4] !== "" ? formulaArray[4] : 0);
                    var roll = randomInteger(1, parseInt(formulaArray[2]));

                    result = parseInt(multiplier)*roll + parseInt(addition) + parseInt(addition2);
                }

            }
            return result;
        };

        /**
         * Returns random integer in range from min to max
         *
         * @param {number} min
         * @param {number} max
         * @returns {number}
         */
        var randomInteger = function (min, max) {
            var rand = min - 0.5 + Math.random() * (max - min + 1);
            rand = Math.round(rand);
            return rand;
        };
    };

    return Dice;
});