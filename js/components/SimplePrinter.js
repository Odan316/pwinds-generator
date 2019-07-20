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
    let SimplePrinter = function() {

        /**
         * Errors collection instance
         *
         * @type {Errors}
         * @private
         */
        let _errors = new Errors();

        /**
         * Prints generated Entity tree
         *
         * @param {GeneratedEntity} generatedEntity
         * @returns {*|jQuery|HTMLElement}
         */
        this.printEntity = function(generatedEntity) {
            let $output = $("<div class=\"generatedOutput\">");

            let $entityTitle = $("<h3 class=\"entityTitle\">").html(generatedEntity.title);
            $output.append($entityTitle);

            if(generatedEntity.description !== ""){
                $output.append($("<p class=\"entityDescription\">").html(generatedEntity.description));
            }

            $output.append(printEntityProperties(generatedEntity, false));

            return $output;
        };

        /**
         * Prints generated entity's properties (for calling recursive)
         *
         * @param {GeneratedEntity} generatedEntity
         * @param {Boolean} propertyEntity
         * @returns {*|jQuery|HTMLElement}
         */
        let printEntityProperties = function(generatedEntity, propertyEntity){
            let $entityPropertiesOutput = $("<div class=\"entityProperties\">");

            if(generatedEntity instanceof GeneratedErrorEntity){
                let $errorTitle = $("<h4 class=\"errorTitle\">").html(_errors.getErrorText(generatedEntity.type));
                $entityPropertiesOutput.append($errorTitle);

            } else {
                if(generatedEntity.variant != null){
                    let $entityTitle = $("<h4 class=\"variantTitle\">");
                    let $entityProperties = $("<div class=\"entityProperties\">");
                    if(propertyEntity){
                        if(generatedEntity.variant.variant !== null){
                            $entityPropertiesOutput.append($("<h4 class=\"variantTitle\">").html(generatedEntity.title + ": "));
                        } else {
                            $entityTitle.append($("<span class=\"type\">").html(generatedEntity.title + ": "));
                        }
                    }
                    if(generatedEntity.roll !== null){
                        $entityTitle.append($("<span class=\"roll\">").html("(" + generatedEntity.roll + ") "));
                    }
                    $entityTitle.append($("<span class=\"title\">").html(generatedEntity.variant.title));
                    if(generatedEntity.variant.description !== ""){
                        $entityTitle.append($("<span class=\"description\">").html(generatedEntity.variant.description));
                    }
                    if(propertyEntity && generatedEntity.variant.variant !== null) {
                        $entityProperties.append($entityTitle);
                        $entityProperties.append(printEntityProperties(generatedEntity.variant, null));
                        $entityPropertiesOutput.append($entityProperties);
                    } else {
                        $entityPropertiesOutput.append($entityTitle);
                        $entityPropertiesOutput.append(printEntityProperties(generatedEntity.variant, null));
                    }
                }

                if(generatedEntity.additional.length > 0){
                    if(generatedEntity.variant != null){
                        let $subTitle = $("<h5 class=\"propertiesTitle\">").html(generatedEntity.additionalTitle);
                        $entityPropertiesOutput.append($subTitle);
                    }
                    let $subProperties = $("<div class=\"entitySubProperties\">");
                    _.forEach(generatedEntity.additional, function(propertyEntity){
                        if(propertyEntity.variant === null ){
                            let $entityProperties = $("<div class=\"entityProperties\">");
                            $entityProperties.append($("<h4 class=\"variantTitle\">").html(propertyEntity.title + ": "));
                            $subProperties.append($entityProperties);
                        }
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