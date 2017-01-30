define([
    'jquery',
    'lodash',
    'components/Dice',
    'components/EntitiesStorage',
    'components/Errors',
    'components/StorageLink',
    'components/VariantEntity',
    'components/GeneratedEntity',
    'components/GeneratedErrorEntity'
], function($, _, Dice, EntitiesStorage, Errors, StorageLink, VariantEntity, GeneratedEntity, GeneratedErrorEntity) {
    /**
     * Main object, that contains all data for generation and provides main methods to controller scripts
     *
     * @constructor
     */
    var Generator = function() {
        /**
         * Save context in closure
         * @type {Generator}
         */
        var self = this;

        /**
         * Link on entities tree container
         * @type {EntitiesStorage|null}
         */
        var _storage = null;

        /**
         * Dice instance
         *
         * @type {Dice}
         * @private
         */
        var _dice = new Dice();

        /**
         * Errors collection instance
         *
         * @type {Errors}
         * @private
         */
        var _errors = new Errors();

        /**
         * Generates new {GeneratedEntity} by string path
         * @param {String} entityPath Path to entity in tree. Path "obj1.obj2.obj3" will generate obj3
         */
        this.generate = function (entityPath) {
            var entityLink = new StorageLink(entityPath);
            var entity = entityLink.getEntity(self.getStorage());

            return generateEntity(entity, entityLink.getDice());
        };

        /**
         * Generate one new {GeneratedEntity} (function to call it recursive)
         * @param entity {Entity|VariantEntity}
         * @param customDice
         */
        var generateEntity = function(entity, customDice) {
            var generatedEntity;

            if(entity == null){
                // Generate error entity
                generatedEntity = new GeneratedErrorEntity(_errors.ERROR_ENTITY_NOT_FOUND);

            } else if(entity instanceof VariantEntity && entity.hasOuterLink()){
                // Generate entity by outer link
                var outerEntityLink = entity.getOuterLink();
                var outerEntity = outerEntityLink.getEntity(self.getStorage());
                generatedEntity = generateEntity(outerEntity, outerEntityLink.getDice());

            } else {
                // Generate entity by normal way
                // Create entity object
                generatedEntity = new GeneratedEntity(entity.getTag(), entity.getTitle());

                // Generate variant
                if(entity.hasVariants()){
                    if(customDice){
                        var roll = _dice.roll(customDice);
                    } else {
                        roll = _dice.roll(entity.getDice());
                    }
                    generatedEntity.roll = roll;

                    generatedEntity.variant = generateEntity(entity.getChildEntityByRoll(roll));
                }

                // Generate additional entities
                if(entity.hasAdditional()){
                    _.forEach(entity.getAdditionalEntitiesLinks(), function(additionalEntityLink) {
                        var additionalEntity = additionalEntityLink.getEntity(self.getStorage());
                        generatedEntity.additional.push(generateEntity(additionalEntity, additionalEntityLink.getDice()));
                    });
                }

                // Generate optional entities
                if(entity.hasOptional()){
                    _.forEach(entity.getOptionalEntitiesLinks(), function(additionalEntityLink) {
                        var additionalEntity = additionalEntityLink.getEntity(self.getStorage());
                        generatedEntity.optional.push(generateEntity(additionalEntity, additionalEntityLink.getDice()));
                    });
                }

                // Generate numbers property
                if(entity instanceof VariantEntity && entity.hasNumbers()){
                    generatedEntity.numbers = _dice.roll(entity.getNumbers())
                }
            }

            return generatedEntity;
        };

        /**
         * Creates new EntitiesStorage and call .load to fill it with data
         *
         * @param {Array} data
         */
        this.loadStorage = function(data) {
            _storage = new EntitiesStorage();
            _storage.load(data);
        };

        /**
         * Returns link on inner EntitiesStorage object
         *
         * @returns {EntitiesStorage|null}
         */
        this.getStorage = function() {
            return _storage;
        }
    };

    return Generator;
});