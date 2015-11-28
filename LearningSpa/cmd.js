var SomeNamespace;
(function (SomeNamespace) {
    var CmdWnd = (function () {
        function CmdWnd() {
        }
        return CmdWnd;
    })();
    SomeNamespace.CmdWnd = CmdWnd;
})(SomeNamespace || (SomeNamespace = {}));
var CmdWnd = (function () {
    function CmdWnd(parent) {
        this.NUM_COLS = 80;
        this.NUM_ROWS = 25;
        this.parent = parent;
        this.tokens = [];
        this.InitBlankGrid();
    }
    CmdWnd.prototype.GetCharAt = function (row, column) {
        if (row >= this.NUM_ROWS || column >= this.NUM_COLS) {
            return "";
        }
        return this.contents[row][column];
    };
    CmdWnd.prototype.InitBlankGrid = function () {
        this.contents = [];
        for (var row = 0; row < this.NUM_ROWS; row++) {
            var newRow = [];
            for (var col = 0; col < this.NUM_COLS; col++) {
                newRow.push("*");
            }
            this.contents.push(newRow);
        }
    };
    CmdWnd.prototype.Draw = function () {
        this.parent.innerHTML = "";
        this.InitBlankGrid();
        for (var ixToken = 0; ixToken < this.tokens.length; ixToken++) {
            var currentToken = this.tokens[ixToken];
            this.contents[currentToken.ixRow][currentToken.ixCol] = currentToken.token;
        }
        for (var row = 0; row < this.NUM_ROWS; row++) {
            this.parent.innerHTML += this.contents[row].join("") + "</br>";
        }
    };
    CmdWnd.prototype.AddToken = function (token) {
        if (!this.tokens) {
            this.tokens = [];
        }
        this.tokens.push(token);
        this.contents[token.ixRow][token.ixCol] = token.token;
        this.Draw();
        this.CheckSanity();
    };
    CmdWnd.prototype.MoveToken = function (toMove, deltaRow, deltaCol) {
        if (this.tokens.indexOf(toMove) < 0) {
            throw Error("Tried to move nonexistent token.");
        }
        console.log("attempting to move: " + toMove.token + " " + toMove.ixRow + " " + toMove.ixCol);
        //clear current position
        var colsCheck = this.CheckCanMoveLr(toMove, deltaCol);
        var rowsCheck = this.CheckCanMoreUd(toMove, deltaRow);
        if (!(colsCheck && rowsCheck)) {
            return;
        }
        this.contents[toMove.ixRow][toMove.ixCol] = "*";
        //var ix = this.tokens.indexOf(toMove);
        //this.tokens.splice(ix, 1);
        //update position.
        toMove.ixRow += deltaRow;
        toMove.ixCol += deltaCol;
        console.log("New destination row: " + toMove.ixRow + "col " + toMove.ixCol);
        this.Draw();
        // this.AddToken(toMove);
    };
    CmdWnd.prototype.CheckCanMoveLr = function (toMove, deltaCol) {
        if (deltaCol == 0) {
            return true;
        }
        var curPos = toMove.ixCol;
        var charInWay = this.GetCharAt(toMove.ixRow, curPos + deltaCol);
        if (charInWay != "*") {
            return false;
        }
        //check left
        if (curPos + deltaCol < 0) {
            return false;
        }
        //check right
        if (curPos + deltaCol >= this.NUM_COLS) {
            return false;
        }
        return true;
    };
    CmdWnd.prototype.CheckCanMoreUd = function (toMove, deltaRow) {
        if (deltaRow == 0) {
            return true;
        }
        var curPos = toMove.ixRow;
        var charInWay = this.GetCharAt(curPos + deltaRow, toMove.ixCol);
        if (charInWay != "*") {
            return false;
        }
        //check up
        if (curPos + deltaRow >= this.NUM_ROWS) {
            return false;
        }
        //check down
        if (curPos + deltaRow < 0) {
            return false;
        }
        return true;
    };
    CmdWnd.prototype.CheckSanity = function () {
        for (var row = 0; row < this.contents.length; row++) {
            if (this.contents[row].length != this.NUM_COLS) {
                throw Error("Bad row: " + row);
            }
        }
    };
    return CmdWnd;
})();
var Token = (function () {
    function Token(tok, ixRow, ixCol) {
        this.token = tok;
        this.ixCol = ixCol;
        this.ixRow = ixRow;
    }
    return Token;
})();
var Wall = (function () {
    function Wall(minIxRow, minIxCol, numRows, numCols) {
        this.WALL_GLYPH = "#";
        this.wall = [];
        for (var row = minIxRow; row < minIxRow + numRows; row++) {
            for (var col = minIxCol; col < minIxCol + numCols; col++) {
                var tok = new Token(this.WALL_GLYPH, row, col);
                this.wall.push(tok);
            }
        }
    }
    Wall.prototype.AddToBoard = function (destination) {
        for (var ixTok = 0; ixTok < this.wall.length; ixTok++) {
            destination.AddToken(this.wall[ixTok]);
        }
    };
    return Wall;
})();
//# sourceMappingURL=cmd.js.map