import Decimal, { type DecimalSource } from "break_eternity.js";
import { player } from "./main";
import { D } from "./calc";

const abbSuffixes: Array<string> = ["","K","M","B","T","Qa","Qi","Sx","Sp","Oc","No","Dc","UDc","DDc","TDc","QaDc","QiDc","SxDc","SpDc","OcDc","NoDc","Vg"];
const letter: Array<string> = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];

const timeList = [
    { name: "pt",  stop: true,  amt: 5.39e-44 },
    { name: "qs",  stop: true,  amt: 1 / 1e30 },
    { name: "rs",  stop: true,  amt: 1 / 1e27 },
    { name: "ys",  stop: true,  amt: 1 / 1e24 },
    { name: "zs",  stop: true,  amt: 1 / 1e21 },
    { name: "as",  stop: true,  amt: 1 / 1e18 },
    { name: "fs",  stop: true,  amt: 1 / 1e15 },
    { name: "ps",  stop: true,  amt: 1 / 1e12 },
    { name: "ns",  stop: true,  amt: 1 / 1e9 },
    { name: "µs",  stop: true,  amt: 1 / 1e6 },
    { name: "ms",  stop: true,  amt: 1 / 1e3 },
    { name: "s",   stop: true,  amt: 1 },
    { name: "m",   stop: false, amt: 60 },
    { name: "h",   stop: false, amt: 3600 },
    { name: "d",   stop: false, amt: 86400 },
    { name: "mo",  stop: false, amt: 2592000 },
    { name: "y",   stop: false, amt: 3.1536e7 },
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

export const format = (number: DecimalSource, dec = 0, expdec = 3, notation = player.value.settings.notation): string => {
    if (Decimal.lt(number, 0)) return `-${format(Decimal.negate(number), dec, expdec)}`;
    if (Decimal.eq(number, 0)) return (0).toFixed(dec);
    if (Decimal.isNaN(number)) return "NaN";
    if (!Decimal.isFinite(number)) return "Infinity";
    try {
        switch (notation) {
            case 0: // mixed
                if (Decimal.gte(number, Decimal.pow10(player.value.settings.notationLimit)) && Decimal.lt(number, abbExp)) {
                    const abb = Decimal.log10(number).mul(0.33333333336666665).floor();
                    return `${Decimal.div(number, abb.mul(3).pow10()).toNumber().toFixed(expdec)} ${abbSuffixes[abb.toNumber()]}`;
                }
                return format(number, dec, expdec, 1);
            case 1: // sci
                if (Decimal.lt(number, Decimal.pow10(player.value.settings.notationLimit).neg().pow10())) {
                    return `e${format(Decimal.log10(number), 0, expdec)}`;
                } else if (Decimal.lt(number, 0.001)) {
                    const exp = Decimal.log10(number).mul(1.00000000001).floor();
                    return `${Decimal.div(number, exp.pow10()).toNumber().toFixed(expdec)}e${format(exp, 0, expdec)}`;
                } else if (Decimal.lt(number, Decimal.pow10(player.value.settings.notationLimit))) {
                    return numberWithCommas(new Decimal(number).toNumber().toFixed(dec));
                } else if (Decimal.lt(number, Decimal.pow10(player.value.settings.notationLimit).pow10())) {
                    const exp = Decimal.log10(number).mul(1.00000000001).floor();
                    return `${Decimal.div(number, exp.pow10()).toNumber().toFixed(expdec)}e${format(exp, 0, expdec)}`;
                } else if (Decimal.lt(number, "10^^7")) {
                    return `e${format(Decimal.log10(number), dec, expdec)}`;
                } else {
                    return `F${format(Decimal.slog(number), Math.max(dec, 3), expdec)}`;
                }
            case 2: // letters
                if (Decimal.gte(number, 1e3) && Decimal.lt(number, Decimal.pow10(player.value.settings.notationLimit).pow10())) {
                    const abb = Decimal.log10(number).mul(0.33333333336666665).floor();
                    return `${Decimal.div(number, abb.mul(3).pow10()).toNumber().toFixed(expdec)} ${formatLetter(abb.sub(1), "")}`;
                }
                return format(number, dec, expdec, 1);
            case 3:
                if (Decimal.gte(number, "10^^7")) {
                    return `IM^${format(Decimal.slog(number).sub(2.0221273333), Math.max(dec, 3), expdec, 0)}`;
                }
                if (Decimal.gte(number, Number.MAX_VALUE)) {
                    if (Decimal.lt(number, "2.8e95173")) {
                        return `${format(Decimal.log10(number).div(308).sub(0.75).pow10(), expdec, expdec, 0)} ᴵᴾ`;
                    } else if (Decimal.lt(number, "e542945439")) {
                        return `${format(Decimal.log10(number).div(308).sub(0.75).div(308).sub(0.7).pow_base(5), expdec, expdec, 0)} ᴱᴾ`;
                    } else if (Decimal.lt(number, "e181502546658")) {
                        return `${format(Decimal.log10(number).div(308).sub(0.75).div(308).sub(0.7).mul(0.6989700043360187).div(4000).sub(1).pow_base(1000), expdec, expdec, 0)} ᴿᴹ`;
                    } else {
                        const rm = Decimal.log10(number).div(308).sub(0.75).div(308).sub(0.7).mul(0.6989700043360187).div(4000).sub(1).mul(3);
                        return `${format(rm.sub(1000).pow(2).mul(rm.sub(100000).max(1).pow(0.2)), expdec, expdec, Decimal.lt(number, "ee148.37336") ? 0 : 3)} ᴵᴹ`;
                    }
                }
                return format(number, dec, expdec, 1);
            case 4:
                return `Rank ${format(Decimal.max(number, 10).div(10).log(2).sqrt().add(1), dec, expdec, 1)}`;
            default:
                throw new Error(`${player.value.settings.notation} is not a valid notation index!`);
        }
    } catch(e) {
        console.warn(
            `There was an error trying to get player.settings.notation! Falling back to Mixed Scientific...\n\nIf you have an object that has an item that uses format() without it being a get or function, this will occurr on load!`
        );
        console.warn(e);
        if (Decimal.lt(number, Decimal.pow10(player.value.settings.notationLimit).neg().pow10())) {
            return `e${format(Decimal.log10(number), 0, expdec)}`;
        } else if (Decimal.lt(number, 0.001)) {
            const exp = Decimal.log10(number).mul(1.00000000001).floor();
            return `${Decimal.div(number, exp.pow10()).toNumber().toFixed(expdec)}e${format(exp, 0, expdec)}`;
        } else if (Decimal.lt(number, Decimal.pow10(player.value.settings.notationLimit))) {
            return numberWithCommas(new Decimal(number).toNumber().toFixed(dec));
        } else if (Decimal.lt(number, abbExp)) {
            const abb = Decimal.log10(number).mul(0.33333333336666665).floor();
            return `${Decimal.div(number, abb.mul(3).pow10()).toNumber().toFixed(expdec)} ${abbSuffixes[abb.toNumber()]}`;
        } else if (Decimal.lt(number, Decimal.pow10(player.value.settings.notationLimit).pow10())) {
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
    if (Decimal.eq(number, 0)) return `${(0).toFixed(dec)}s`;
    if (Decimal.isNaN(number)) return "NaN";
    if (!Decimal.isFinite(number)) return "Infinity";
    let lim = 0;
    let str = "";
    let end = false;
    let prevNumber;
    for (let i = timeList.length - 1; i >= 0; i--) {
        if (lim >= limit) {
            break;
        }
        if (Decimal.gte(number, timeList[i].amt)) {
            end = lim + 1 >= limit || timeList[i].stop;
            prevNumber = Decimal.div(number, timeList[i].amt);
            str = `${str} ${format(prevNumber.sub(end ? 0 : 0.5), end ? dec : 0, expdec)}${timeList[i].name}`;
            number = Decimal.sub(number, prevNumber.floor().mul(timeList[i].amt));
            lim++;
            if (timeList[i].stop || prevNumber.gte(Decimal.pow10(player.value.settings.notationLimit))) {
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
