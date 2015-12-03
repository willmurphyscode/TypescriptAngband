/// <reference path="cmd.ts" />
var CalculatorApi = (function () {
    function CalculatorApi(graph, source) {
        this.graph = graph;
        this.reachable = new Array(this.graph.NUM_COLS * this.graph.NUM_ROWS);
        var start = new Date();
        for (var ixReachable = 0; ixReachable < graph.NUM_COLS * graph.NUM_ROWS; ixReachable++) {
            this.reachable[ixReachable] = false;
        }
        var end = new Date();
        var interval = end.getMilliseconds() - start.getMilliseconds();
        //  console.log("It took " + interval + " ms. to populate the array.");
        var stack = [];
        stack.push(source);
        while (stack.length > 0) {
            var here = stack.pop();
            var ixReached = this.RowColToInternalIx(here.ixRow, here.ixCol);
            if (this.reachable[ixReached]) {
                continue;
            }
            this.reachable[ixReached] = true;
            var adj = this.GetAdj(here, this.graph);
            for (var i = 0; i < adj.length; i++) {
                stack.push(adj[i]);
            }
        }
    }
    CalculatorApi.prototype.IsReachable = function (target) {
        var ixReachable = this.RowColToInternalIx(target.ixRow, target.ixCol);
        return this.reachable[ixReachable];
    };
    CalculatorApi.prototype.GetAdj = function (here, graph) {
        graph.UpdateContents();
        var retval = [];
        var up = graph.GetCharAt(here.ixRow - 1, here.ixCol);
        if (up == '*') {
            retval.push(new Token(up, here.ixRow - 1, here.ixCol));
        }
        var down = graph.GetCharAt(here.ixRow + 1, here.ixCol);
        if (down == '*') {
            retval.push(new Token(down, here.ixRow + 1, here.ixCol));
        }
        var left = graph.GetCharAt(here.ixRow, here.ixCol - 1);
        if (left == '*') {
            retval.push(new Token(down, here.ixRow, here.ixCol - 1));
        }
        var right = graph.GetCharAt(here.ixRow, here.ixCol + 1);
        if (right == '*') {
            retval.push(new Token(right, here.ixRow, here.ixCol + 1));
        }
        return retval;
    };
    CalculatorApi.prototype.RowColToInternalIx = function (ixRow, ixCol) {
        var largePart = ixRow * this.graph.NUM_COLS;
        var smallPart = ixCol;
        return largePart + smallPart;
    };
    return CalculatorApi;
})();
//# sourceMappingURL=gamecalculators.js.map