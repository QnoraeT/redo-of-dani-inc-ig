import Decimal, { type DecimalSource } from "break_eternity.js";
import { format } from "./format";

// ! DO NOT USE SCALE WHEN POWSCALE = 1 OR STR = 0, IT WILL BREAKKK
export const scale = (
    num: DecimalSource,
    type: number | string,
    inverse = false,
    start: DecimalSource,
    str: DecimalSource,
    powScale: DecimalSource
): Decimal => {
    if (Decimal.lte(num, start)) {
        return new Decimal(num);
    }
    str = Decimal.pow(powScale, str);
    switch (type) {
        // Divide
        case -1:
        case -1.1:
        case "L":
        case "L1":
            return inverse
                ? Decimal.pow(num, 2)
                        .add(Decimal.sub(str, 1).mul(start).mul(num).mul(4))
                        .sub(Decimal.sub(str, 1).mul(Decimal.pow(start, 2)).mul(4))
                        .add(Decimal.sub(str, 1).mul(start).mul(2))
                        .add(num)
                        .div(2)
                        .div(str)
                : Decimal.mul(str, num).add(
                        Decimal.mul(start, Decimal.sub(1, str)).mul(
                            Decimal.sub(2, Decimal.div(start, num))
                        )
                    );
        // Polynomial
        case 0:
        case 0.1:
        case "P":
        case "P1":
            return inverse
                ? Decimal.sub(num, start).mul(str).div(start).add(1).root(str).mul(start)
                : Decimal.div(num, start).pow(str).sub(1).mul(start).div(str).add(start);
        case 0.2: // alemaninc
        case "P2":
            return inverse
                ? Decimal.div(num, start).root(str).sub(1).mul(str).add(1).mul(start)
                : Decimal.div(num, start).sub(1).div(str).add(1).pow(str).mul(start);
        // Exponential
        case 1:
        case 1.1:
        case "E":
        case "E1":
            return inverse
                ? Decimal.min(num, Decimal.div(num, start).log(str).add(1).mul(start))
                : Decimal.max(num, Decimal.pow(str, Decimal.div(num, start).sub(1)).mul(start));
        case 1.2:
        case "E2":
            return inverse
                ? Decimal.mul(num, str).mul(str.ln()).div(start).lambertw().mul(start).div(str.ln())
                : Decimal.pow(str, Decimal.div(num, start).sub(1)).mul(num);
        case 1.3: // alemaninc
        case "E3":
            return inverse // poly exponential scaling
                ? Decimal.div(num, start).ln().mul(str.sub(1)).add(1).root(str.sub(1)).mul(start)
                : Decimal.div(num, start).pow(str.sub(1)).sub(1).div(str.sub(1)).exp().mul(start);
        // Semi-exponential
        case 2:
        case 2.1:
        case "SE":
        case "SE1":
            return inverse // steep scaling
                ? Decimal.pow(start, Decimal.sub(num, start).mul(str).add(start).log(start).root(str))
                : Decimal.pow(start, Decimal.log(num, start).pow(str)).sub(start).div(str).add(start);
        case 2.2:
        case "SE2": // very shallow scaling
            return inverse
                ? Decimal.pow(start, Decimal.log(num, start).sub(1).mul(str).add(1).root(str))
                : Decimal.pow(start, Decimal.log(num, start).pow(str).sub(1).div(str).add(1));
        // convergent
        case 3: // alemaninc
        case 3.1:
        case "C":
        case "C1":
            return inverse
                ? str.mul(num).add(Decimal.pow(start, 2)).sub(Decimal.mul(start, num).mul(2)).div(str.sub(num))
                : str.mul(num).sub(Decimal.pow(start, 2)).div(Decimal.sub(str, Decimal.mul(start, 2)).add(num));
        default:
            throw new Error(`Scaling type ${type} doesn't exist`);
    }
};

export const D = (x: DecimalSource) => {
    return new Decimal(x);
};

export const colorChange = (color: string, val: number, sat: number) => {
    // #ABCDEF format only
    if (color[0] === "#") {
        color = color.slice(1);
    }
    const colorInt = parseInt(color, 16);
    let r = ((colorInt >> 16) % 256) / 256;
    let g = ((colorInt >> 8) % 256) / 256;
    let b = (colorInt % 256) / 256;
    r = 1 - (1 - r) * sat;
    g = 1 - (1 - g) * sat;
    b = 1 - (1 - b) * sat;
    r = Math.min(255, r * val * 256);
    g = Math.min(255, g * val * 256);
    b = Math.min(255, b * val * 256);
    return (
        "#" +
        Math.floor(r).toString(16).padStart(2, "0") +
        Math.floor(g).toString(16).padStart(2, "0") +
        Math.floor(b).toString(16).padStart(2, "0")
    );
};

export const mixColor = (color: string, nextColor: string, type: string, time: number) => {
    if (color[0] === "#") {
        color = color.slice(1);
    }
    const colorInt = parseInt(color, 16);
    if (nextColor[0] === "#") {
        nextColor = nextColor.slice(1);
    }
    const nextColorInt = parseInt(nextColor, 16);
    let r = ((colorInt >> 16) % 256) / 256;
    let g = ((colorInt >> 8) % 256) / 256;
    let b = (colorInt % 256) / 256;
    const lr = ((nextColorInt >> 16) % 256) / 256;
    const lg = ((nextColorInt >> 8) % 256) / 256;
    const lb = (nextColorInt % 256) / 256;
    r = lerp(time, r, lr, type) * 256;
    g = lerp(time, g, lg, type) * 256;
    b = lerp(time, b, lb, type) * 256;
    return (
        "#" +
        Math.floor(r).toString(16).padStart(2, "0") +
        Math.floor(g).toString(16).padStart(2, "0") +
        Math.floor(b).toString(16).padStart(2, "0")
    );
};

export const gRC = (time: number, val: number, sat: number) => {
    const s = Math.floor(time) % 6;
    const t = time % 1;
    let r = 0;
    let g = 0;
    let b = 0;
    switch (s) {
        case 0:
            r = 1;
            g = t;
            break;
        case 1:
            r = 1 - t;
            g = 1;
            break;
        case 2:
            g = 1;
            b = t;
            break;
        case 3:
            g = 1 - t;
            b = 1;
            break;
        case 4:
            b = 1;
            r = t;
            break;
        case 5:
            b = 1 - t;
            r = 1;
            break;
        default:
            throw new Error("Wtf!! Why is there an invalid number?  [" + s + "]");
    }
    r = 1 - (1 - r) * sat;
    g = 1 - (1 - g) * sat;
    b = 1 - (1 - b) * sat;
    r = r * val * 255;
    g = g * val * 255;
    b = b * val * 255;
    return (
        "#" +
        Math.round(r).toString(16).padStart(2, "0") +
        Math.round(g).toString(16).padStart(2, "0") +
        Math.round(b).toString(16).padStart(2, "0")
    );
};

export const clamp = (num: number, min: number, max: number) => {
    return Math.min(Math.max(num, min), max);
};

export const lerp = (t: number, s: number, e: number, type = "Linear") => {
    if (isNaN(t)) {
        throw new Error(`malformed input [LERP]: ${t}, expecting f64`);
    }
    t = clamp(t, 0, 1);
    if (t === 0) {
        return s;
    }
    if (t === 1) {
        return e;
    }
    switch (type) {
        case "QuadIn":
            t = t * t;
            break;
        case "QuadOut":
            t = 1.0 - (1.0 - t) * (1.0 - t);
            break;
        case "CubeIn":
            t = t * t * t;
            break;
        case "CubeOut":
            t = 1.0 - (1.0 - t) * (1.0 - t) * (1.0 - t);
            break;
        case "Smooth":
            t = 6 * t ** 5 - 15 * t ** 4 + 10 * t ** 3;
            break;
        case "Sine":
            t = Math.sin((t * Math.PI) / 2) ** 2;
            break;
        default:
            break;
    }
    return s * (1 - t) + e * t;
};

export const rand = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
};

export const intRand = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
};

export const expQuadCostGrowth = (
    x: DecimalSource,
    a: DecimalSource,
    b: DecimalSource,
    c: DecimalSource,
    exp: DecimalSource,
    inv: boolean
) => {
    return inv
        ? inverseQuad(
                Decimal.layeradd10(x, -exp).log10(),
                Decimal.log10(a),
                Decimal.log10(b),
                Decimal.log10(c)
            )
        : Decimal.pow(a, Decimal.pow(x, 2)).mul(Decimal.pow(b, x)).mul(c).layeradd10(exp);
};

export const inverseQuad = (
    x: DecimalSource,
    a: DecimalSource,
    b: DecimalSource,
    c: DecimalSource
) => {
    return Decimal.eq(a, 0)
        ? Decimal.sub(x, c).div(b)
        : Decimal.sub(x, c)
                .mul(a)
                .mul(4)
                .add(Decimal.pow(b, 2))
                .sqrt()
                .sub(b)
                .div(Decimal.mul(a, 2));
};

// ! don't use this smh
export const inverseCube = (
    x: DecimalSource,
    a: DecimalSource,
    b: DecimalSource,
    c: DecimalSource,
    d: DecimalSource,
    tol = 1e-10
) => {
    // inverse of ax^3+bx^2+cx+d
    x = new Decimal(x);
    a = new Decimal(a);
    b = new Decimal(b);
    c = new Decimal(c);
    d = new Decimal(d);
    let res = x.cbrt();
    let r;

    // newton's method
    for (let i = 0; i < 100; ++i) {
        r = res.sub(
            res
                .pow(3)
                .mul(a)
                .add(res.pow(2).mul(b))
                .add(res.mul(c))
                .add(d)
                .sub(x)
                .div(res.pow(2).mul(a).mul(3).add(res.mul(b).mul(2)).add(c))
        );
        if (res.sub(r).abs().lt(tol)) {
            return r;
        }
        res = r;
    }
    console.warn(`inverseCube couldn't finish converging! (Final value: ${format(res)})`);
    return res;
};

export const inverseFact = (x: DecimalSource) => {
    if (Decimal.gte(x, "ee18")) {
        return Decimal.log10(x);
    }
    if (Decimal.gte(x, "ee4")) {
        return Decimal.log10(x).div(Decimal.log10(x).log10());
    }
    return Decimal.div(x, 2.5066282746310002).ln().div(Math.E).lambertw().add(1).exp().sub(0.5);
};

/**
 * This solves the product
 * Product of n=0 to x of a+bn
 * inverse is with respect to x
 * @param {Decimal} x
 * @param {Decimal} a
 * @param {Decimal} b
 */
export const linearIncreaseMulti = (x: DecimalSource, a: DecimalSource, b: DecimalSource) => {
    // i cannot find a good inverse for this
    return Decimal.pow(b, Decimal.add(x, 1))
        .mul(Decimal.div(a, b).add(x).factorial())
        .div(Decimal.div(a, b).factorial())
        .div(b);
};

export const smoothPoly = (
    x: DecimalSource,
    poly: DecimalSource,
    start: DecimalSource,
    inverse: boolean
) => {
    return inverse
        ? Decimal.add(x, Decimal.div(start, poly))
                .mul(Decimal.mul(poly, Decimal.pow(start, Decimal.sub(poly, 1))))
                .root(poly)
                .sub(start)
        : Decimal.add(x, start)
                .pow(poly)
                .div(Decimal.mul(poly, Decimal.pow(start, Decimal.sub(poly, 1))))
                .sub(Decimal.div(start, poly));
};

export const smoothExp = (x: DecimalSource, exp: DecimalSource, inv: boolean) => {
    return inv
        ? Decimal.mul(x, Decimal.ln(exp)).add(1).log(exp)
        : Decimal.pow(exp, x).sub(1).div(Decimal.ln(exp));
};

export const sumHarmonicSeries = (x: DecimalSource) => {
    if (Decimal.lt(x, 1)) {
        return D(0);
    }
    return Decimal.ln(x)
        .add(0.5772156649015329)
        .add(Decimal.div(0.5, x))
        .sub(Decimal.div(1, Decimal.pow(x, 2).mul(12)))
        .add(Decimal.div(1, Decimal.pow(x, 4).mul(120)));
};

/**
 * this only works fine on exponentials (type a^x^b with b >= 1 and a >= ~1.05) and higher
 * @param {Function} target
 * @param {Function} cost
 * @param {Decimal} resource
 * @param {Decimal} bought
 */
export const buyMax = (
    target: Function,
    cost: Function,
    resource: DecimalSource,
    bought: DecimalSource
) => {
    if (
        target(resource).lt(Number.MAX_SAFE_INTEGER) &&
        Decimal.lt(resource, Decimal.pow10(Number.MAX_SAFE_INTEGER))
    ) {
        let currentBought = target(resource).sub(9).floor().max(bought);
        let currCost = cost(currentBought);
        for (let i = 0; i < 10; i++) {
            if (Decimal.lt(resource, currCost)) {
                break;
            }
            resource = Decimal.sub(resource, currCost);
            currentBought = currentBought.add(1);
            bought = currentBought;
            currCost = cost(currentBought);
        }
    } else {
        const currentBought = target(resource).floor().add(1).max(bought);
        bought = currentBought;
    }
    return {
        bought: bought,
        resource: resource
    };
};

export const linearAdd = (
    num: DecimalSource,
    base: DecimalSource,
    growth: DecimalSource,
    inverse: boolean
) => {
    if (Decimal.eq(base, growth)) {
        return inverse
            ? Decimal.mul(num, 8).add(base).sqrt().div(Decimal.sqrt(base).mul(2)).sub(0.5)
            : Decimal.add(num, 1).mul(num).div(2).mul(base);
    }

    return inverse
        ? Decimal.sub(growth, Decimal.mul(base, 2))
                .pow(2)
                .add(Decimal.mul(num, growth).mul(8))
                .sqrt()
                .sub(growth)
                .sub(Decimal.mul(base, 2))
                .div(Decimal.mul(growth, 2))
        : Decimal.mul(growth, num).add(Decimal.mul(base, 2)).mul(Decimal.add(num, 1)).div(2);
};

export const logPowSoftcap = (num: DecimalSource, start: DecimalSource, inv: boolean) => {
    if (Decimal.lte(num, start)) {
        return new Decimal(num);
    }
    num = Decimal.log10(num);
    start = Decimal.log10(start);
    return inv
        ? Decimal.sub(num, start)
                .div(Decimal.ln(start))
                .add(start)
                .div(start)
                .pow_base(start)
                .pow10()
        : Decimal.log(num, start).mul(start).sub(start).mul(Decimal.ln(start)).add(start).pow10();
};
