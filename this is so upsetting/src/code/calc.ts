import Decimal, { type DecimalSource } from 'break_eternity.js'
import { format } from './format'

export const c = {
    d0:          Decimal.dZero,
    em4:         Decimal.fromComponents_noNormalize(1, 0, 0.0001),
    d0_0025:     Decimal.fromComponents_noNormalize(1, 0, 0.0025),
    em3:         Decimal.fromComponents_noNormalize(1, 0, 0.001),
    em2:         Decimal.fromComponents_noNormalize(1, 0, 0.01),
    d0_015:      Decimal.fromComponents_noNormalize(1, 0, 0.015),
    d0_02:       Decimal.fromComponents_noNormalize(1, 0, 0.02),
    dlog1_05:    Decimal.fromComponents_noNormalize(1, 0, Math.log10(1.05)), // 0.021189
    d0_022:      Decimal.fromComponents_noNormalize(1, 0, 0.022),
    d0_025:      Decimal.fromComponents_noNormalize(1, 0, 0.025),
    d0_03:       Decimal.fromComponents_noNormalize(1, 0, 0.03),
    d0_04:       Decimal.fromComponents_noNormalize(1, 0, 0.04),
    d0_05:       Decimal.fromComponents_noNormalize(1, 0, 0.05),
    d0_1:        Decimal.fromComponents_noNormalize(1, 0, 0.1),
    d0_15:       Decimal.fromComponents_noNormalize(1, 0, 0.15),
    d0_2:        Decimal.fromComponents_noNormalize(1, 0, 0.2),
    d0_25:       Decimal.fromComponents_noNormalize(1, 0, 0.25), 
    d0_252:      Decimal.fromComponents_noNormalize(1, 0, 0.252), 
    d0_255:      Decimal.fromComponents_noNormalize(1, 0, 0.255), 
    d0_26:       Decimal.fromComponents_noNormalize(1, 0, 0.26), 
    d0_275:      Decimal.fromComponents_noNormalize(1, 0, 0.275), 
    d0_3:        Decimal.fromComponents_noNormalize(1, 0, 0.3),
    d1div3:      Decimal.fromComponents_noNormalize(1, 0, 1/3), // 0.333333
    d0_35:       Decimal.fromComponents_noNormalize(1, 0, 0.35), 
    d0_36:       Decimal.fromComponents_noNormalize(1, 0, 0.36), 
    d0_375:      Decimal.fromComponents_noNormalize(1, 0, 0.375), 
    d0_4:        Decimal.fromComponents_noNormalize(1, 0, 0.4),
    d5div12:     Decimal.fromComponents_noNormalize(1, 0, 5/12), // 0.416667
    d0_5:        Decimal.fromComponents_noNormalize(1, 0, 0.5),
    d0_55:       Decimal.fromComponents_noNormalize(1, 0, 0.55), 
    dGamma:      Decimal.fromComponents_noNormalize(1, 0, 0.5772156649015329),
    d0_6:        Decimal.fromComponents_noNormalize(1, 0, 0.6),
    d2div3:      Decimal.fromComponents_noNormalize(1, 0, 2/3), // 0.666667
    d0_75:       Decimal.fromComponents_noNormalize(1, 0, 0.75),
    d0_788107:   Decimal.fromComponents_noNormalize(1, 0, 0.788107009300619),
    d0_8:        Decimal.fromComponents_noNormalize(1, 0, 0.8),
    d0_85:       Decimal.fromComponents_noNormalize(1, 0, 0.85),
    d0_875:      Decimal.fromComponents_noNormalize(1, 0, 0.875),
    d0_9:        Decimal.fromComponents_noNormalize(1, 0, 0.9),
    d0_95:       Decimal.fromComponents_noNormalize(1, 0, 0.95),
    d0_975:      Decimal.fromComponents_noNormalize(1, 0, 0.975),
    d1:          Decimal.dOne,
    d1_0002:     Decimal.fromComponents_noNormalize(1, 0, 1.0002),
    d1_0003:     Decimal.fromComponents_noNormalize(1, 0, 1.0003),
    d1_0004:     Decimal.fromComponents_noNormalize(1, 0, 1.0004),
    d1_0005:     Decimal.fromComponents_noNormalize(1, 0, 1.0005),
    d1_0009:     Decimal.fromComponents_noNormalize(1, 0, 1.0009),
    d1_001:      Decimal.fromComponents_noNormalize(1, 0, 1.001),
    d1_01:       Decimal.fromComponents_noNormalize(1, 0, 1.01),
    d1_02:       Decimal.fromComponents_noNormalize(1, 0, 1.02),
    d1_03:       Decimal.fromComponents_noNormalize(1, 0, 1.03),
    d1_025:      Decimal.fromComponents_noNormalize(1, 0, 1.025),
    d1_05:       Decimal.fromComponents_noNormalize(1, 0, 1.05),
    d1_075:      Decimal.fromComponents_noNormalize(1, 0, 1.075),
    d1_1:        Decimal.fromComponents_noNormalize(1, 0, 1.1),
    d10div9:     Decimal.fromComponents_noNormalize(1, 0, 10/9), // 1.111111
    d1_125:      Decimal.fromComponents_noNormalize(1, 0, 1.125),
    d8div7:      Decimal.fromComponents_noNormalize(1, 0, 8/7), // 1.142857
    d1_2:        Decimal.fromComponents_noNormalize(1, 0, 1.2),
    d1_23301886: Decimal.fromComponents_noNormalize(1, 0, 1.233018862239667),
    d1_25:       Decimal.fromComponents_noNormalize(1, 0, 1.25),
    dcbrt2:      Decimal.fromComponents_noNormalize(1, 0, Math.cbrt(2)), // 1.259921
    d1_3:        Decimal.fromComponents_noNormalize(1, 0, 1.3),
    d4div3:      Decimal.fromComponents_noNormalize(1, 0, 4/3), // 1.333333
    d1_5:        Decimal.fromComponents_noNormalize(1, 0, 1.5),
    d1_55:       Decimal.fromComponents_noNormalize(1, 0, 1.55),
    d5div3:      Decimal.fromComponents_noNormalize(1, 0, 5/3), // 1.666667
    d2:          Decimal.dTwo,
    dln10:       Decimal.fromComponents_noNormalize(1, 0, Math.log(10)), // 2.302585
    d2_5:        Decimal.fromComponents_noNormalize(1, 0, 2.5),
    dsqrt2pi:    Decimal.fromComponents_noNormalize(1, 0, Math.sqrt(2 * Math.PI)), // 2.506628
    de:          Decimal.fromComponents_noNormalize(1, 0, Math.E), // 2.718281
    d3:          Decimal.fromComponents_noNormalize(1, 0, 3),
    d4:          Decimal.fromComponents_noNormalize(1, 0, 4),
    d5:          Decimal.fromComponents_noNormalize(1, 0, 5),
    d6:          Decimal.fromComponents_noNormalize(1, 0, 6),
    d7:          Decimal.fromComponents_noNormalize(1, 0, 7),
    d8:          Decimal.fromComponents_noNormalize(1, 0, 8),
    d8_5:        Decimal.fromComponents_noNormalize(1, 0, 8.5),
    d9:          Decimal.fromComponents_noNormalize(1, 0, 9),
    d9_5:        Decimal.fromComponents_noNormalize(1, 0, 9.5),
    d10:         Decimal.fromComponents_noNormalize(1, 0, 10),
    d11:         Decimal.fromComponents_noNormalize(1, 0, 11),
    d12:         Decimal.fromComponents_noNormalize(1, 0, 12),
    d13:         Decimal.fromComponents_noNormalize(1, 0, 13),
    d14:         Decimal.fromComponents_noNormalize(1, 0, 14),
    d15:         Decimal.fromComponents_noNormalize(1, 0, 15),
    d15_5:       Decimal.fromComponents_noNormalize(1, 0, 15.5),
    d16:         Decimal.fromComponents_noNormalize(1, 0, 16),
    d18:         Decimal.fromComponents_noNormalize(1, 0, 18),
    d20:         Decimal.fromComponents_noNormalize(1, 0, 20),
    d25:         Decimal.fromComponents_noNormalize(1, 0, 25),
    d30:         Decimal.fromComponents_noNormalize(1, 0, 30),
    d31:         Decimal.fromComponents_noNormalize(1, 0, 31),
    d32:         Decimal.fromComponents_noNormalize(1, 0, 32),
    d33:         Decimal.fromComponents_noNormalize(1, 0, 33),
    d40:         Decimal.fromComponents_noNormalize(1, 0, 40),
    d50:         Decimal.fromComponents_noNormalize(1, 0, 50),
    d55:         Decimal.fromComponents_noNormalize(1, 0, 55),
    d60:         Decimal.fromComponents_noNormalize(1, 0, 60),
    d75:         Decimal.fromComponents_noNormalize(1, 0, 75),
    e2:          Decimal.fromComponents_noNormalize(1, 0, 100),
    d150:        Decimal.fromComponents_noNormalize(1, 0, 150),
    d200:        Decimal.fromComponents_noNormalize(1, 0, 200),
    d250:        Decimal.fromComponents_noNormalize(1, 0, 250),
    d300:        Decimal.fromComponents_noNormalize(1, 0, 300),
    logInf:      Decimal.fromComponents_noNormalize(1, 0, Math.log10(2) * 1024), // 308.254716
    d400:        Decimal.fromComponents_noNormalize(1, 0, 400),
    d500:        Decimal.fromComponents_noNormalize(1, 0, 500),
    e3:          Decimal.fromComponents_noNormalize(1, 0, 1000),
    d1200:       Decimal.fromComponents_noNormalize(1, 0, 1200),
    d2500:       Decimal.fromComponents_noNormalize(1, 0, 2500),
    d8500:       Decimal.fromComponents_noNormalize(1, 0, 8500),
    e4:          Decimal.fromComponents_noNormalize(1, 0, 10000),
    d36288:      Decimal.fromComponents_noNormalize(1, 0, 36288),
    d5e4:        Decimal.fromComponents_noNormalize(1, 0, 50000),
    e5:          Decimal.fromComponents_noNormalize(1, 0, 100000),
    e6:          Decimal.fromComponents_noNormalize(1, 0, 1000000),
    e7:          Decimal.fromComponents_noNormalize(1, 0, 10000000),
    d2e7:        Decimal.fromComponents_noNormalize(1, 0, 20000000),
    e8:          Decimal.fromComponents_noNormalize(1, 0, 100000000), 
    d3e8:        Decimal.fromComponents_noNormalize(1, 0, 300000000), 
    e9:          Decimal.fromComponents_noNormalize(1, 0, 1000000000), 
    e10:         Decimal.fromComponents_noNormalize(1, 0, 10000000000), 
    d2e11:       Decimal.fromComponents_noNormalize(1, 0, 200000000000), 
    e12:         Decimal.fromComponents_noNormalize(1, 0, 1000000000000), 
    e13:         Decimal.fromComponents_noNormalize(1, 0, 10000000000000), 
    e15:         Decimal.fromComponents_noNormalize(1, 0, 1000000000000000), 
    maxSafe:     Decimal.fromComponents_noNormalize(1, 0, 9007199254740991), // e15.954589770191003
    e16:         Decimal.fromComponents_noNormalize(1, 1, 16),
    e17:         Decimal.fromComponents_noNormalize(1, 1, 17),
    e18:         Decimal.fromComponents_noNormalize(1, 1, 18),
    e20:         Decimal.fromComponents_noNormalize(1, 1, 20),
    e24:         Decimal.fromComponents_noNormalize(1, 1, 24),
    e25:         Decimal.fromComponents_noNormalize(1, 1, 25),
    e30:         Decimal.fromComponents_noNormalize(1, 1, 30),
    e33:         Decimal.fromComponents_noNormalize(1, 1, 33),
    e35:         Decimal.fromComponents_noNormalize(1, 1, 35),
    e50:         Decimal.fromComponents_noNormalize(1, 1, 50),
    e55:         Decimal.fromComponents_noNormalize(1, 1, 55),
    e60:         Decimal.fromComponents_noNormalize(1, 1, 60),
    e80:         Decimal.fromComponents_noNormalize(1, 1, 80),
    e85:         Decimal.fromComponents_noNormalize(1, 1, 85),
    e90:         Decimal.fromComponents_noNormalize(1, 1, 90),
    e100:        Decimal.fromComponents_noNormalize(1, 1, 100),
    e140:        Decimal.fromComponents_noNormalize(1, 1, 140),
    e200:        Decimal.fromComponents_noNormalize(1, 1, 200),
    e250:        Decimal.fromComponents_noNormalize(1, 1, 250),
    e260:        Decimal.fromComponents_noNormalize(1, 1, 260),
    ee3:         Decimal.fromComponents_noNormalize(1, 1, 1000),
    e2500:       Decimal.fromComponents_noNormalize(1, 1, 2500),
    inf:         Decimal.fromComponents_noNormalize(1, 1, Math.log10(2) * 1024), // 1.797e308 - e308.254716
    trueInf:     Decimal.dInf
}

export const DEFAULT_SCALE = [
    { pow: c.d2,  type: 0, },
    { pow: c.d3,  type: 0, },
    { pow: c.d4,  type: 1, },
    { pow: c.d4,  type: 0, },
    { pow: c.d5,  type: 1, },
    { pow: c.d6,  type: 2, },
    { pow: c.d15, type: 0, },
    { pow: c.d75, type: 0, },
    { pow: c.e2,  type: 1, },
    { pow: c.d60, type: 2, }
]

export const doAllScaling = (x: DecimalSource, scalList: Array<{start: DecimalSource, strength: DecimalSource, type: number | string, bp: DecimalSource}>, inv: boolean) => {
    let sta, pow, sType, base, index
    for (let i = 0; i < scalList.length; i++) {
        index = inv ? i : scalList.length - i - 1;
        sta = scalList[index].start;
        pow = scalList[index].strength;
        sType = scalList[index].type;
        base = scalList[index].bp;
        
        x = scale(x, sType, inv, sta, pow, base);
    }
    return x;
}

export const scale = (num: DecimalSource, type: number | string, inverse = false, start: DecimalSource, str: DecimalSource, powScale: DecimalSource) => {
    if (Decimal.lte(num, start)) { return num; }
    str = Decimal.pow(powScale, str);
    switch (type) {
        // Polynomial
        case 0:
        case 0.1:
        case "P":
        case "P1":
            return inverse
                    ? Decimal.sub(num, start).mul(str).div(start).add(1).root(str).mul(start)
                    : Decimal.div(num, start).pow(str).sub(1).mul(start).div(str).add(start)
        case 0.2: // alemaninc
        case "P2":
            return inverse
                    ? Decimal.div(num, start).root(str).sub(1).mul(str).add(1).mul(start)
                    : Decimal.div(num, start).sub(1).div(str).add(1).pow(str).mul(start)
        // Exponential
        case 1:
        case 1.1:
        case "E":
        case "E1":
            return inverse 
                    ? Decimal.min(num, Decimal.div(num, start).log(str).add(1).mul(start))
                    : Decimal.max(num, Decimal.pow(str, Decimal.div(num, start).sub(1)).mul(start))
        case 1.2:
        case "E2":
            return inverse
                    ? Decimal.mul(num, str).mul(str.ln()).div(start).lambertw().mul(start).div(str.ln())
                    : Decimal.pow(str, Decimal.div(num, start).sub(1)).mul(num)
        case 1.3: // alemaninc
        case "E3":
            return inverse // poly exponential scaling
                    ? Decimal.div(num, start).ln().mul(str.sub(1)).add(1).root(str.sub(1)).mul(start)
                    : Decimal.div(num, start).pow(str.sub(1)).sub(1).div(str.sub(1)).exp().mul(start)
        // Semi-exponential
        case 2: 
        case 2.1:
        case "SE":
        case "SE1":
            return inverse // steep scaling
                    ? Decimal.pow(start, Decimal.sub(num, start).mul(str).add(start).log(start).root(str))
                    : Decimal.pow(start, Decimal.log(num, start).pow(str)).sub(start).div(str).add(start)
        case 2.2:
        case "SE2": // very shallow scaling
            return inverse
                    ? Decimal.pow(start, Decimal.log(num, start).sub(1).mul(str).add(1).root(str))
                    : Decimal.pow(start, Decimal.log(num, start).pow(str).sub(1).div(str).add(1))
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
}

export const D = (x: DecimalSource) => { return new Decimal(x); }

export const colorChange = (color: string, val: number, sat: number) => { // #ABCDEF format only
    if (color[0] === "#") { color = color.slice(1); }
    const colorInt = parseInt(color, 16);
    let r = ((colorInt >> 16) % 256) / 256;
    let g = ((colorInt >> 8) % 256) / 256;
    let b = (colorInt % 256) / 256;
    r = 1 - ((1 - r) * sat);
    g = 1 - ((1 - g) * sat);
    b = 1 - ((1 - b) * sat);
    r = Math.min(255, r * val * 256);
    g = Math.min(255, g * val * 256);
    b = Math.min(255, b * val * 256);
    return "#" + Math.floor(r).toString(16).padStart(2, "0")
        + Math.floor(g).toString(16).padStart(2, "0")
        + Math.floor(b).toString(16).padStart(2, "0");
}

export const mixColor = (color: string, nextColor: string, type: string, time: number) => {
    if (color[0] === "#") { color = color.slice(1); }
    const colorInt = parseInt(color, 16)
    if (nextColor[0] === "#") { nextColor = nextColor.slice(1); }
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
    return "#" + Math.floor(r).toString(16).padStart(2, "0")
        + Math.floor(g).toString(16).padStart(2, "0")
        + Math.floor(b).toString(16).padStart(2, "0");
}

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
    r = 1 - ((1 - r) * sat);
    g = 1 - ((1 - g) * sat);
    b = 1 - ((1 - b) * sat);
    r = r * val * 255;
    g = g * val * 255;
    b = b * val * 255;
    return "#" + Math.round(r).toString(16).padStart(2, "0")
        + Math.round(g).toString(16).padStart(2, "0")
        + Math.round(b).toString(16).padStart(2, "0");
}

export const clamp = (num: number, min: number, max: number) => {
    return Math.min(Math.max(num, min), max);
}

export const lerp = (t: number, s: number, e: number, type: string) => {
    if (isNaN(t)) {
        throw new Error(`malformed input [LERP]: ${t}, expecting f64`)
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
            t = 1.0 - ((1.0 - t) * (1.0 - t));
            break;
        case "CubeIn":
            t = t * t * t;
            break;
        case "CubeOut":
            t = 1.0 - ((1.0 - t) * (1.0 - t) * (1.0 - t));
            break;
        case "Smooth":
            t = 6 * (t ** 5) - 15 * (t ** 4) + 10 * (t ** 3);
            break;
        case "Sine":
            t = Math.sin(t * Math.PI / 2) ** 2;
            break;
        default:
            break;
    }
    return (s * (1 - t)) + (e * t);
}

export const rand = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
}

export const intRand = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export const expQuadCostGrowth = (x: DecimalSource, a: DecimalSource, b: DecimalSource, c: DecimalSource, exp: DecimalSource, inv: boolean) => {
    return inv
        ? inverseQuad(Decimal.layeradd10(x, -exp).log10(), Decimal.log10(a), Decimal.log10(b), Decimal.log10(c))
        : Decimal.pow(a, Decimal.pow(x, 2)).mul(Decimal.pow(b, x)).mul(c).layeradd10(exp);
}

export const inverseQuad = (x: DecimalSource, a: DecimalSource, b: DecimalSource, c: DecimalSource) => {
    return Decimal.eq(a, 0)
            ? Decimal.sub(x, c).div(b)
            : Decimal.sub(x, c).mul(a).mul(4).add(Decimal.pow(b, 2)).sqrt().sub(b).div(Decimal.mul(a, 2))
}

export const inverseCube = (x: DecimalSource, a: DecimalSource, b: DecimalSource, c: DecimalSource, d: DecimalSource, tol = 1e-10) => { // inverse of ax^3+bx^2+cx+d
    x = new Decimal(x);
    a = new Decimal(a);
    b = new Decimal(b);
    c = new Decimal(c);
    d = new Decimal(d);
    let res = x.cbrt();
    let r;

    // newton's method 
    for (let i = 0; i < 100; ++i) {
        r = res.sub(res.pow(3).mul(a).add(res.pow(2).mul(b)).add(res.mul(c)).add(d).sub(x).div(res.pow(2).mul(a).mul(3).add(res.mul(b).mul(2)).add(c)));
        if (res.sub(r).abs().lt(tol)) {
            return r;
        }
        res = r;
    }
    console.warn(`inverseCube couldn't finish converging! (Final value: ${format(res)})`);
    return res;
}


export const inverseFact = (x: DecimalSource) => {
    if (Decimal.gte(x, 'ee18')) return Decimal.log10(x);
    if (Decimal.gte(x, 'e10000')) return Decimal.log10(x).div(Decimal.log10(x).log10());
    return Decimal.div(x, c.dsqrt2pi).ln().div(Math.E).lambertw().add(1).exp().sub(0.5);
}

/**
 * This solves the product
 * Product of n=0 to x of a+bn
 * inverse is with respect to x
 * @param {Decimal} x 
 * @param {Decimal} a 
 * @param {Decimal} b 
 */
export const linearIncreaseMulti = (x: DecimalSource, a: DecimalSource, b: DecimalSource) => { // i cannot find a good inverse for this
    return Decimal.pow(b, Decimal.add(x, 1)).mul(Decimal.div(a, b).add(x).factorial()).div(Decimal.div(a, b).factorial()).div(b);
}

export const smoothPoly = (x: DecimalSource, poly: DecimalSource, start: DecimalSource, inverse: boolean) => {
    return inverse
        ? Decimal.add(x, Decimal.div(start, poly)).mul(Decimal.mul(poly, Decimal.pow(start, Decimal.sub(poly, 1)))).root(poly).sub(start)
        : Decimal.add(x, start).pow(poly).div(Decimal.mul(poly, Decimal.pow(start, Decimal.sub(poly, 1)))).sub(Decimal.div(start, poly))
}

export const smoothExp = (x: DecimalSource, exp: DecimalSource, inv: boolean) => {
    return inv
        ? Decimal.mul(x, Decimal.ln(exp)).add(1).log(exp)
        : Decimal.pow(exp, x).sub(1).div(Decimal.ln(exp))
}

export const sumHarmonicSeries = (x: DecimalSource) => {
    if (Decimal.lt(x, 1)) { return D(0) }
    return Decimal.ln(x).add(0.5772156649015329).add(Decimal.div(0.5, x)).sub(Decimal.div(1, (Decimal.pow(x, 2).mul(12)))).add(Decimal.div(1, (Decimal.pow(x, 4).mul(120))))
}

/**
 * this only works fine on exponentials and higher
 * @param {export const} =  target 
 * @param {export const} =  cost 
 * @param {Decimal} resource 
 * @param {Decimal} bought 
 */
export const buyMax = (target: Function, cost: Function, resource: DecimalSource, bought: DecimalSource) => {
    if (target(resource).lt(Number.MAX_SAFE_INTEGER) && Decimal.lt(resource, Decimal.pow10(Number.MAX_SAFE_INTEGER))) {
        let currentBought = target(resource).sub(9).floor().max(bought)
        let currCost = cost(currentBought)
        for (let i = 0; i < 10; i++) {
            if (Decimal.lt(resource, currCost)) { break }
            resource = Decimal.sub(resource, currCost)
            currentBought = currentBought.add(1)
            bought = currentBought
            currCost = cost(currentBought)
        }
    } else {
        const currentBought = target(resource).floor().add(1).max(bought)
        bought = currentBought
    }
    return {
        bought: bought,
        resource: resource
    }
}

export const linearAdd = (num: DecimalSource, base: DecimalSource, growth: DecimalSource, inverse: boolean) => {
    if (Decimal.eq(base, growth)) {
        return inverse
            ? Decimal.mul(num, 8).add(base).sqrt().div(Decimal.sqrt(base).mul(2)).sub(0.5)
            : Decimal.add(num, 1).mul(num).div(2).mul(base)
    }

    return inverse
        ? Decimal.sub(growth, Decimal.mul(base, 2)).pow(2).add(Decimal.mul(num, growth).mul(8)).sqrt().sub(growth).sub(Decimal.mul(base, 2)).div(Decimal.mul(growth, 2))
        : Decimal.mul(growth, num).add(Decimal.mul(base, 2)).mul(Decimal.add(num, 1)).div(2)
}

export const logPowSoftcap = (num: DecimalSource, start: DecimalSource, inv: boolean) => {
    if (Decimal.lte(num, start)) { return new Decimal(num) }
    num = Decimal.log10(num);
    start = Decimal.log10(start);
    return inv
        ? Decimal.sub(num, start).div(Decimal.ln(start)).add(start).div(start).pow_base(start).pow10()
        : Decimal.log(num, start).mul(start).sub(start).mul(Decimal.ln(start)).add(start).pow10()
}