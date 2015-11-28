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
        this.parent = parent;
        this.tokens = [];
        this.InitBlankGrid();
    }
    GetCharAt(row: number, column: number): string {
        if (row >= this.NUM_ROWS || column >= this.NUM_COLS) {
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
    Draw(): void {
        this.parent.innerHTML = "";
        this.InitBlankGrid();
        for (var ixToken = 0; ixToken < this.tokens.length; ixToken++) {
            var currentToken = this.tokens[ixToken];
            this.contents[currentToken.ixRow][currentToken.ixCol] = currentToken.token;
        }
        for (var row = 0; row < this.NUM_ROWS; row++) {
            this.parent.innerHTML += this.contents[row].join("") + "</br>";
        }
    }
    AddToken(token: Token) {
        if (!this.tokens) { this.tokens = []; }
        this.tokens.push(token); 
        this.contents[token.ixRow][token.ixCol] = token.token;
        this.Draw();
        this.CheckSanity();
    }
    MoveToken(toMove: Token, deltaRow: number, deltaCol: number): void {
        if (this.tokens.indexOf(toMove) < 0) {
            throw Error("Tried to move nonexistent token.");
        }
        console.log("attempting to move: " + toMove.token + " " + toMove.ixRow + " " + toMove.ixCol); 
        //clear current position
        var colsCheck: boolean = this.CheckCanMoveLr(toMove, deltaCol);
        var rowsCheck: boolean = this.CheckCanMoreUd(toMove, deltaRow);
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

}
