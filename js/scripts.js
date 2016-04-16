$(function () {
    var generator = new Generator();
    $.get("data/obj.json", function (data) {
        generator.objects = data;
    });

    $(".generate-start").on("click", function () {
        var obj = $(this).data('obj');
        var generated = generator.generate(obj);
        $(this).parents('#home').find(".output").prepend(generated);
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
}

function GeneratedElement(title, tag, roll) {
    this.tag = tag;
    this.title = title;
    this.roll = roll;
    this.innerElement = undefined;
    this.additionalProperties = [];
}

String.prototype.capitalizeFirstLetter = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.beautifyTag = function () {
    return this.capitalizeFirstLetter().replace(/_/g, " ");
};
