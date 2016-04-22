$(function () {
    var generator = new Generator();
    var entitiesStorage = new EntitiesStorage();

    $.get("data/obj.json", function (data) {
        generator.objects = data;
        entitiesStorage.load(data);
        var treeHelper = new TreeViewHelper();
        //console.log(entitiesStorage.getTree());

        var entitiesTree = $('#entitiesTree');
        entitiesTree.treeview({data: treeHelper.prepareTree(entitiesStorage.getTree())});
        entitiesTree.treeview('collapseAll', { silent: true });
    });

    $(document).on("click", ".generate-start", function () {
        var obj = $(this).data('obj');
        var generated = generator.generate(obj);
        $(".output").prepend(generated);
    });

    $("#clear").on("click", function () {
        $(".output").html("");
    });

    $(".roll-dice").on("click", function () {
        var dice = $('#diceRoller').val();
        var result = generator.roll(dice);
        $(this).parents('#home').find(".output").prepend("<div class='generatedOutput'><span class='startingElement'>Custom roll: </span>"+result+"</div>");
    });


});

function Generator() {
    this.objects = [];
    this.output = undefined;
    this.dices = [];
    this.generate = function (objectName) {
        //his.dices = [3, 5, 4];
        var generatedElement = new GeneratedElement(this.getTitle(this.findObject(objectName)));

        generatedElement.innerElement = this.generatePart(objectName);

        this.output = generatedElement;

        console.log(this.output);

        var result = this.formatOutput();

        this.output = undefined;

        return result;
    };
    this.generatePart = function (objectsPath, tag) {
        try {
            var dice = "d12";
            if ( Object.prototype.toString.call( objectsPath ) === '[object Array]' ) {
                dice = objectsPath[1];
                objectsPath = objectsPath[0];
            }

            var objects = this.findObjects(objectsPath);
            if(objects.length == 0){
                return new GeneratedElement("<span class=\"text-danger\">Нет данных для окончания генерации</span>");
            }
            var roll = this.roll(dice);
            for (var i = 0; i < objects.length; i++) {
                var object = objects[i];
                if (object.min <= roll && object.max >= roll) {
                    return this.handleObject(object, objectsPath, tag, roll);
                }
            }
        } catch (err) {
            console.log(err);
            return new GeneratedElement("<span class=\"text-danger\">Here is error</span>");
        }
    };
    this.handleObject = function(object, objectsPath, tag, roll) {
        if(!object){
            return new GeneratedElement("<span class=\"text-danger\">Нет данных для окончания генерации</span>");
        }

        var newElement = new GeneratedElement(this.getTitle(object), tag, roll);

        if (object.variants) {
            if(objectsPath != ""){
                var realPath = objectsPath + "." + object.tag;
            } else {
                realPath = object.tag;
            }
            newElement.innerElement = this.generatePart(realPath, object.tag)
        } else if (object.generate_outer) {
            var innerObject = this.findObject(object.generate_outer);
            var workingPathArr = object.generate_outer.split(".");
            workingPathArr.pop();
            if(workingPathArr.length > 0){
                var workingPath = workingPathArr.join(".");
            } else {
                workingPath = "";
            }
            newElement.innerElement = this.handleObject(innerObject, workingPath);
        }

        if (object.additional) {
            for (var j = 0; j < object.additional.length; j++) {
                if (object.additional[j] !== undefined) {
                    if (Object.prototype.toString.call( object.additional[j] ) === '[object Array]') {
                        var str = object.additional[j][0];
                    } else {
                        str = object.additional[j];
                    }
                    var arr = str.split(".");
                    newElement.additionalProperties.push(this.generatePart(object.additional[j], arr[arr.length-1]));
                }
            }
        }

        return newElement;
    };
    this.formatOutput = function () {
        var result = $("<div class=\"generatedOutput\">");
        var row = $("<div class=\"startingElement\">");
        row.append($("<span>").text(this.output.title));
        row.appendTo(result);

        if (this.output.innerElement !== undefined) {
            row = this.formatOutputPart(this.output.innerElement);
            row.appendTo(result);
        }

        return result;
    };
    this.formatOutputPart = function (element) {
        var outputPart = $("<div class=\"innerElement\">");
        if (element.tag !== undefined) {
            outputPart.append($("<span>").text(element.tag + ": "));
        }
        if (element.roll !== undefined) {
            outputPart.append($("<span>").text(element.roll + " - "));
        }
        outputPart.append($("<span class=\"title\">").html(element.title));
        if (element.innerElement !== undefined) {
            row = this.formatOutputPart(element.innerElement);
            row.appendTo(outputPart);
        }
        if (element.additionalProperties.length > 0) {
            outputPart.append($("<p>Дополнительные свойства</p>"));
            for (var i = 0; i < element.additionalProperties.length; i++) {
                if (element.additionalProperties[i] !== undefined) {
                    var row = this.formatOutputPart(element.additionalProperties[i]);
                    row.appendTo(outputPart);
                }
            }
        }
        return outputPart;
    };
    this.getTitle = function (object) {
        var title = "";
        if (object.title !== undefined) {
            title = object.title;
        } else {
            title = object.tag.beautifyTag();
        }

        if (object.descr !== undefined) {
            title = title + " " + object.descr;
        }

        return title;

    };
    this.findObject = function (path) {
        var pathArr = path.split(".");
        var object;
        var objects = this.objects;
        for (var i = 0; i < pathArr.length; i++) {
            var tag = pathArr[i];
            var found = false;
            for (var j = 0; j < objects.length; j++) {
                if (objects[j].tag == tag) {
                    found = true;
                    object = objects[j];
                    if (object.variants)
                        objects = object.variants;
                    else if (object.details)
                        objects = object.details;
                    break;
                }
            }
            if (!found) {
                console.log("Can't found obj with path '" + path + "' on step '" + tag + "'");
                object = null;
                break;
            }
        }
        return object;
    };
    this.findObjects = function (path) {
        var object = this.findObject(path);
        if(object == null){
            return [];
        } else {
            if (object.variants)
                return object.variants;
            else if (object.details)
                return object.details;
        }
    };
    this.roll = function (dice) {
        var result = this.dices.shift();
        if (result == undefined){
            var regexp = /^(\d*)d(\d+)[-+]*(\d*)$/;
            var found = dice.match(regexp);

            if(found != null) {
                var multiplier = (found[1] != "" ? found[1] : 1);
                var addition = (found[3] != "" ? found[3] : 0);
                var roll = this.randomInteger(1, parseInt(found[2]));

                result = parseInt(multiplier)*roll + parseInt(addition);
            }

        }
        return result;
    };
    this.randomInteger = function (min, max) {
        var rand = min - 0.5 + Math.random() * (max - min + 1);
        rand = Math.round(rand);
        return rand;
    };

    this.getEntitiesTree = function() {
        var tree = [
            {
                text: "<button class='btn btn-xs btn-warning generate-start' data-obj='discovery'>Discovery</button>",
                nodes: [
                    {
                        text: "Child 1",
                        nodes: [
                            {
                                text: "Grandchild 1"
                            },
                            {
                                text: "Grandchild 2"
                            }
                        ]
                    },
                    {
                        text: "Child 2"
                    }
                ]
            },
            {
                text: "<button class='btn btn-xs btn-warning generate-start' data-obj='creature'>Creature</button>"
            },
            {
                text: "<button class='btn btn-xs btn-warning generate-start' data-obj='danger'>Danger</button>"
            },
            {
                text: "<button class='btn btn-xs btn-warning generate-start' data-obj='dungeons_content'>Dungeons content</button>"
            }
        ];

        return tree;
    };
}

function GeneratedElement(title, tag, roll) {
    this.tag = tag;
    this.title = title;
    this.roll = roll;
    this.innerElement = undefined;
    this.additionalProperties = [];
}

/**
 * Object, that contains tree of entities and gives main functions
 * @constructor
 */
function EntitiesStorage() {
    var self = this;

    /**
     *
     * List of root entities
     *
     * @type {Entity[]|null}
     * @private
     */
    var _rootEntities = null;

    this.load = function(data) {
        self._rootEntities = [];
        _.forEach(data, function(value){
            var rootEntity = new Entity();
            rootEntity.load(value);
            self._rootEntities.push(rootEntity);
        });
    };

    /**
     * Returns tree of entities
     * @returns {Array}
     */
    this.getTree = function() {
        var tree = [];

        _.forEach(self._rootEntities, function(entity){
            tree.push(entity.getTreeNode());
        });

        return tree;
    };
}

/**
 * Base entity class, also serves as root entity class
 *
 * @constructor
 */
function Entity(){
    var self = this;

    /**
     * Entity tag, for in search via path
     *
     * @type {String|null}
     * @private
     */
    this._tag = null;

    /**
     * Entity title, for interface
     *
     * @type {String|null}
     * @private
     */
    this._title = null;

    /**
     * Dice formula, for randomizing result from _variants
     * Has default value as d12
     *
     * @type {String|null}
     * @private
     */
    this._dice = "d12";

    /**
     * List of child entities, calculator rolls _dice and finds appropriate child by _min and _max
     *
     * @type {Entity[]|null}
     * @private
     */
    this._variants = null;

    this.load = function(data) {
        if("tag" in data){
            self._tag = data.tag;
        }
        if("title" in data){
            self._title = data.title;
        }
        if("dice" in data){
            self._dice = data.dice;
        }
        if("variants" in data){
            self._variants = [];
            _.forEach(data.variants, function(value){
                var innerEntity = new VariantEntity();
                innerEntity.load(value);
                self._variants.push(innerEntity);
            });
        }
    };

    /**
     * Returns entity tag
     *
     * @returns {String|null|*}
     */
    this.getTag = function() {
        return this._tag
    };

    /**
     * Return entity title of (if it is empty) beautified tag
     *
     * @returns {Array}
     */
    this.getTitle = function() {
        if (this._title !== null) {
            return this._title;
        } else {
            return this._tag.beautifyTag();
        }
    };

    /**
     * Transforms _variants entities to simple subtree
     *
     * @returns {Array}
     */
    this.getSubTree = function() {
        var subTree = [];

        _.forEach(self._variants, function(entity){
            subTree.push(entity.getTreeNode());
        });

        return subTree;
    };

    /**
     * Transforms entity into simple array with subtree
     *
     * @returns {{text}}
     */
    this.getTreeNode = function() {
        var node = {
            tag: self.getTag(),
            title: self.getTag().beautifyTag()
        };
        var nodes = self.getSubTree();
        if(nodes.length > 0){
            node.nodes = nodes;
        }

        return node;
    }
}

/**
 * Class of child entity, that lies in entities tree (always in variants array)
 *
 * @constructor
 */
function VariantEntity() {
    Entity.call(this);
    var self = this;

    /**
     * Minimal dice value, when finding randomized result in _variants
     *
     * @type {int|null}
     * @private
     */
    this._min = null;

    /**
     * Maximal dice value, when finding randomized result in _variants
     * @type {int|null}
     * @private
     */
    this._max = null;

    /**
     * List of
     * @type {null}
     * @private
     */
    this._details = null;

    /**
     * List of additional entities, calculator generates every entity from list. Each element is path to entity in tree.
     *
     * @type {StorageLink[]|null}
     * @private
     */
    this._additional = null;

    /**
     * List of additional entities, calculator generates every entity from list. Each element is path to entity in tree.
     *
     * @type StorageLink[]|null}
     * @private
     */
    this._optional = null;

    /**
     * Link on other entity for generating instead of child entity
     *
     * @type {StorageLink|null}
     * @private
     */
    this._generate_outer = null;

    /**
     * Dice formula for simply add random number
     *
     * @type {String[]|null}
     * @private
     */
    this._numbers = null;

    var parentLoad = this.load;
    this.load = function(data) {
        parentLoad.call(this, data);
        if("min" in data){
            self._min = data.min;
        }
        if("max" in data){
            self._max = data.max;
        }
        if("additional" in data){
            self._additional = [];
            _.forEach(data.additional, function(value){
                self._additional.push(new StorageLink(value));
            });
        }
        if("optional" in data){
            self._optional = [];
            _.forEach(data.optional, function(value){
                self._optional.push(new StorageLink(value));
            });
        }
        if("numbers" in data){
            self._numbers = data.numbers;
        }
        if("generate_outer" in data) {
            self._generate_outer = new StorageLink(data.generate_outer);
        }
    }
}

/**
 * Link on entity in storage entities tree
 *
 * @param {String|Array} linkInfo
 * @constructor
 */
function StorageLink(linkInfo) {
    var self = this;

    /**
     * Path to entity
     *
     * @type {String|null}
     * @private
     */
    var _path = null;

    /**
     * Dice for rolling, if entity must be generated
     * @type {null}
     * @private
     */
    var _dice = null;

    if(_.isString(linkInfo)){
        this._path = linkInfo.split('.');
    } else if(_.isArray(linkInfo)){
        this._path = linkInfo[0].split('.');
        this._dice = linkInfo[1];
    }
}

/**
 * Object that can return random integer via dice formula
 * @constructor
 */
function Dice() {
    /**
     * Returns random integer via dice formula
     *
     * @param {String} diceFormula with template {x}d{y}+{z} or {x}d{y}-{z}, where 'x' and 'z' are alimentary
     * @returns {number}
     */
    this.roll = function(diceFormula) {
        var result = this.dices.shift();
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

    this.prepareTree = function(tree) {
        var parsedTree = [];
        _.forEach(tree, function(node){
            var parsedNode = {
                text: "<button class='btn btn-xs btn-warning generate-start' data-obj='"+node.tag+"'>"+node.title+"</button>"
            };
            var nodes = self.prepareTree(node.nodes);
            if(nodes.length > 0){
                parsedNode.nodes = nodes;
            }
            parsedTree.push(parsedNode);
        });
        return parsedTree;
    }
}

String.prototype.capitalizeFirstLetter = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.beautifyTag = function () {
    return this.capitalizeFirstLetter().replace(/_/g, " ");
};
