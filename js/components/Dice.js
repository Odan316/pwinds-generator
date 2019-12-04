define([
    'lodash'
], function (_) {
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
            // If not, calculate roll
            if (result === undefined) {
                let regexp = /^(\d*)[x]*(\d*)[d]*(\d*)([-+]*)(\d*)([-+]*)(\d*)[x]*(\d*)$/;
                let formulaArray = diceFormula.match(regexp);

                if (formulaArray != null) {
                    // Dice params
                    let diceMultiplierSecondary = (formulaArray[1] !== "" ? parseInt(formulaArray[1]) : 1);
                    let diceMultiplierMain = (formulaArray[2] !== "" ? parseInt(formulaArray[2]) : 1);
                    let dice = (formulaArray[3] !== "" ? parseInt(formulaArray[3]) : null);

                    // Additional result modifiers
                    let addSign1 = (formulaArray[4] !== "" ? formulaArray[4] : '+');
                    let addNumber1 = (formulaArray[5] !== "" ? parseInt(formulaArray[5]) : 0);
                    if(addSign1 === "-"){
                        addNumber1 = addNumber1*-1;
                    }
                    let addSign2 = (formulaArray[6] !== "" ? formulaArray[6] : '+');
                    let addNumber2 = (formulaArray[7] !== "" ? parseInt(formulaArray[7]) : 0);
                    if(addSign2 === "-"){
                        addNumber2 = addNumber2*-1;
                    }

                    // Final result multiplier
                    let resultMultiplier = (formulaArray[8] !== "" ? formulaArray[8] : 1);

                    // Roll the dice

                    let rollResult = 0;
                    let diceMultiplier = diceMultiplierSecondary*diceMultiplierMain;
                    for(let i = 0; i < diceMultiplier; i++){
                        rollResult += (dice !== null ? randomInteger(1, dice) : 1);
                    }

                    // Apply all modifiers
                    result = (rollResult + addNumber1 + addNumber2) * resultMultiplier;
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
        let randomInteger = function (min, max) {
            let rand = min - 0.5 + Math.random() * (max - min + 1);
            rand = Math.round(rand);
            return rand;
        };
    };

    return Dice;
});