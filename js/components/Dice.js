define([
    'lodash'
], function (_) {
    /**
     * Object that can return random integer via dice formula
     *
     * @constructor
     */
    var Dice = function () {
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
        this.roll = function (diceFormula) {
            // First, test if dice has loaded value
            let result = this.loadedDices.shift();
            // If not, calculate roll
            if (result === undefined) {
                let regexp = /^(\d*)[d]*(\d*)([-+]*)(\d*)([-+]*)(\d*)[x]*(\d*)$/;
                let formulaArray = diceFormula.match(regexp);

                if (formulaArray != null) {
                    // Dice params
                    let diceMultiplier = (formulaArray[1] !== "" ? parseInt(formulaArray[1]) : 1);
                    let dice = (formulaArray[2] !== "" ? parseInt(formulaArray[2]) : null);

                    // Additional result modifiers
                    let addSign1 = (formulaArray[3] !== "" ? formulaArray[3] : '+');
                    let addNumber1 = (formulaArray[4] !== "" ? parseInt(formulaArray[4]) : 0);
                    if(addSign1 === "-"){
                        addNumber1 = addNumber1*-1
                    }
                    let addSign2 = (formulaArray[5] !== "" ? formulaArray[5] : '+');
                    let addNumber2 = (formulaArray[6] !== "" ? parseInt(formulaArray[6]) : 0);
                    if(addSign2 === "-"){
                        addNumber2 = addNumber2*-1
                    }

                    // Final result multiplier
                    let resultMultiplier = (formulaArray[7] !== "" ? formulaArray[7] : 1);

                    // Roll the dice
                    let rollResult = dice !== null ? randomInteger(1, dice) : 1;

                    // Apply all modifiers
                    result = (diceMultiplier * rollResult + addNumber1 + addNumber2) * resultMultiplier;
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