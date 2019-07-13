define([
    'jquery',
    'lodash',
    'components/Errors',
    'components/GeneratedEntity',
    'components/GeneratedErrorEntity'
], function($, _, Errors, GeneratedEntity, GeneratedErrorEntity){
    /**
     * Class for printing generated entities
     *
     * @constructor
     */
    var SimplePrinter = function() {

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
         * @param {Boolean} propertyEntity
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
                    if(generatedEntity.roll !== null){
                        $entityTitle.append($("<span class=\"roll\">").text("(" + generatedEntity.roll + ") "));
                    }
                    $entityTitle.append($("<span class=\"title\">").text(generatedEntity.variant.title));
                    $entityPropertiesOutput.append($entityTitle);

                    $entityPropertiesOutput.append(printEntityProperties(generatedEntity.variant, null));
                }

                if(generatedEntity.additional.length > 0){
                    let $subTitle = $("<h5 class=\"propertiesTitle\">").text(generatedEntity.additionalTitle);
                    $entityPropertiesOutput.append($subTitle);
                    let $subProperties = $("<div class=\"entitySubProperties\">");
                    _.forEach(generatedEntity.additional, function(propertyEntity){
                        $subProperties.append(printEntityProperties(propertyEntity, true));
                    });
                    $entityPropertiesOutput.append($subProperties);
                }
            }

            return $entityPropertiesOutput;
        };
    };

    return SimplePrinter;
});