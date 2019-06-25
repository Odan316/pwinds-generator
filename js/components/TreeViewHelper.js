define([

], function(){
    /**
     * Helper, that transforms simple entities tree in treeView compatible data config
     * @constructor
     */
    var TreeViewHelper = function() {
        var self = this;

        this.prepareTree = function(tree, parentPath) {
            var parsedTree = [];
            _.forEach(tree, function(node){
                var nodePath = parentPath !== undefined ? parentPath + '.' + node.tag : node.tag;
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
    };

    return TreeViewHelper;
});