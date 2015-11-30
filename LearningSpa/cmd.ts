namespace SomeNamespace {
    export class CmdWnd { }
}
class CmdWnd {
    NUM_COLS = 80; 
    NUM_ROWS = 25;
    contents: string[][];
    parent: HTMLElement;
    tokens: Token[];
    constructor(parent: HTMLElement) {
        this.isVictory = false;
        this.parent = parent;
        this.tokens = [];
        this.InitBlankGrid();
    }
    GetCharAt(row: number, column: number): string {
        if (row >= this.NUM_ROWS || column >= this.NUM_COLS) {
            return "";
        }
        if (row < 0 || column < 0) {
            return "";
        }
        return this.contents[row][column];
    } 
    InitBlankGrid(): void {
        this.contents = [];
        for (var row = 0; row < this.NUM_ROWS; row++) {
            var newRow: string[] = [];
            for (var col = 0; col < this.NUM_COLS; col++) {
                newRow.push("*");
            }
            this.contents.push(newRow);
        }
    }
    UpdateContents(): void {
        this.InitBlankGrid();
        for (var ixToken = 0; ixToken < this.tokens.length; ixToken++) {
            var currentToken = this.tokens[ixToken];
            this.contents[currentToken.ixRow][currentToken.ixCol] = currentToken.token;
        }
    }
    IsGridCoordOccupied(ixRow: number, ixCol: number) : boolean  {
        if (ixRow >= this.NUM_ROWS || ixCol >= this.NUM_COLS) {
            return true; 
        }
        this.UpdateContents();
        return this.contents[ixRow][ixCol] == "*";
    }
    Draw(): void {
        this.parent.innerHTML = "";
        this.UpdateContents();
        for (var row = 0; row < this.NUM_ROWS; row++) {
            this.parent.innerHTML += this.contents[row].join("") + "</br>";
        }
    }
    AddToken(token: Token) {
        if (!this.tokens) { this.tokens = []; }
        this.tokens.push(token); 
        this.contents[token.ixRow][token.ixCol] = token.token;
        
        this.CheckSanity();
    }
    MoveToken(toMove: Token, deltaRow: number, deltaCol: number): boolean {
        if (this.tokens.indexOf(toMove) < 0) {
            throw Error("Tried to move nonexistent token.");
        }
        //clear current position
        var colsCheck: boolean = this.CheckCanMoveLr(toMove, deltaCol);
        var rowsCheck: boolean = this.CheckCanMoreUd(toMove, deltaRow);
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
    }
    CheckIsVictory(): boolean {
        return this._checkIsVictory();
    }
    private isVictory: boolean; 
    private _checkIsVictory(): boolean {
        return this.isVictory;
    }

    CheckCanMoveLr(toMove: Token, deltaCol: number): boolean {
        if (deltaCol == 0) {
            return true;
        }
        var curPos: number = toMove.ixCol;
        var charInWay: string = this.GetCharAt(toMove.ixRow, curPos + deltaCol);
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
    }
    CheckCanMoreUd(toMove: Token, deltaRow: number): boolean {
        if (deltaRow == 0) {
            return true;
        }
        var curPos: number = toMove.ixRow;
        var charInWay: string = this.GetCharAt(curPos + deltaRow, toMove.ixCol);
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
    }
    private _clearGridAtRow(ixRow: number, ixCol: number): void {
        var lengthBeforeDeletion = this.tokens.length; 
        var filtered = this.tokens.filter(el => {
            return el.ixRow == ixRow
                && el.ixCol == ixCol;
        });
        if (filtered && filtered.length > 0) {
            var delme: Token = filtered[0];
            var ixDelme: number = this.tokens.indexOf(delme);
            this.tokens.splice(ixDelme, 1);
            var lengthAfterDeletion = this.tokens.length;
        }
    }
    ClearGridAt(ixRow: number, ixCol: number): void {
        //find a token if there is one, and delete it. 
        this._clearGridAtRow(ixRow, ixCol);
        //then draw the board. 
        this.Draw();
    }
    ClearRandomGridSquare(): void {
        var ixRow: number = Math.floor(Math.random() * this.NUM_ROWS + 1);
        var ixCol: number = Math.floor(Math.random() * this.NUM_COLS + 1);
        this.ClearGridAt(ixRow, ixCol);
    }
    ClearNRandomGridSquares(n: number) : void {
        for (var i = 0; i < n; i++) {
            var ixToken: number = Math.floor(Math.random() * this.tokens.length);
            if (this.tokens[ixToken].token != "@") {
                this.tokens.splice(ixToken, 1);
            }
        }
    }
    CheckSanity(): void {
        for (var row = 0; row < this.contents.length; row++) {
            if (this.contents[row].length != this.NUM_COLS) {
                throw Error("Bad row: " + row);
            }
        }
    }
}

class Token {
    token: string; 
    ixCol: number; 
    ixRow: number; 
    constructor(tok: string, ixRow: number, ixCol: number) {
        this.token = tok;
        this.ixCol = ixCol;
        this.ixRow = ixRow;
    }
}
class Wall {
    wall: Token[];
    WALL_GLYPH: string = "#";
    constructor(minIxRow: number, minIxCol: number, numRows : number, numCols : number) {
        this.wall = [];
        for (var row = minIxRow; row < minIxRow + numRows; row++) {
            for (var col = minIxCol; col < minIxCol + numCols; col++) {
                var tok: Token = new Token(this.WALL_GLYPH, row, col);
                this.wall.push(tok);
            }
        }
    }
    AddToBoard(destination: CmdWnd) {
        for (var ixTok = 0; ixTok < this.wall.length; ixTok++) {
            destination.AddToken(this.wall[ixTok]);
        }
    }
    static MakeWallGrid(destination: CmdWnd) {
        var height: number = destination.NUM_ROWS;
        var width: number = destination.NUM_COLS;
        //make vertical walls; 
        for (var ixCol = 1; ixCol < width - 1; ixCol += 2) {
            var wall: Wall = new Wall(0, ixCol, height, 1);
            wall.AddToBoard(destination);
        } 
        //make horizontal walls;
        for (var ixRow = 1; ixRow < height - 1; ixRow += 2) {
            var wall: Wall = new Wall(ixRow, 0, 1, width);
            wall.AddToBoard(destination);
        }
    }
}
