define([
    'jquery',
    'lodash',
    'bootstrap-treeview',
    'components/Dice',
    'components/Generator',
    'components/TreeViewHelper',
    'components/SimplePrinter',
    'json!/data/obj.json'
], function($, _, treeview, Dice, Generator, TreeViewHelper, SimplePrinter, generatorData){
    var run = function(){
        var dice = new Dice();
        var $outputDiv = $(".output");

        var generator = new Generator();
        var treeHelper = new TreeViewHelper();
        var printer = new SimplePrinter();

        generator.loadStorage(generatorData);

        var entitiesTree = $('#entitiesTree');
        entitiesTree.treeview({data: treeHelper.prepareTree(generator.getStorage().getTree())});
        entitiesTree.treeview('collapseAll', { silent: true });

        $(document).on("click", ".generate-start", function () {
            var objectToGenerate = $(this).data('obj');
            var generatedEntity = generator.generate(objectToGenerate);
            console.log(generatedEntity);

            $outputDiv.prepend(printer.printEntity(generatedEntity));
        });

        $(".output-clear").on("click", function () {
            $outputDiv.html("");
        });

        $(".roll-dice").on("click", function () {
            var $formulaInput = $('#diceRoller');
            var formula = $formulaInput.val();
            if(_.isEmpty(formula)){
                formula = "3d6";
                $formulaInput.val(formula);
            }
            var result = dice.roll(formula);
            $outputDiv.prepend("<div class='generatedOutput'><h3 class='entityTitle'>Custom roll ("
                + formula + ")</h3><p class=\"customRollResult\">"+result+"</p></div>");
        });
    };

    return {
        run: run
    };
});