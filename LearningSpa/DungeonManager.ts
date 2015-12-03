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
    private _npcToken: string[] = ['o', 's'];
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
        this._stats.AppendMessage("HP: 10/10", "hp");
        this._stats.AppendMessage("Kills: 0", "kills");
    }
    private _insertTiger(): void {
        var ixRow = Math.floor(Math.random() * this._gameBoard.NUM_ROWS);
        var ixCol = Math.floor(Math.random() * this._gameBoard.NUM_COLS);
        var str = "T";
        var player = this._player;
        var tiger: Npc = new Npc(function (board: CmdWnd) {
            var pursuit: Vector = Vector.VectorTowards(this, player, 2);
            return pursuit;
        }, str, ixRow, ixCol);
        this._npcs.push(tiger);
        this._gameBoard.AddToken(tiger);
    }
    private _insertRandomNpc(): void {
        var str = this._npcToken[Math.floor(Math.random() * this._npcToken.length)];
        var ixRow = Math.floor(Math.random() * this._gameBoard.NUM_ROWS);
        var ixCol = Math.floor(Math.random() * this._gameBoard.NUM_COLS);
        var newNpc: Npc = new Npc(function (board) {
            var randomMove: Vector = Vector.RandomVector();
            //board.MoveToken(this, randomMove.deltaRow, randomMove.deltaCol);
            return randomMove;
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
        var moves: Move[] = [];
        if (!playerMove.IsNoOp()) {
            var moved = this._gameBoard.MoveToken(this._player, playerMove.deltaRow, playerMove.deltaCol);
            if (!moved) {
                var impacted: Token = this._checkCollision(this._player, playerMove);
                if (impacted) {
                    collisions.push(new Collision(this._player, impacted));
                }
            }
        }
        this._gameBoard.UpdateContents();

        if (this._triggersNpcMoves(evt)) {
            for (var ixNpc = 0; ixNpc < this._npcs.length; ixNpc++) {
                var npcToMove = this._npcs[ixNpc];
                var npcMove: Vector = npcToMove.TryMove(this._gameBoard);
                if (!npcMove.IsNoOp()) {
                    var collided: Token = this._checkCollision(npcToMove, npcMove);
                    if (collided) {
                        collisions.push(new Collision(this._npcs[ixNpc], collided));
                    }
                    moves.push(new Move(npcToMove, this._gameBoard, npcMove));
                }
            }
        }
        for (var ixCollision = 0; ixCollision < collisions.length; ixCollision++) {
            this._handleCollision(collisions[ixCollision]);
        }
        for (var ixMove = 0; ixMove < moves.length; ixMove++) {
            this._handleMove(moves[ixMove]);
        }
        this._gameBoard.Draw();
        if (this._playerHp <= 0) {
            this.Defeated(); 
        }
    }
    private Defeated(): void {
        alert("Oh dear, you have been mauled by a tiger. You lose.");
        
    }
    public ReInit(): void {

    }

    private _handleCollision(collision: Collision): void {
        //debug
        console.log("A " + collision.initiator.token + " hit a " + collision.collided.token + "!");
        //endebug
        if (collision.initiator.token == "T" && collision.collided == this._player) {
            this._playerHp--;
        }
        if (collision.initiator == this._player && collision.collided.token != "T") {
            this._playerPoints++;
            this._gameBoard.ClearGridAt(collision.collided.ixRow, collision.collided.ixCol);
            var playersMove: Vector = Vector.VectorTowards(this._player, collision.collided, 1);
            this._gameBoard.MoveToken(this._player, playersMove.deltaRow, playersMove.deltaCol);
        }
        this._stats.OverwriteMessage("HP: " + this._playerHp + "/10", "hp");
        this._stats.OverwriteMessage("Kills: " + this._playerPoints, "kills");
    }
    private _handleMove(move: Move): void {
        move.Move();
    }
    private _checkCollision(mover: Token, move: Vector): Token {
        var retval: Token = null;
        var newIxRow: number = mover.ixRow + move.deltaRow;
        var newIxCol: number = mover.ixCol + move.deltaCol;
        var collided: Npc;
        var candidates = this._npcs.filter((el) => {
            return el.ixRow == newIxRow && el.ixCol == newIxCol;
        });
        if (this._player.ixRow == newIxRow && this._player.ixCol == newIxCol) {
            retval = this._player;
        }
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
        var wait: number = 87;
        return (evt.keyCode == wait) || !(this._getPlayerMovement(evt).IsNoOp());
    }

    private _getPlayerMovement(evt: KeyboardEvent): Vector {
        var left = 37;
        var up = 38;
        var right = 39;
        var down = 40;
        var wait = 87; 
        var retval = new Vector(0, 0);
        switch (evt.keyCode) {
            case wait:
                break; 
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
    TryMove: (board : CmdWnd) => Vector;
    constructor(move: (board: CmdWnd) => Vector, tok: string, ixRow: number, ixCol: number) {
        super(tok, ixRow, ixCol);
        this.TryMove = move; 
    }
}
class Vector {
    static VectorTowards(source: Token, target: Token, length: number): Vector {
        var totalDeltaRow: number = target.ixRow - source.ixRow;
        var totalDeltaCol: number = target.ixCol - source.ixCol;
        var retvalDeltaRow: number, retvalDeltaCol: number;
        if (totalDeltaRow == 0) {
            retvalDeltaRow = 0;
        } else if (totalDeltaRow < 0) {
            retvalDeltaRow = -1;
        } else {
            retvalDeltaRow = 1;
        }
        if (totalDeltaCol == 0) {
            retvalDeltaCol = 0;
        } else if (totalDeltaCol < 0) {
            retvalDeltaCol = -1;
        } else {
            retvalDeltaCol = 1;
        }
        return new Vector(retvalDeltaRow, retvalDeltaCol);
        //TODO fix length later
       
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
    static Add(a: Vector, b: Vector): Vector {
        return new Vector(a.deltaRow + b.deltaRow, a.deltaCol + b.deltaCol);
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
        this.Draw();
    }
    public OverwriteMessage(newMessageContents: string, existingMessageId: string) : boolean {
        var success: boolean = false; 
        try {
            var msg = this._contents[existingMessageId];
            msg.innerText = newMessageContents;
            success = true;
            this.Draw();
        }
        catch (e) {
            //empty block 
        }
        return success;
    }
    public Draw(): void {
        for (var key in Object.keys(this._contents)) {
            var keyVal = Object.keys(this._contents)[key];
            var el: HTMLElement = this._contents[keyVal] as HTMLElement; 
            if (el) {
                this._div.appendChild(el);
            }
        }
    }
}
class Move {
    _mover: Token;
    _board: CmdWnd;
    _vector: Vector;
    constructor(mover: Token, board: CmdWnd, vector: Vector) {
        this._mover = mover;
        this._board = board;
        this._vector = vector; 
    }
    Move(): boolean {
        return this._board.MoveToken(this._mover, this._vector.deltaRow, this._vector.deltaCol);
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
