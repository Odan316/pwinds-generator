$(function () {
    var dice = new Dice();
    var outputDiv = $(".output");

    $.get("data/obj.json", function (data) {
        var generator = new Generator();
        var treeHelper = new TreeViewHelper();
        var printer = new SimplePrinter();

        generator.loadStorage(data);

        var entitiesTree = $('#entitiesTree');
        entitiesTree.treeview({data: treeHelper.prepareTree(generator.getStorage().getTree())});
        entitiesTree.treeview('collapseAll', { silent: true });

        $(document).on("click", ".generate-start", function () {
            var objectToGenerate = $(this).data('obj');
            var generatedEntity = generator.generate(objectToGenerate);
            console.log(generatedEntity);

            outputDiv.prepend(printer.printEntity(generatedEntity));
        });
    });

    $(".output-clear").on("click", function () {
        outputDiv.html("");
    });

    $(".roll-dice").on("click", function () {
        var $formulaInput = $('#diceRoller');
        var formula = $formulaInput.val();
        if(_.isEmpty(formula)){
            formula = "3d6";
            $formulaInput.val(formula);
        }
        var result = dice.roll(formula);
        outputDiv.prepend("<div class='generatedOutput'><h3 class='entityTitle'>Custom roll (" + formula + ")</h3><p class=\"customRollResult\">"+result+"</p></div>");
    });


});

/**
 * Main object, that contains all data for generation and provides main methods to controller scripts
 *
 * @constructor
 */
function Generator() {
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
}

/**
 * Object, that contains raw generated data
 *
 * @constructor
 * @param tag
 * @param title
 */
function GeneratedEntity(tag, title) {
    this.tag = tag;
    this.title = title;
    this.roll = null;

    this.variant = null;

    this.additional = [];
    this.optional = [];

    this.numbers = null;
}

/**
 * Object, that contains error rather than normal generated entity
 * @constructor
 */
function GeneratedErrorEntity(errorType) {
    this.type = errorType;
}

/**
 * Object, that contains error codes
 * @constructor
 */
function Errors() {
    this.ERROR_ENTITY_NOT_FOUND = 1;

    var _errorTitles = {
        1: "Requested entity is not found"
    };

    this.getErrorText = function(errorType) {
        return _errorTitles[errorType];
    };
}

/**
 * Object, that contains tree of entities and gives main functions
 *
 * @constructor
 */
function EntitiesStorage() {
    /**
     * List of root entities
     *
     * @type {Entity[]|null}
     * @private
     */
    var _rootEntities = null;

    this.load = function(data) {
        _rootEntities = [];
        _.forEach(data, function(value){
            var rootEntity = new Entity();
            rootEntity.load(value);
            _rootEntities.push(rootEntity);
        });
    };

    /**
     * Returns simplified tree of entities
     * @returns {Array}
     */
    this.getTree = function() {
        var tree = [];

        _.forEach(_rootEntities, function(entity){
            tree.push(entity.getTreeNode());
        });

        return tree;
    };

    /**
     * Return entity by tag
     *
     * @param tag
     * @returns {Entity}
     */
    this.getRootEntity = function(tag) {

        var entity = _.find(_rootEntities, function(o) { return o.getTag() == tag; });

        if(entity != undefined){
            return entity;
        } else {
            //TODO: надо обрабатывать
            console.log("EntitiesStorage | No root entity with tag '" + tag + "'");
            return null;
        }
    }
}

/**
 * Base entity class, also serves as root entity class
 *
 * @constructor
 */
function Entity(){
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

        var entity = _.find(_variants, function(o) { return o.getTag() == tag; });

        if(entity != undefined){
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

        if(entity != undefined){
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
    }
}

/**
 * Class of child entity, that lies in entities tree (always in variants array)
 *
 * @constructor
 */
function VariantEntity() {
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
    };
}

/**
 * Link on entity in storage entities tree
 *
 * @param {String|Array} linkInfo
 * @constructor
 */
function StorageLink(linkInfo) {
    /**
     * Path to entity
     *
     * @type {Array|null}
     * @private
     */
    var _path = null;

    /**
     * Dice for rolling, if entity must be generated
     *
     * @type {null}
     * @private
     */
    var _dice;

    /**
     * Constructor
     */
    if(_.isString(linkInfo)){
        _path = linkInfo.split('.');
    } else if(_.isArray(linkInfo)){
        _path = linkInfo[0].split('.');
        _dice = linkInfo[1];
    }

    /**
     * Returns entity by path
     *
     * @param storage {EntitiesStorage}
     */
    this.getEntity = function(storage) {
        var entity = storage.getRootEntity(_path[0]);

        if(_path.length > 1){
            for(var i = 1; i < _path.length; i++){
                entity = entity.getChildEntityByTag(_path[i]);
            }
        }

        return entity;
    };

    /**
     * Returns custom dice formula (if set)
     * @returns {String|null}
     */
    this.getDice = function() {
        return _dice;
    }
}

/**
 * Object that can return random integer via dice formula
 *
 * @constructor
 */
function Dice() {
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
        if (result == undefined){
            var regexp = /^(\d*)d(\d+)[-+]*(\d*)$/;
            var formulaArray = diceFormula.match(regexp);

            if(formulaArray != null) {
                var multiplier = (formulaArray[1] != "" ? formulaArray[1] : 1);
                var addition = (formulaArray[3] != "" ? formulaArray[3] : 0);
                var roll = randomInteger(1, parseInt(formulaArray[2]));

                result = parseInt(multiplier)*roll + parseInt(addition);
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
}

/**
 * Helper, that transforms simple entities tree in treeView compatible data config
 * @constructor
 */
function TreeViewHelper() {
    var self = this;

    this.prepareTree = function(tree, parentPath) {
        var parsedTree = [];
        _.forEach(tree, function(node){
            var nodePath = parentPath != undefined ? parentPath + '.' + node.tag : node.tag;
            var parsedNode = {
                text: "<button class='btn btn-xs btn-warning generate-start' data-obj='"+nodePath+"'>"+node.title+"</button>"
            };
            var nodes = self.prepareTree(node.nodes, nodePath);
            if(nodes.length > 0){
                parsedNode.nodes = nodes;
            }
            parsedTree.push(parsedNode);
        });
        return parsedTree;
    }
}

/**
 * Class for printing generated entities
 *
 * @constructor
 */
function SimplePrinter() {

    /**
     * Errors collection instance
     *
     * @type {Errors}
     * @private
     */
    var _errors = new Errors();

    /**
     * Prints generated Entity tree
     *
     * @param {GeneratedEntity} generatedEntity
     * @returns {*|jQuery|HTMLElement}
     */
    this.printEntity = function(generatedEntity) {
        var $output = $("<div class=\"generatedOutput\">");

        var $entityTitle = $("<h3 class=\"entityTitle\">").text(generatedEntity.title);
        $output.append($entityTitle);

        $output.append(printEntityProperties(generatedEntity));

        return $output;
    };

    /**
     * Prints generated entity's properties (for calling recursive)
     * @param {GeneratedEntity} generatedEntity
     * @returns {*|jQuery|HTMLElement}
     */
    var printEntityProperties = function(generatedEntity, propertyEntity){
        var $entityPropertiesOutput = $("<div class=\"entityProperties\">");

        if(generatedEntity instanceof GeneratedErrorEntity){
            var $errorTitle = $("<h4 class=\"errorTitle\">").text(_errors.getErrorText(generatedEntity.type));
            $entityPropertiesOutput.append($errorTitle);
        } else {

            if(generatedEntity.variant != null){
                var $entityTitle = $("<h4 class=\"variantTitle\">");
                if(propertyEntity){
                    $entityTitle.append($("<span class=\"type\">").text("" + generatedEntity.title + ": "));
                }
                $entityTitle.append($("<span class=\"roll\">").text("(" + generatedEntity.roll + ") "));
                $entityTitle.append($("<span class=\"title\">").text(generatedEntity.variant.title));
                $entityPropertiesOutput.append($entityTitle);

                $entityPropertiesOutput.append(printEntityProperties(generatedEntity.variant));
            }


            if(generatedEntity.additional.length > 0){
                var $subTitle = $("<h5 class=\"propertiesTitle\">").text("Additional:");
                $entityPropertiesOutput.append($subTitle);
                var $subProperties = $("<div class=\"entitySubProperties\">");
                _.forEach(generatedEntity.additional, function(propertyEntity){
                    $subProperties.append(printEntityProperties(propertyEntity, true));
                });
                $entityPropertiesOutput.append($subProperties);
            }

            if(generatedEntity.optional.length > 0){
                $subTitle = $("<h5 class=\"propertiesTitle\">").text("Optional:");
                $entityPropertiesOutput.append($subTitle);
                $subProperties = $("<div class=\"entitySubProperties\">");
                _.forEach(generatedEntity.optional, function(propertyEntity){
                    $subProperties.append(printEntityProperties(propertyEntity, true));
                });
                $entityPropertiesOutput.append($subProperties);
            }

            if(generatedEntity.numbers != null){
                $subTitle = $("<h5 class=\"propertiesTitle\">").text("Numbers: " + generatedEntity.numbers);
                $entityPropertiesOutput.append($subTitle);
            }
        }

        return $entityPropertiesOutput;
    };
}

String.prototype.capitalizeFirstLetter = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.beautifyTag = function () {
    return this.capitalizeFirstLetter().replace(/_/g, " ");
};
