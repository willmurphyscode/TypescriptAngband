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
        this.isVictory = false;
        this.parent = parent;
        this.tokens = [];
        this.InitBlankGrid();
    }
    CmdWnd.prototype.GetCharAt = function (row, column) {
        if (row >= this.NUM_ROWS || column >= this.NUM_COLS) {
            return "";
        }
        if (row < 0 || column < 0) {
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
    CmdWnd.prototype.UpdateContents = function () {
        this.InitBlankGrid();
        for (var ixToken = 0; ixToken < this.tokens.length; ixToken++) {
            var currentToken = this.tokens[ixToken];
            this.contents[currentToken.ixRow][currentToken.ixCol] = currentToken.token;
        }
    };
    CmdWnd.prototype.IsGridCoordOccupied = function (ixRow, ixCol) {
        if (ixRow >= this.NUM_ROWS || ixCol >= this.NUM_COLS) {
            return true;
        }
        this.UpdateContents();
        return this.contents[ixRow][ixCol] == "*";
    };
    CmdWnd.prototype.Draw = function () {
        this.parent.innerHTML = "";
        this.UpdateContents();
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
        this.CheckSanity();
    };
    CmdWnd.prototype.MoveToken = function (toMove, deltaRow, deltaCol) {
        if (this.tokens.indexOf(toMove) < 0) {
            throw Error("Tried to move nonexistent token.");
        }
        //clear current position
        var colsCheck = this.CheckCanMoveLr(toMove, deltaCol);
        var rowsCheck = this.CheckCanMoreUd(toMove, deltaRow);
        if (!(colsCheck && rowsCheck)) {
            return false;
        }
        this.contents[toMove.ixRow][toMove.ixCol] = "*";
        //var ix = this.tokens.indexOf(toMove);
        //this.tokens.splice(ix, 1);
        //update position.
        toMove.ixRow += deltaRow;
        toMove.ixCol += deltaCol;
        if (toMove.token == "@" && toMove.ixRow == 0 && toMove.ixCol == this.NUM_COLS - 1) {
            this.isVictory = true;
        }
        this.Draw();
        return true;
    };
    CmdWnd.prototype.CheckIsVictory = function () {
        return this._checkIsVictory();
    };
    CmdWnd.prototype._checkIsVictory = function () {
        return this.isVictory;
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
    CmdWnd.prototype._clearGridAtRow = function (ixRow, ixCol) {
        var lengthBeforeDeletion = this.tokens.length;
        var filtered = this.tokens.filter(function (el) {
            return el.ixRow == ixRow
                && el.ixCol == ixCol;
        });
        if (filtered && filtered.length > 0) {
            var delme = filtered[0];
            var ixDelme = this.tokens.indexOf(delme);
            this.tokens.splice(ixDelme, 1);
            var lengthAfterDeletion = this.tokens.length;
        }
    };
    CmdWnd.prototype.ClearGridAt = function (ixRow, ixCol) {
        //find a token if there is one, and delete it. 
        this._clearGridAtRow(ixRow, ixCol);
        //then draw the board. 
        this.Draw();
    };
    CmdWnd.prototype.ClearRandomGridSquare = function () {
        var ixRow = Math.floor(Math.random() * this.NUM_ROWS + 1);
        var ixCol = Math.floor(Math.random() * this.NUM_COLS + 1);
        this.ClearGridAt(ixRow, ixCol);
    };
    CmdWnd.prototype.ClearNRandomGridSquares = function (n) {
        for (var i = 0; i < n; i++) {
            var ixToken = Math.floor(Math.random() * this.tokens.length);
            if (this.tokens[ixToken].token != "@") {
                this.tokens.splice(ixToken, 1);
            }
        }
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
    Wall.MakeWallGrid = function (destination) {
        var height = destination.NUM_ROWS;
        var width = destination.NUM_COLS;
        //make vertical walls; 
        for (var ixCol = 1; ixCol < width - 1; ixCol += 2) {
            var wall = new Wall(0, ixCol, height, 1);
            wall.AddToBoard(destination);
        }
        //make horizontal walls;
        for (var ixRow = 1; ixRow < height - 1; ixRow += 2) {
            var wall = new Wall(ixRow, 0, 1, width);
            wall.AddToBoard(destination);
        }
    };
    return Wall;
})();
//# sourceMappingURL=cmd.js.map