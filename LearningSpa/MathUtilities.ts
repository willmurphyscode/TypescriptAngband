class MathUtils {
    static RoundMagnitudeUp(input: number) {
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
    }
}