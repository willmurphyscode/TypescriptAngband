var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="mathutilities.ts" />
/// <reference path="gamecalculators.ts" />
/// <reference path="cmd.ts" />
var DungeonManager = (function () {
    function DungeonManager(board, statsDiv, player, countNpcs, countWalls) {
        this._npcToken = ['o', 's'];
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
    DungeonManager.prototype._insertTiger = function () {
        var ixRow = Math.floor(Math.random() * this._gameBoard.NUM_ROWS);
        var ixCol = Math.floor(Math.random() * this._gameBoard.NUM_COLS);
        var str = "T";
        var player = this._player;
        var tiger = new Npc(function (board) {
            var pursuit = Vector.VectorTowards(this, player, 2);
            return pursuit;
        }, str, ixRow, ixCol);
        this._npcs.push(tiger);
        this._gameBoard.AddToken(tiger);
    };
    DungeonManager.prototype._insertRandomNpc = function () {
        var str = this._npcToken[Math.floor(Math.random() * this._npcToken.length)];
        var ixRow = Math.floor(Math.random() * this._gameBoard.NUM_ROWS);
        var ixCol = Math.floor(Math.random() * this._gameBoard.NUM_COLS);
        var newNpc = new Npc(function (board) {
            var randomMove = Vector.RandomVector();
            //board.MoveToken(this, randomMove.deltaRow, randomMove.deltaCol);
            return randomMove;
        }, str, ixRow, ixCol);
        this._npcs.push(newNpc);
        this._gameBoard.AddToken(newNpc);
    };
    DungeonManager.prototype.ActOnKeyDown = function (evt) {
        var code = evt.keyCode;
        var str_key = evt.key;
        var shift = evt.shiftKey;
        var playerMove = this._getPlayerMovement(evt);
        var collisions = [];
        var moves = [];
        if (!playerMove.IsNoOp()) {
            var moved = this._gameBoard.MoveToken(this._player, playerMove.deltaRow, playerMove.deltaCol);
            if (!moved) {
                var impacted = this._checkCollision(this._player, playerMove);
                if (impacted) {
                    collisions.push(new Collision(this._player, impacted));
                }
            }
        }
        this._gameBoard.UpdateContents();
        if (this._triggersNpcMoves(evt)) {
            for (var ixNpc = 0; ixNpc < this._npcs.length; ixNpc++) {
                var npcToMove = this._npcs[ixNpc];
                var npcMove = npcToMove.TryMove(this._gameBoard);
                if (!npcMove.IsNoOp()) {
                    var collided = this._checkCollision(npcToMove, npcMove);
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
    };
    DungeonManager.prototype.Defeated = function () {
        alert("Oh dear, you have been mauled by a tiger. You lose.");
    };
    DungeonManager.prototype._handleCollision = function (collision) {
        //debug
        console.log("A " + collision.initiator.token + " hit a " + collision.collided.token + "!");
        //endebug
        if (collision.initiator.token == "T" && collision.collided == this._player) {
            this._playerHp--;
        }
        this._stats.OverwriteMessae("HP: " + this._playerHp + "/10", "hp");
    };
    DungeonManager.prototype._handleMove = function (move) {
        move.Move();
    };
    DungeonManager.prototype._checkCollision = function (mover, move) {
        var retval = null;
        var newIxRow = mover.ixRow + move.deltaRow;
        var newIxCol = mover.ixCol + move.deltaCol;
        var collided;
        var candidates = this._npcs.filter(function (el) {
            return el.ixRow == newIxRow && el.ixCol == newIxCol;
        });
        if (this._player.ixRow == newIxRow && this._player.ixCol == newIxCol) {
            retval = this._player;
        }
        if (candidates && candidates.length > 0) {
            retval = candidates[0];
        }
        return retval;
    };
    DungeonManager.prototype._handleCollisionByPlayer = function (initiater, collided) {
        this._gameBoard.ClearGridAt(collided.ixRow, collided.ixCol);
        var collidedNpc = collided;
        var ixToDel = this._npcs.indexOf(collidedNpc);
        if (ixToDel >= 0) {
            this._npcs.splice(ixToDel, 1);
        }
        else {
            throw Error("Collision with nonexistent token.");
        }
        this._gameBoard.Draw();
    };
    DungeonManager.prototype._triggersNpcMoves = function (evt) {
        var wait = 87;
        return (evt.keyCode == wait) || !(this._getPlayerMovement(evt).IsNoOp());
    };
    DungeonManager.prototype._getPlayerMovement = function (evt) {
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
    };
    DungeonManager.prototype._handleKeyDown = function (evt) {
    };
    return DungeonManager;
})();
var Npc = (function (_super) {
    __extends(Npc, _super);
    function Npc(move, tok, ixRow, ixCol) {
        _super.call(this, tok, ixRow, ixCol);
        this.TryMove = move;
    }
    return Npc;
})(Token);
var Vector = (function () {
    function Vector(deltaRow, deltaCol) {
        this.deltaRow = deltaRow;
        this.deltaCol = deltaCol;
    }
    Vector.VectorTowards = function (source, target, length) {
        var totalDeltaRow = target.ixRow - source.ixRow;
        var totalDeltaCol = target.ixCol - source.ixCol;
        var retvalDeltaRow, retvalDeltaCol;
        if (totalDeltaRow == 0) {
            retvalDeltaRow = 0;
        }
        else if (totalDeltaRow < 0) {
            retvalDeltaRow = -1;
        }
        else {
            retvalDeltaRow = 1;
        }
        if (totalDeltaCol == 0) {
            retvalDeltaCol = 0;
        }
        else if (totalDeltaCol < 0) {
            retvalDeltaCol = -1;
        }
        else {
            retvalDeltaCol = 1;
        }
        return new Vector(retvalDeltaRow, retvalDeltaCol);
        //TODO fix length later
        var sqrdLength = length * length;
        var sqrdDeltaRow = totalDeltaRow * totalDeltaRow;
        var sqrdDeltaCol = totalDeltaCol * totalDeltaCol;
        var sqrdRatio = Math.min(sqrdLength / (sqrdDeltaRow + sqrdDeltaCol), 1);
        var ratio = Math.sqrt(sqrdRatio);
        var retvalDeltaRow = MathUtils.RoundMagnitudeUp(totalDeltaRow * ratio);
        var retvalDeltaCol = MathUtils.RoundMagnitudeUp(totalDeltaCol * ratio);
        return new Vector(retvalDeltaRow, retvalDeltaCol);
    };
    Vector.CoinFlip = function () {
        var num = Math.random();
        return (num < 0.5 ? 1 : -1);
    };
    Vector.RandomVector = function () {
        var deltaRow = Math.floor(Math.random() + 0.5) * Vector.CoinFlip();
        var deltaCol = Math.floor(Math.random() + 0.5) * Vector.CoinFlip();
        return new Vector(deltaRow, deltaCol);
    };
    Vector.Add = function (a, b) {
        return new Vector(a.deltaRow + b.deltaRow, a.deltaCol + b.deltaCol);
    };
    Vector.prototype.IsNoOp = function () {
        return this.deltaRow == 0 && this.deltaCol == 0;
    };
    return Vector;
})();
var StatsDiv = (function () {
    function StatsDiv(div) {
        this._div = div;
        this._contents = {};
    }
    StatsDiv.prototype.AppendMessage = function (messageContents, messageId) {
        var msg = document.createElement('p');
        msg.innerText = messageContents;
        msg.id = messageId;
        this._contents[messageId] = msg;
        this.Draw();
    };
    StatsDiv.prototype.OverwriteMessae = function (newMessageContents, existingMessageId) {
        var success = false;
        try {
            var msg = this._contents[existingMessageId];
            msg.innerText = newMessageContents;
            success = true;
            this.Draw();
        }
        catch (e) {
        }
        return success;
    };
    StatsDiv.prototype.Draw = function () {
        for (var key in Object.keys(this._contents)) {
            var keyVal = Object.keys(this._contents)[key];
            var el = this._contents[keyVal];
            if (el) {
                this._div.appendChild(el);
            }
        }
    };
    return StatsDiv;
})();
var Move = (function () {
    function Move(mover, board, vector) {
        this._mover = mover;
        this._board = board;
        this._vector = vector;
    }
    Move.prototype.Move = function () {
        return this._board.MoveToken(this._mover, this._vector.deltaRow, this._vector.deltaCol);
    };
    return Move;
})();
var Collision = (function () {
    function Collision(initiator, collided) {
        this.initiator = initiator;
        this.collided = collided;
        this.ixRow = collided.ixRow;
        this.ixCol = collided.ixCol;
    }
    return Collision;
})();
//# sourceMappingURL=dungeonmanager.js.map