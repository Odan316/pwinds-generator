define([
    'lodash'
], function (_) {

    "use strict";

    /**
     * Object that can return random integer via dice formula
     *
     * @constructor
     */
    let Dice = function (loadedDices) {
        /**
         * Property for debugging - you can set consequence of rolls
         *
         * @type {number[]}
         */
        this.loadedDices = loadedDices !== undefined ? loadedDices : [];

        /**
         * Returns random integer via dice formula
         *
         * @param {String} diceFormula with template {x}d{y}+{z} or {x}d{y}-{z}, where 'x' and 'z' are alimentary
         * @returns {number}
         */
        this.roll = function (diceFormula) {
            // First, test if dice has loaded value
            let result = this.loadedDices.shift();
            if (result !== undefined) {
                return result;
            }

            // If not, calculate roll
            return rollFormula(diceFormula);
        };

        /**
         * @param {String} fullFormula
         * @returns {number}
         */
        let rollFormula = function (fullFormula) {
            let regexpForSplit = /[-+/*]/g;
            let parts = fullFormula.split(regexpForSplit);

            for (let i = 0; i < parts.length; i++) {
                let diceFormula = parts[i];
                let rollResult = rollDice(diceFormula);

                fullFormula = _.replace(fullFormula, diceFormula, rollResult);
            }

            return new Function('return ' + fullFormula)();
        };

        /**
         * @param {String} diceFormula
         * @returns {number}
         */
        let rollDice = function (diceFormula) {
            let regexpForMultiply = /(\d*)[d](\d*)/;
            let diceArray = diceFormula.match(regexpForMultiply);

            if (diceArray === null) {
                return parseInt(diceFormula);
            }

            let diceAmount = (diceArray[1] !== "" ? parseInt(diceArray[1]) : 1);
            let dice = (diceArray[2] !== "" ? parseInt(diceArray[2]) : null);

            let rollResult = 0;
            for (let j = 0; j < diceAmount; j++) {
                rollResult += (dice !== null ? randomInteger(1, dice) : 1);
            }

            return rollResult;
        };

        /**
         * Returns random integer in range from min to max
         *
         * @param {number} min
         * @param {number} max
         * @returns {number}
         */
        let randomInteger = function (min, max) {
            let rand = min - 0.5 + Math.random() * (max - min + 1);
            rand = Math.round(rand);
            return rand;
        };

    };

    return Dice;
});