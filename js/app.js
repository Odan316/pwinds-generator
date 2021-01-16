define([
    'jquery',
    'lodash',
    'bootstrap-treeview',
    'components/Dice',
    'components/Generator',
    'components/TreeViewHelper',
    'components/SimplePrinter',
    //'json!/data/freebooters.json',
    //'json!/data/perilous.json',
], function ($, _, treeview, Dice, Generator, TreeViewHelper, SimplePrinter) {

    let generator;
    let treeHelper;

    let loadDataFile = function () {
        let dataFileName = window.location.hash;
        if (dataFileName === "") {
            dataFileName = $('.main-menu li a:first').attr('href');
        }

        if (dataFileName.charAt(0) === "#") {
            dataFileName = dataFileName.substr(1);
        }

        console.log(dataFileName);
        $.ajax({
            type: "GET",
            url: "data/" + dataFileName + ".json?v=" + Date.now(),
            async: true,
            success: function (generatorData) {
                generator.loadStorage(generatorData);

                let entitiesTree = $('#entitiesTree');
                entitiesTree.treeview({
                    data: treeHelper.prepareTree(generator.getStorage().getTree()),
                    highlightSelected: false
                });
                entitiesTree.treeview('collapseAll', {silent: true});
            }
        });
    };

    let run = function () {
        let dice = new Dice();
        var $outputDiv = $(".output");
        treeHelper = new TreeViewHelper();
        var printer = new SimplePrinter();

        generator = new Generator();
        loadDataFile();

        $(window).on("hashchange", function () {
            $(".main-menu li").removeClass("active");
            $('.main-menu li a[href="' + window.location.hash + '"]').parent('li').addClass('active');
            $outputDiv.html("");
            loadDataFile();
        });

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
            if (_.isEmpty(formula)) {
                formula = "3d6";
                $formulaInput.val(formula);
            }
            var result = dice.roll(formula);
            $outputDiv.prepend("<div class='generatedOutput'><h3 class='entityTitle'>Custom roll (" +
                formula + ")</h3><p class=\"customRollResult\">" + result + "</p></div>");
        });
    };

    return {
        run: run
    };
});