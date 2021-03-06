﻿/// <reference path="dungeonmanager.ts" />
/// <reference path="gamecalculators.ts" />
/// <reference path="cmd.ts" />
namespace SomeNamespace {
    export class Foo { }
}
class Greeter {
    element: HTMLElement;
    span: HTMLElement;
    timerToken: number;

    constructor(element: HTMLElement) {
        this.element = element;
        this.element.innerHTML += "The time is: ";
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this.span.innerText = new Date().toUTCString();
    }

    start() {
        this.timerToken = setInterval(() => this.span.innerHTML = new Date().toUTCString(), 500);
    }

    stop() {
        clearTimeout(this.timerToken);
    }

}

class Mover {
    element: HTMLElement;
    constructor(el: HTMLElement) {
        this.element = el;
        var para: HTMLElement = document.createElement('p');
        para.innerHTML = "Good morning, sir, if indeed a good morning it is!</br>";
        var node: Node = this.element.appendChild(para); 
        para.onclick = () => {
            para.innerHTML += "Stop touching me! </br>"; 
        };
    }
}


class Sorter {
    contents: Sortable[];
    parent: HTMLElement;
    constructor(parent: HTMLElement) {
        this.parent = parent; 
    }
    GetMaxSortOrder(): number {
        var max: number = -1;
        for (var i = 0; i < this.contents.length; i++) {
            if (this.contents[i].sortIx > max) {
                max = this.contents[i].sortIx; 
            }
        }
        return max + 1; 
    }
    Insert(el: HTMLElement): void {
        if (!this.contents) {
            this.contents = [];
        }
        this.contents.push(new Sortable(el, this.GetMaxSortOrder()));
        this.Sort();
        this.Draw();
    }
    Sort(): void {
        this.contents.sort((el1, el2) => { return el1.sortIx - el2.sortIx; });
    }
    Draw(): void {
        console.log("Entered draw");
        this.parent.innerHTML = "";
        for (var i = 0; i < this.contents.length; i++) {
            this.parent.appendChild(this.contents[i].element); 
        }
    }
    Shuffle(): void {
        for (var i = 0; i < this.contents.length; i++) {
            var rnd = Math.floor(Math.random() * (i + 1));
            var rnd2 = Math.floor(Math.random() * (i + 1));
            //switch the sortixes of rnd and rnd2. 
            var tmp = this.contents[rnd].sortIx;
            this.contents[rnd].sortIx = this.contents[rnd2].sortIx;
            this.contents[rnd2].sortIx = tmp; 
        }
        this.Sort();
        this.Draw();
    }
    GetCount(): number {
        if (this.contents)
        {
            return this.contents.length;
        }
        else
        {
            return 0;
        }
    }
}
class Sortable {
    element: HTMLElement;
    sortIx: number;
    constructor(el: HTMLElement, startingIx : number) {
        this.element = el;
        this.sortIx = startingIx;
    }

}
function handleKeyDown(evt: KeyboardEvent, cmdWnd: CmdWnd, tok : Token): void{
    var left = 37; 
    var up = 38;
    var right = 39; 
    var down = 40;
    switch (evt.keyCode) {
        case left:
            cmdWnd.MoveToken(tok, 0, -1);
            break;
        case right: 
            cmdWnd.MoveToken(tok, 0, 1);
            break; 
        case up:
            cmdWnd.MoveToken(tok, -1, 0);
            break;
        case down:
            cmdWnd.MoveToken(tok, 1, 0);
            break; 
    }
    if (cmdWnd.CheckIsVictory()) {
        var again = confirm("You won! Would you like to play again?");
        if (again) {
            var mazer = document.getElementById('drawMaze');
            mazer.click();
        }
    }
}


window.onload = () => {

    var el = document.getElementById('content');
    var greeter = new Greeter(el);
    var sortableParent = document.getElementById('sorter');
    var sorter = new Sorter(sortableParent);
    var adder = document.getElementById('adder');
    adder.onclick = () => {
        console.log("Click entered"); 
        var newEl = document.createElement('li');
        newEl.innerHTML = new Date().toUTCString() + " " + sorter.GetCount();
        var sortable = sorter.Insert(newEl);
    }
    var shuffler = document.getElementById('shuffler');
    shuffler.onclick = () => {
        console.log("should have shuffled.");
        sorter.Shuffle();
    }
    var board = document.getElementById('board');
    var drawer = document.getElementById('drawGame');
    var stats = document.getElementById('stats');
    var statsDiv = new StatsDiv(stats);
    var cmdWnd: CmdWnd;
    var ang: Token = new Token("@", 7, 35);
    var wall: Wall = new Wall(10, 10, 1, 34); 
    var wall2: Wall = new Wall(14, 37, 5, 1); 
    drawer.onclick = () => {
        cmdWnd = new CmdWnd(board);
        cmdWnd.Draw();
        cmdWnd.AddToken(ang);
        wall.AddToBoard(cmdWnd);
        wall2.AddToBoard(cmdWnd);
        cmdWnd.Draw();
        var game: DungeonManager = new DungeonManager(cmdWnd, statsDiv, ang, 25, 0);
        window.onkeydown = (ev: KeyboardEvent) => {
            game.ActOnKeyDown(ev);
        };
    }
    greeter.start();

    var mazer = document.getElementById('drawMaze');
    mazer.onclick = () => {
        cmdWnd = new CmdWnd(board);
        var mazeAng: Token = new Token("@", cmdWnd.NUM_ROWS - 1, 0);
        cmdWnd.AddToken(mazeAng);
        Wall.MakeWallGrid(cmdWnd);
        cmdWnd.Draw();
        cmdWnd.ClearGridAt(mazeAng.ixRow, mazeAng.ixCol + 1);
        cmdWnd.ClearGridAt(mazeAng.ixRow - 1, mazeAng.ixCol);
        for (var i = 1; i < Math.min(cmdWnd.NUM_COLS - 50, 20); i++) {
            cmdWnd.ClearGridAt(mazeAng.ixRow, i); 
        }
        cmdWnd.Draw();
        var dfs: CalculatorApi = new CalculatorApi(cmdWnd, mazeAng);
        
        var goal: Token = new Token('*', 0, cmdWnd.NUM_COLS - 1);
        
        var ready: boolean = false; 
        var countRandomDeletions: number = 50;
        var maxReps = 100; 
        var curReps = 0;  
        while (!ready) {
            if (curReps++ > maxReps) {
                break;
            }
            var dfs: CalculatorApi = new CalculatorApi(cmdWnd, mazeAng);
            ready = dfs.IsReachable(goal);
            console.log("After " + curReps + " there are " + dfs.reachable.filter(function (el) {
                return el;
            }).length + " reachable squares");
            if (!ready) {
                cmdWnd.ClearNRandomGridSquares(countRandomDeletions);
            }
        }
        function done() {
            cmdWnd.Draw();
            window.onkeydown = (ev: KeyboardEvent) => {
                handleKeyDown(ev, cmdWnd, mazeAng);
            }
        }
        cmdWnd.Draw();
        done();

    }
};