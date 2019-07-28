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
], function ($, _, Dice, EntitiesStorage, Errors, StorageLink, VariantEntity, GeneratedEntity, GeneratedErrorEntity) {
    /**
     * Main object, that contains all data for generation and provides main methods to controller scripts
     *
     * @constructor
     */
    let Generator = function () {
        /**
         * Save context in closure
         * @type {Generator}
         */
        let self = this;

        /**
         * Link on entities tree container
         * @type {EntitiesStorage|null}
         */
        let _storage = null;

        /**
         * Dice instance
         *
         * @type {Dice}
         * @private
         */
        let _dice = new Dice([]);

        /**
         * Errors collection instance
         *
         * @type {Errors}
         * @private
         */
        let _errors = new Errors();

        let _vars = {};

        /**
         * Generates new {GeneratedEntity} by string path
         * @param {String} entityPath Path to entity in tree. Path "obj1.obj2.obj3" will generate obj3
         */
        this.generate = function (entityPath) {
            let entityLink = new StorageLink(entityPath);
            let entity = entityLink.getEntity(self.getStorage(), _vars);

            // Reset generation variables
            _vars = {};

            return generateEntity(entity, entityLink.getDice());
        };

        /**
         * Generate one new {GeneratedEntity} (function to call it recursive)
         * @param entity {Entity|VariantEntity}
         * @param customDice
         */
        let generateEntity = function (entity, customDice) {
            let generatedEntity;

            if (entity == null) {
                // Generate error entity
                generatedEntity = new GeneratedErrorEntity(_errors.ERROR_ENTITY_NOT_FOUND);

                return generatedEntity;
            } else {
                $.extend(_vars, entity.getVars());
            }

            if (entity.isStatic()) {
                // Generate (simply return) static value
                generatedEntity = new GeneratedEntity(entity.getTag(), entity.getTitle());
                generatedEntity.description = entity.getDescription();
                generatedEntity.variant = new GeneratedEntity("static", entity.getStaticValue());

            } else if (entity instanceof VariantEntity && entity.isRollResult()) {
                // Generate (simply return) static value
                generatedEntity = new GeneratedEntity(entity.getTag(), entity.getTitle());
                generatedEntity.description = entity.getDescription();

                let rollResult = _dice.roll(entity.getDiceResultFormula());
                generatedEntity.variant = new GeneratedEntity();
                generatedEntity.roll = rollResult;

            } else if (entity instanceof VariantEntity && entity.hasOuterLink()) {
                generatedEntity = new GeneratedEntity(entity.getTag(), entity.getTitle());
                generatedEntity.description = entity.getDescription();

                // Generate entity by outer link
                let outerEntityLink = entity.getOuterLink();
                let outerEntity = outerEntityLink.getEntity(self.getStorage(), _vars);
                generatedEntity.variant = generateEntity(outerEntity, outerEntityLink.getDice()).variant;

            } else if (entity.hasTemplate()) {
                // Generate entity by template
                let generatedEntityTag = "";
                _.forEach(entity.getTemplate(),
                    /**
                     * @param templatePartEntity {Entity}
                     */
                    function (templatePartEntity) {
                    let generatedEntityPart = generateEntity(templatePartEntity);
                    let partTitle = generatedEntityPart.variant.title;
                    if (generatedEntityPart.variant.variant !== null) {
                        partTitle = generatedEntityPart.variant.variant.title;
                    }

                    // Choose how to add string - as separate word or as part
                    let glue = generatedEntityTag === "" || templatePartEntity.toConcatenate() ? "" : " ";
                    if(templatePartEntity.toConcatenate()){
                        partTitle = _.lowerFirst(partTitle);
                    }

                    generatedEntityTag += (glue + partTitle);
                });

                generatedEntity = new GeneratedEntity(generatedEntityTag, generatedEntityTag.beautifyTag());
                generatedEntity.description = entity.getDescription();

            } else {
                // Generate entity by normal way
                // Create entity object
                generatedEntity = new GeneratedEntity(entity.getTag(), entity.getTitle());
                generatedEntity.description = entity.getDescription();

                // Generate variant
                if (entity.hasVariants()) {
                    if (customDice) {
                        var roll = _dice.roll(customDice);
                    } else {
                        roll = _dice.roll(entity.getDice());
                    }
                    generatedEntity.roll = roll;

                    generatedEntity.variant = generateEntity(entity.getChildEntityByRoll(roll));
                }
            }
            // Generate additional entities
            if (entity.hasAdditional()) {
                generatedEntity.additionalTitle = entity.getAdditionalTitle();
                _.forEach(entity.getAdditionalEntitiesLinks(), function (additionalEntityData) {
                    let additionalEntity = null;
                    let customDice = null;
                    if (additionalEntityData instanceof StorageLink) {
                        additionalEntity = additionalEntityData.getEntity(self.getStorage(), _vars);
                        customDice = additionalEntityData.getDice();
                    } else if (additionalEntityData instanceof VariantEntity) {
                        additionalEntity = additionalEntityData;
                    }

                    if (additionalEntity !== null) {
                        for (let i = 0; i < additionalEntity.getRepeat(); i++) {
                            generatedEntity.additional.push(generateEntity(additionalEntity, customDice));
                        }
                    }
                });
            }

            return generatedEntity;
        };

        /**
         * Creates new EntitiesStorage and call .load to fill it with data
         *
         * @param {Array} data
         */
        this.loadStorage = function (data) {
            _storage = new EntitiesStorage();
            _storage.load(data);
        };

        /**
         * Returns link on inner EntitiesStorage object
         *
         * @returns {EntitiesStorage|null}
         */
        this.getStorage = function () {
            return _storage;
        }
    };

    return Generator;
});