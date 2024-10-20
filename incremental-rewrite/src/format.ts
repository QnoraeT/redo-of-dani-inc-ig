import Decimal, { type DecimalSource } from "break_eternity.js";
import { player } from "./main";
import { D } from "./calc";

const abbSuffixes: Array<string> = [
    "",
    "K",
    "M",
    "B",
    "T",
    "Qa",
    "Qi",
    "Sx",
    "Sp",
    "Oc",
    "No",
    "Dc",
    "UDc",
    "DDc",
    "TDc",
    "QaDc",
    "QiDc",
    "SxDc",
    "SpDc",
    "OcDc",
    "NoDc",
    "Vg"
];
const letter: Array<string> = [
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z"
];

const timeList = [
    { name: "pt", stop: true, amt: 5.39e-44 },
    { name: "qs", stop: true, amt: 1 / 1e30 },
    { name: "rs", stop: true, amt: 1 / 1e27 },
    { name: "ys", stop: true, amt: 1 / 1e24 },
    { name: "zs", stop: true, amt: 1 / 1e21 },
    { name: "as", stop: true, amt: 1 / 1e18 },
    { name: "fs", stop: true, amt: 1 / 1e15 },
    { name: "ps", stop: true, amt: 1 / 1e12 },
    { name: "ns", stop: true, amt: 1 / 1e9 },
    { name: "µs", stop: true, amt: 1 / 1e6 },
    { name: "ms", stop: true, amt: 1 / 1e3 },
    { name: "s", stop: true, amt: 1 },
    { name: "m", stop: false, amt: 60 },
    { name: "h", stop: false, amt: 3600 },
    { name: "d", stop: false, amt: 86400 },
    { name: "mo", stop: false, amt: 2592000 },
    { name: "y", stop: false, amt: 3.1536e7 },
    { name: "mil", stop: false, amt: 3.1536e10 },
    { name: "uni", stop: false, amt: 4.320432e17 }
];

const abbExp = D(1e66);

function numberWithCommas(x: string): string {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

function formatLetter(remainingLogNumber: DecimalSource, string = ``): string {
    if (Decimal.gte(remainingLogNumber, 1e12)) {
        console.error(
            `formatLetter is taking in numbers greater than ee12! This *will* freeze the game!`
        );
        return ``;
    }
    if (Decimal.lt(remainingLogNumber, letter.length)) {
        return `${letter[new Decimal(remainingLogNumber).toNumber()]}${string}`;
    }
    return formatLetter(
        Decimal.div(remainingLogNumber, letter.length).sub(1).floor(),
        `${letter[new Decimal(remainingLogNumber).mod(letter.length).toNumber()]}${string}`
    );
}

export const format = (number: DecimalSource, dec = 0, expdec = 3): string => {
    if (Decimal.lt(number, 0)) return `-${format(Decimal.negate(number), dec, expdec)}`;
    if (Decimal.eq(number, 0)) return (0).toFixed(dec);
    if (Decimal.isNaN(number)) return "NaN";
    if (!Decimal.isFinite(number)) return "Infinity";
    try {
        switch (player.value.settings.notation) {
            case 0:
                if (Decimal.lt(number, "e-1e9")) {
                    return `e${format(Decimal.log10(number), 0, expdec)}`;
                } else if (Decimal.lt(number, 0.001)) {
                    const exp = Decimal.log10(number).mul(1.00000000001).floor();
                    return `${Decimal.div(number, exp.pow10()).toNumber().toFixed(expdec)}e${format(exp, 0, expdec)}`;
                } else if (Decimal.lt(number, 1e6)) {
                    return numberWithCommas(new Decimal(number).toNumber().toFixed(dec));
                } else if (Decimal.lt(number, abbExp)) {
                    const abb = Decimal.log10(number).mul(0.33333333336666665).floor();
                    return `${Decimal.div(number, abb.mul(3).pow10()).toNumber().toFixed(expdec)} ${abbSuffixes[abb.toNumber()]}`;
                } else if (Decimal.lt(number, "ee6")) {
                    const exp = Decimal.log10(number).mul(1.00000000001).floor();
                    return `${Decimal.div(number, exp.pow10()).toNumber().toFixed(expdec)}e${format(exp, 0, expdec)}`;
                } else if (Decimal.lt(number, "10^^7")) {
                    return `e${format(Decimal.log10(number), dec, expdec)}`;
                } else {
                    return `F${format(Decimal.slog(number), Math.max(dec, 3), expdec)}`;
                }
            case 1:
                if (Decimal.lt(number, "e-1e9")) {
                    return `e${format(Decimal.log10(number), 0, expdec)}`;
                } else if (Decimal.lt(number, 0.001)) {
                    const exp = Decimal.log10(number).mul(1.00000000001).floor();
                    return `${Decimal.div(number, exp.pow10()).toNumber().toFixed(expdec)}e${format(exp, 0, expdec)}`;
                } else if (Decimal.lt(number, 1e6)) {
                    return numberWithCommas(new Decimal(number).toNumber().toFixed(dec));
                } else if (Decimal.lt(number, "ee6")) {
                    const exp = Decimal.log10(number).mul(1.00000000001).floor();
                    return `${Decimal.div(number, exp.pow10()).toNumber().toFixed(expdec)}e${format(exp, 0, expdec)}`;
                } else if (Decimal.lt(number, "10^^7")) {
                    return `e${format(Decimal.log10(number), dec, expdec)}`;
                } else {
                    return `F${format(Decimal.slog(number), Math.max(dec, 3), expdec)}`;
                }
            case 2:
                if (Decimal.lt(number, "e-1e9")) {
                    return `e${format(Decimal.log10(number), 0, expdec)}`;
                } else if (Decimal.lt(number, 0.001)) {
                    const exp = Decimal.log10(number).mul(1.00000000001).floor();
                    return `${Decimal.div(number, exp.pow10()).toNumber().toFixed(expdec)}e${format(exp, 0, expdec)}`;
                } else if (Decimal.lt(number, 1e3)) {
                    return new Decimal(number).toNumber().toFixed(dec);
                } else if (Decimal.lt(number, "ee9")) {
                    const abb = Decimal.log10(number).mul(0.33333333336666665).floor();
                    return `${Decimal.div(number, abb.mul(3).pow10()).toNumber().toFixed(expdec)} ${formatLetter(abb.sub(1), "")}`;
                } else if (Decimal.lt(number, "10^^7")) {
                    return `e${format(Decimal.log10(number), dec, expdec)}`;
                } else {
                    return `F${format(Decimal.slog(number), Math.max(dec, 3), expdec)}`;
                }
            default:
                throw new Error(`${player.value.settings.notation} is not a valid notation index!`);
        }
    } catch(e) {
        console.warn(
            `There was an error trying to get player.settings.notation! Falling back to Mixed Scientific...\n\nIf you have an object that has an item that uses format() without it being a get or function, this will occurr on load!`
        );
        console.warn(e);
        if (Decimal.lt(number, "e-1e9")) {
            return `e${format(Decimal.log10(number), 0, expdec)}`;
        } else if (Decimal.lt(number, 0.001)) {
            const exp = Decimal.log10(number).mul(1.00000000001).floor();
            return `${Decimal.div(number, exp.pow10()).toNumber().toFixed(expdec)}e${format(exp, 0, expdec)}`;
        } else if (Decimal.lt(number, 1e6)) {
            return numberWithCommas(new Decimal(number).toNumber().toFixed(dec));
        } else if (Decimal.lt(number, abbExp)) {
            const abb = Decimal.log10(number).mul(0.33333333336666665).floor();
            return `${Decimal.div(number, abb.mul(3).pow10()).toNumber().toFixed(expdec)} ${abbSuffixes[abb.toNumber()]}`;
        } else if (Decimal.lt(number, "ee6")) {
            const exp = Decimal.log10(number).mul(1.00000000001).floor();
            return `${Decimal.div(number, exp.pow10()).toNumber().toFixed(expdec)}e${format(exp, 0, expdec)}`;
        } else if (Decimal.lt(number, "10^^7")) {
            return `e${format(Decimal.log10(number), dec, expdec)}`;
        } else {
            return `F${format(Decimal.slog(number), Math.max(dec, 3), expdec)}`;
        }
    }
};

export const formatPerc = (number: DecimalSource, dec = 3, expdec = 3): string => {
    if (Decimal.gte(number, 1000)) {
        return `${format(number, dec, expdec)}x`;
    } else {
        return `${format(Decimal.sub(100, Decimal.div(100, number)), dec, expdec)}%`;
    }
};

export const formatTime = (number: DecimalSource, dec = 0, expdec = 3, limit = 2): string => {
    if (Decimal.lt(number, 0)) return `-${formatTime(Decimal.negate(number), dec, expdec)}`;
    if (Decimal.eq(number, 0)) return (0).toFixed(dec);
    if (Decimal.isNaN(number)) return "NaN";
    if (!Decimal.isFinite(number)) return "Infinity";
    let lim = 0;
    let str = "";
    let end = false;
    for (let i = timeList.length - 1; i >= 0; i--) {
        if (lim >= limit) {
            break;
        }
        if (Decimal.gte(number, timeList[i].amt)) {
            end = lim + 1 >= limit || timeList[i].stop;
            str = `${str} ${format(Decimal.div(number, timeList[i].amt).sub(end ? 0 : 0.5), end ? dec : 0, expdec)}${timeList[i].name}`;
            number = Decimal.sub(
                number,
                Decimal.div(number, timeList[i].amt).floor().mul(timeList[i].amt)
            );
            lim++;
            if (timeList[i].stop) {
                break;
            }
        } else {
            if (i === 0) {
                return `${str} ${format(number, dec, expdec)}s`.slice(1);
            }
        }
    }
    return str.slice(1);
};
