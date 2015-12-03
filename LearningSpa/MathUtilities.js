var MathUtils = (function () {
    function MathUtils() {
    }
    MathUtils.RoundMagnitudeUp = function (input) {
        if (Math.round(input) == input) {
            return input;
        }
        else if (input > 0) {
            return Math.ceil(input);
        }
        else if (input < 0) {
            return Math.floor(input);
        }
        throw Error("Your number operation has a bug.");
    };
    return MathUtils;
})();
//# sourceMappingURL=mathutilities.js.map