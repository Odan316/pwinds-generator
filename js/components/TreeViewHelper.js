define([], function () {
    /**
     * Helper, that transforms simple entities tree in treeView compatible data config
     * @constructor
     */
    var TreeViewHelper = function () {
        var self = this;

        this.prepareTree = function (tree, parentPath) {
            let parsedTree = [];
            _.forEach(tree, function (node) {
                let nodePath = parentPath !== undefined ? parentPath + '.' + node.tag : node.tag;
                let hintHtml = "";
                if (node.hint !== null) {
                    hintHtml = '<span class="hint glyphicon glyphicon-question-sign" title="' + node.hint + '"></span>';
                }

                let parsedNode = {
                    text: "<button class='btn btn-xs btn-warning generate-start' data-obj='" + nodePath + "'>" + node.title + "</button>" + hintHtml
                };
                let nodes = self.prepareTree(node.nodes, nodePath);
                if (nodes.length > 0) {
                    parsedNode.nodes = nodes;
                }
                parsedTree.push(parsedNode);
            });
            return parsedTree;
        }
    };

    return TreeViewHelper;
});