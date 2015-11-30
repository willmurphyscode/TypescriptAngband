/// <reference path="mathutilities.ts" />
/// <reference path="gamecalculators.ts" />
/// <reference path="cmd.ts" />
class DungeonManager {
    private _player: Token;
    private _gameBoard: CmdWnd;
    private _npcs: Npc[];
    private _playerHp: number; 
    private _playerPoints: number;
    private _stats: StatsDiv;
    private static npcToken: string[] = ['o'];
    constructor(board: CmdWnd, statsDiv: StatsDiv, player: Token, countNpcs: number, countWalls: number) {
        this._npcs = [];
        this._gameBoard = board;
        this._player = player;
        this._playerHp = 10;
        this._playerPoints = 20;
        this._stats = statsDiv;
        for (var repsNpcs = 0; repsNpcs < countNpcs; repsNpcs++) {
            this._insertRandomNpc();
        }
        this._insertTiger();
        this._insertTiger();
    }
    private _insertTiger(): void {
        var ixRow = Math.floor(Math.random() * this._gameBoard.NUM_ROWS);
        var ixCol = Math.floor(Math.random() * this._gameBoard.NUM_COLS);
        var str = "T";
        var player = this._player;
        var tiger: Npc = new Npc(function (board: CmdWnd) {
            var moved : boolean = true; 
            var initialRow = this.ixRow; 
            var initialCol = this.ixCol; 
            var movement: Vector = Vector.VectorTowards(this, player, 2);
            //debug
            //var msg: string = "Tiger moving, at " + this.ixRow + " x " + this.ixCol;
            //msg += ("\ntowards: " + player.ixRow + " x " + player.ixCol);
            //msg += ("\n by vector: " + movement.deltaRow + " x " + movement.deltaCol);
            //console.log(msg);
            //end debug
            board.MoveToken(this, movement.deltaRow, movement.deltaCol);
            var newRow = this.ixRow;
            var newCol = this.ixCol;
            if (newRow == initialRow && newCol == initialCol) {
                moved = false; 
            }
            if (moved) {
                return movement;
            }
            else {
                return new Vector(0, 0);
            }
        }, str, ixRow, ixCol);
        this._npcs.push(tiger);
        this._gameBoard.AddToken(tiger);
    }
    private _insertRandomNpc(): void {
        var str = DungeonManager.npcToken[Math.floor(Math.random() * DungeonManager.npcToken.length)];
        var ixRow = Math.floor(Math.random() * this._gameBoard.NUM_ROWS);
        var ixCol = Math.floor(Math.random() * this._gameBoard.NUM_COLS);
        var newNpc: Npc = new Npc(function (board) {
            var moved: boolean = true; 
            var initialRow = this.ixRow; 
            var initialCol = this.ixCol;
            var randomMove: Vector = Vector.RandomVector();
            board.MoveToken(this, randomMove.deltaRow, randomMove.deltaCol);
            var newRow = this.ixRow;
            var newCol = this.ixCol;
            if (initialRow == newRow && initialCol == newCol) {
                moved = false; 
            }
            if (moved) {
                return randomMove;
            }
            else {
                return new Vector(0, 0);
            }
        }, str, ixRow, ixCol);
        this._npcs.push(newNpc);
        this._gameBoard.AddToken(newNpc);
    }
    

    ActOnKeyDown(evt: KeyboardEvent) {
        var code: number = evt.keyCode;
        var str_key: string = evt.key;
        var shift: boolean = evt.shiftKey;
        var playerMove: Vector = this._getPlayerMovement(evt);
        var collisions: Collision[] = [];
        if (!playerMove.IsNoOp()) {
            var moved = this._gameBoard.MoveToken(this._player, playerMove.deltaRow, playerMove.deltaCol);
            if (!moved) {
                var impacted: Token = this._checkCollision(this._player, playerMove);
                if (impacted) {
                    this._handleCollisionByPlayer(this._player, impacted);
                }
            }
        }

        if (this._triggersNpcMoves(evt)) {
            for (var ixNpc = 0; ixNpc < this._npcs.length; ixNpc++) {
                var npcMove: Vector = this._npcs[ixNpc].Move(this._gameBoard);
                if (!npcMove.IsNoOp()) {
                    var collided: Token = this._checkCollision(this._npcs[ixNpc], npcMove);
                    if (collided) {
                        collisions.push(new Collision(this._npcs[ixNpc], collided));
                    }
                }
            }
        }
        for (var ixCollision = 0; ixCollision < collisions.length; ixCollision++) {
            this._handleCollision(collisions[ixCollision]);
        }
        this._gameBoard.Draw();

    }
    private _handleCollision(collision: Collision): void {
        //debug
        console.log("A " + collision.initiator.token + " hit a " + collision.collided.token + "!");
        //endebug
    }
    private _checkCollision(mover: Token, move: Vector): Token {
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
    private _handleCollisionByPlayer(initiater: Token, collided: Token) {
        this._gameBoard.ClearGridAt(collided.ixRow, collided.ixCol);
        var collidedNpc: Npc = collided as Npc; 
        var ixToDel = this._npcs.indexOf(collidedNpc);
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
    Move: (board : CmdWnd) => Vector;
    constructor(move: (board: CmdWnd) => Vector, tok: string, ixRow: number, ixCol: number) {
        super(tok, ixRow, ixCol);
        this.Move = move; 
    }
}
class Vector {
    static VectorTowards(source: Token, target: Token, length : number): Vector {
        var totalDeltaRow: number = target.ixRow - source.ixRow;
        var totalDeltaCol: number = target.ixCol - source.ixCol;
        var sqrdLength: number = length * length;
        var sqrdDeltaRow: number = totalDeltaRow * totalDeltaRow;
        var sqrdDeltaCol: number = totalDeltaCol * totalDeltaCol;
        var sqrdRatio: number = Math.min(sqrdLength / (sqrdDeltaRow + sqrdDeltaCol), 1);
        var ratio: number = Math.sqrt(sqrdRatio);
        var retvalDeltaRow = MathUtils.RoundMagnitudeUp(totalDeltaRow * ratio);
        var retvalDeltaCol = MathUtils.RoundMagnitudeUp(totalDeltaCol * ratio);
        return new Vector(retvalDeltaRow, retvalDeltaCol);
    }
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

class StatsDiv {
    private _div: HTMLElement;
    private _contents: Object; 
    constructor(div: HTMLElement) {
        this._div = div;
        this._contents = {};
    }
    public AppendMessage(messageContents: string, messageId: string): void {
        var msg: HTMLElement = document.createElement('p');
        msg.innerText = messageContents;
        msg.id = messageId;
        this._contents[messageId] = msg;
    }
    public OverwriteMessae(newMessageContents: string, existingMessageId: string) : boolean {
        var success: boolean = false; 
        try {
            var msg = this._contents[existingMessageId];
            msg.innerText = newMessageContents;
            success = true; 
        }
        catch (e) {
            //empty block 
        }
        return success;
    }
    public Draw(): void {

    }
}

class Collision {
    initiator: Token;
    collided: Token; 
    ixRow: number;
    ixCol: number;
    constructor(initiator: Token, collided: Token) {
        this.initiator = initiator;
        this.collided = collided;
        this.ixRow = collided.ixRow;
        this.ixCol = collided.ixCol;
    }
}