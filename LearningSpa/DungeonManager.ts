/// <reference path="gamecalculators.ts" />
/// <reference path="cmd.ts" />
class DungeonManager {
    private _player: Token;
    private _gameBoard: CmdWnd;
    private _npcs: Npc[];
    private static npcToken: string[] = ['o'];
    constructor(board: CmdWnd, player: Token, countNpcs: number, countWalls: number) {
        this._npcs = [];
        this._gameBoard = board;
        this._player = player;
        for (var repsNpcs = 0; repsNpcs < countNpcs; repsNpcs++) {
            this._insertRandomNpc();
        }
    }
    private _insertRandomNpc(): void {
        var str = DungeonManager.npcToken[Math.floor(Math.random() * DungeonManager.npcToken.length)];
        var ixRow = Math.floor(Math.random() * this._gameBoard.NUM_ROWS);
        var ixCol = Math.floor(Math.random() * this._gameBoard.NUM_COLS);
        var newNpc: Npc = new Npc(function (board) {
            var randomMove: Vector = Vector.RandomVector();
            board.MoveToken(this, randomMove.deltaRow, randomMove.deltaCol);
        }, str, ixRow, ixCol);
        this._npcs.push(newNpc);
        this._gameBoard.AddToken(newNpc);
    }
    

    ActOnKeyDown(evt: KeyboardEvent) {
        var code: number = evt.keyCode;
        var str_key: string = evt.key;
        var shift: boolean = evt.shiftKey;
        var playerMove: Vector = this._getPlayerMovement(evt);
        if (!playerMove.IsNoOp()) {
            var moved = this._gameBoard.MoveToken(this._player, playerMove.deltaRow, playerMove.deltaCol);
            if (!moved) {
                var impacted: Npc = this._checkCollision(this._player, playerMove);
                if (impacted) {
                    this._handleCollision(this._player, impacted);
                }
            }
        }

        if (this._triggersNpcMoves(evt)) {
            for (var ixNpc = 0; ixNpc < this._npcs.length; ixNpc++) {
                this._npcs[ixNpc].Move(this._gameBoard);
            }
        }
        this._gameBoard.Draw();

    }
    private _checkCollision(mover: Token, move: Vector): Npc {
        var retval: Npc = null;
        var newIxRow: number = mover.ixRow + move.deltaRow;
        var newIxCol: number = mover.ixCol + move.deltaCol;
        var collided: Npc;
        var candidates = this._npcs.filter((el) => {
            return el.ixRow == newIxRow && el.ixCol == newIxCol;
        });
        if (candidates && candidates.length > 0) {
            retval = candidates[0];
        }
        return retval;
    }
    private _handleCollision(initiater: Token, collided: Npc) {
        this._gameBoard.ClearGridAt(collided.ixRow, collided.ixCol);
        var ixToDel = this._npcs.indexOf(collided);
        if (ixToDel >= 0) {
            this._npcs.splice(ixToDel, 1);
        } else {
            throw Error("Collision with nonexistent token.");
        }
        this._gameBoard.Draw();
    }
    private _triggersNpcMoves(evt: KeyboardEvent): boolean {
        return !(this._getPlayerMovement(evt).IsNoOp());
    }

    private _getPlayerMovement(evt: KeyboardEvent): Vector {
        var left = 37;
        var up = 38;
        var right = 39;
        var down = 40;
        var retval = new Vector(0, 0);
        switch (evt.keyCode) {
            case left:
                retval.deltaRow = 0;
                retval.deltaCol = -1; 
                break;
            case right:
                retval.deltaRow = 0;
                retval.deltaCol = 1; 
                break;
            case up:
                retval.deltaRow = -1;
                retval.deltaCol = 0; 
                break;
            case down:
                retval.deltaRow = 1;
                retval.deltaCol = 0; 
                break;
        }
        return retval;
    }
    private _handleKeyDown(evt: KeyboardEvent) {

    }
}
class Npc extends Token {
    Move: (board : CmdWnd) => void;
    constructor(move: (board: CmdWnd) => void, tok: string, ixRow: number, ixCol: number) {
        super(tok, ixRow, ixCol);
        this.Move = move; 
    }
}
class Vector {
    static CoinFlip(): number {
        var num: number = Math.random();
        return (num < 0.5 ? 1 : -1);
    }
    static RandomVector(): Vector {
        var deltaRow = Math.floor(Math.random() + 0.5) * Vector.CoinFlip();
        var deltaCol = Math.floor(Math.random() + 0.5) * Vector.CoinFlip();
        return new Vector(deltaRow, deltaCol);
    }
    deltaRow: number;
    deltaCol: number;
    constructor(deltaRow: number, deltaCol: number) {
        this.deltaRow = deltaRow;
        this.deltaCol = deltaCol;
    }
    IsNoOp(): boolean {
        return this.deltaRow == 0 && this.deltaCol == 0; 
    }
}