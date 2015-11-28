/// <reference path="cmd.ts" />
var SomeNamespace;
(function (SomeNamespace) {
    var Foo = (function () {
        function Foo() {
        }
        return Foo;
    })();
    SomeNamespace.Foo = Foo;
})(SomeNamespace || (SomeNamespace = {}));
var Greeter = (function () {
    function Greeter(element) {
        this.element = element;
        this.element.innerHTML += "The time is: ";
        this.span = document.createElement('span');
        this.element.appendChild(this.span);
        this.span.innerText = new Date().toUTCString();
    }
    Greeter.prototype.start = function () {
        var _this = this;
        this.timerToken = setInterval(function () { return _this.span.innerHTML = new Date().toUTCString(); }, 500);
    };
    Greeter.prototype.stop = function () {
        clearTimeout(this.timerToken);
    };
    return Greeter;
})();
var Mover = (function () {
    function Mover(el) {
        this.element = el;
        var para = document.createElement('p');
        para.innerHTML = "Good morning, sir, if indeed a good morning it is!</br>";
        var node = this.element.appendChild(para);
        para.onclick = function () {
            para.innerHTML += "Stop touching me! </br>";
        };
    }
    return Mover;
})();
var Sorter = (function () {
    function Sorter(parent) {
        this.parent = parent;
    }
    Sorter.prototype.GetMaxSortOrder = function () {
        var max = -1;
        for (var i = 0; i < this.contents.length; i++) {
            if (this.contents[i].sortIx > max) {
                max = this.contents[i].sortIx;
            }
        }
        return max + 1;
    };
    Sorter.prototype.Insert = function (el) {
        if (!this.contents) {
            this.contents = [];
        }
        this.contents.push(new Sortable(el, this.GetMaxSortOrder()));
        this.Sort();
        this.Draw();
    };
    Sorter.prototype.Sort = function () {
        this.contents.sort(function (el1, el2) { return el1.sortIx - el2.sortIx; });
    };
    Sorter.prototype.Draw = function () {
        console.log("Entered draw");
        this.parent.innerHTML = "";
        for (var i = 0; i < this.contents.length; i++) {
            this.parent.appendChild(this.contents[i].element);
        }
    };
    Sorter.prototype.Shuffle = function () {
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
    };
    Sorter.prototype.GetCount = function () {
        if (this.contents) {
            return this.contents.length;
        }
        else {
            return 0;
        }
    };
    return Sorter;
})();
var Sortable = (function () {
    function Sortable(el, startingIx) {
        this.element = el;
        this.sortIx = startingIx;
    }
    return Sortable;
})();
function handleKeyDown(evt, cmdWnd, tok) {
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
}
window.onload = function () {
    var el = document.getElementById('content');
    var greeter = new Greeter(el);
    var sortableParent = document.getElementById('sorter');
    var sorter = new Sorter(sortableParent);
    var adder = document.getElementById('adder');
    adder.onclick = function () {
        console.log("Click entered");
        var newEl = document.createElement('li');
        newEl.innerHTML = new Date().toUTCString() + " " + sorter.GetCount();
        var sortable = sorter.Insert(newEl);
    };
    var shuffler = document.getElementById('shuffler');
    shuffler.onclick = function () {
        console.log("should have shuffled.");
        sorter.Shuffle();
    };
    var board = document.getElementById('board');
    var drawer = document.getElementById('drawGame');
    var cmdWnd;
    var ang = new Token("@", 7, 35);
    var wall = new Wall(10, 10, 1, 34);
    var wall2 = new Wall(14, 37, 5, 1);
    drawer.onclick = function () {
        cmdWnd = new CmdWnd(board);
        cmdWnd.Draw();
        cmdWnd.AddToken(ang);
        wall.AddToBoard(cmdWnd);
        wall2.AddToBoard(cmdWnd);
    };
    greeter.start();
    window.onkeydown = function (ev) {
        handleKeyDown(ev, cmdWnd, ang);
    };
};
//# sourceMappingURL=app.js.map