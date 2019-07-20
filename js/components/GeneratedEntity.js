define([], function(){
    /**
     * Object, that contains raw generated data
     *
     * @constructor
     * @param tag
     * @param title
     */
    let GeneratedEntity = function(tag, title) {
        this.tag = tag;
        this.title = title;
        this.description = "";
        this.roll = null;

        this.variant = null;

        this.additional = [];
        this.additionalTitle = "";
    };

    return GeneratedEntity;
});