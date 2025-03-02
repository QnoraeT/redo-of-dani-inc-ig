import Decimal, { type DecimalSource } from 'break_eternity.js'
import { format, formatPerc } from '@/format'
import { tmp, player, updateAllTotal, updateAllBest, NaNCheck, type TrueFactor } from '@/main'
import { scale, D, smoothPoly, smoothExp, expQuadCostGrowth } from '@/calc'
import { getSCSLAttribute, SCALE_ATTR, SOFT_ATTR, doAllScaling, type ScSlItems } from '@/softcapScaling'
import { getAchievementEffect, ifAchievement } from '../../Game_Achievements/Game_Achievements'
import { LABELS, pushFactor, resetFactor, setFactor } from '../../Game_Stats/Game_Stats'
import { computed } from 'vue'
import { challengeDepth, getColChalCondEffects, getColChalRewEffects, inChallenge, timesCompleted } from '../Game_Colosseum/Game_ColChallenges/Game_ColChalHandler'
import { getKuaUpgrade, KUA_UPGRADES } from '../Game_Kuaraniai/Game_KuaUpgrades/Game_KuaUpgrades'
import { KUA_ENHANCERS } from '../Game_Kuaraniai/Game_KuaEnhancers/Game.KuaEnhancers'
import { COL_CHALLENGES } from '../Game_Colosseum/Game_ColChallenges/Game_ColChalData'
import { getColResEffect, getColResLevel } from '../Game_Colosseum/Game_ColResearches/Game_ColResearches'
import { getOMUpgrade, MAIN_ONE_UPGS, maxxedOMUpgrade } from './Game_OneUpgrades/Game_OneUpgrades'
import { GROWAN_UPGS, hasGrowanMilestone } from '../Game_Layer4/Game_Growan/Game_Growan'
import { MAIN_UPG_DATA } from './Game_MainUpgrades/Game_MainUpgrades'

export const PR2_EFF = [
    {
        show: computed(() => { return true; }),
        when: D(1),
        text: computed(() => { return `you gain a new upgrade and make PRai resets unforced.`; })
    },
    {
        show: computed(() => { return true; }),
        when: D(2),
        text: computed(() => { return `unlock the Upgrade 1 Autobuyer.`; })
    },
    {
        show: computed(() => { return true; }),
        when: D(4),
        text: computed(() => { return `unlock the Upgrade 2 Autobuyer and increase the Upgrade 2 base from ${format(1.2, 3)}x -> ${format(1.3, 3)}x.`; })
    },
    {
        show: computed(() => { return true; }),
        when: D(5),
        text: computed(() => { return `unlock Upgrade 3.`; })
    },
    {
        show: computed(() => { return true; }),
        when: D(6),
        text: computed(() => { return `unlock One-Upgrades.`; })
    },
    {
        show: computed(() => { return !inChallenge('dc'); }),
        when: D(7),
        text: computed(() => { return `weaken Upgrade 1's scaling strength by ${formatPerc(10 / 9, 3)}.`; })
    },
    {
        show: computed(() => { return true; }),
        when: D(9),
        text: computed(() => { return `increase Upgrade 1's base by +${format(0.05, 3)}.`; })
    },
    {
        show: computed(() => { return true; }),
        when: D(11),
        text: computed(() => { return `slow down Upgrade 3's cost by ${formatPerc(10 / 9, 3)}.`; })
    },
    {
        show: computed(() => { return Decimal.gt(player.value.gameProgress.kua.amount, 0.0001) }),
        when: D(12),
        text: computed(() => { return `unlock the Upgrade 4 autobuyer.`; })
    },
    {
        show: computed(() => { return Decimal.gt(player.value.gameProgress.kua.amount, 0.0001); }),
        when: D(14),
        text: computed(() => { return `unlock the Upgrade 5 autobuyer.`; })
    },
    {
        show: computed(() => { return !inChallenge('dc'); }),
        when: D(15),
        text: computed(() => { return `decrease Upgrade 2's superscaling strength by ${formatPerc(8 / 7, 3)}.`; })
    },
    {
        show: computed(() => { return Decimal.gt(player.value.gameProgress.kua.amount, 0.0001); }),
        when: D(18),
        text: computed(() => { return `unlock the Upgrade 3 and 6 autobuyer.`; })
    },
    {
        show: computed(() => { return true; }),
        when: D(20),
        text: computed(() => { return `weaken Upgrade 1's cost scaling by ${format(2.5, 3)}%.`; })
    },
    {
        show: computed(() => { return true; }),
        when: D(25),
        text: computed(() => { return inChallenge('dc') ? `keep One-Upgrades on Kuaraniai reset.` : `keep One-Upgrades, and Upgrade 1 and 2's scaling and super scaling starts ${format(15, 1)} later.`; })
    },
    {
        show: computed(() => { return getKuaUpgrade("s", 11); }),
        when: D(45),
        text: computed(() => { return `boosts Kuaraniai effects based on how much PR2 you have.`; })
    },
    {
        show: computed(() => { return Decimal.gt(player.value.gameProgress.kua.amount, 0.0001) }),
        when: D(75),
        text: computed(() => { 
            if (player.value.gameProgress.inChallenge.im.overall) {
                return `unlock the Kuaraniai generator (works by ${format(1)}%/s) and the One-Upgrade automator.`
            }
            return `unlock the Kuaraniai generator (works by ${format(1)}%/s).`; 
        })
    },
    {
        show: computed(() => { return getKuaUpgrade('s', 15); }),
        when: D(100),
        text: computed(() => { return `unlock the Upgrade 7 autobuyer.`; })
    },
    {
        show: computed(() => { return getKuaUpgrade('s', 16); }),
        when: D(125),
        text: computed(() => { return `unlock the Upgrade 8 autobuyer.`; })
    },
    {
        show: computed(() => { return getKuaUpgrade('s', 17); }),
        when: D(150),
        text: computed(() => { return `unlock the Upgrade 9 autobuyer.`; })
    },
]

export const PRAI_GAIN_CALC: Array<TrueFactor> = [
    {
        baseActive: computed(() => { return true; }),
        active: true,
        name: computed(() => { return 'Base'; }),
        effect: computed(() => {
            return Decimal.max(player.value.gameProgress.main.totals[0]!, 0).div(tmp.value.main.prai.req).pow(tmp.value.main.prai.gainExp).sub(1).mul(tmp.value.main.prai.gainExp).add(1).log10().pow(0.9).pow10();
        }),
        color: 'norm',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return player.value.gameProgress.unlocks.pr2;
        }),
        active: true,
        name: computed(() => { return 'PR2'; }),
        effect: computed(() => {
            return tmp.value.main.pr2.effActive ? tmp.value.main.pr2.effect : D(1);
        }),
        color: 'norm',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return Decimal.gte(player.value.gameProgress.main.oneUpgrades[3], 1);
        }),
        active: true,
        name: computed(() => { return 'One Upgrade #4'; }),
        effect: computed(() => {
            return MAIN_ONE_UPGS[3].effect.value;
        }),
        color: 'norm',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return Decimal.gt(player.value.gameProgress.kua.kshards.amount, 0);
        }),
        active: true,
        name: computed(() => { return 'KShard Base Effect'; }),
        effect: computed(() => {
            return tmp.value.kua.effects.kshardPassive;
        }),
        color: 'kua',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return getKuaUpgrade("s", 8);
        }),
        active: true,
        name: computed(() => { return 'KShard Upgrade 8'; }),
        effect: computed(() => {
            return KUA_UPGRADES.KShards[7].eff!.value;
        }),
        color: 'kua',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return ifAchievement(1, 11);
        }),
        active: true,
        name: computed(() => { return 'Achievement ID (1, 11)'; }),
        effect: computed(() => {
            return getAchievementEffect(1, 11);
        }),
        color: 'ach',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return ifAchievement(2, 1);
        }),
        active: true,
        name: computed(() => { return 'Achievement ID (2, 1)'; }),
        effect: computed(() => {
            return D(5);
        }),
        color: 'ach',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return Decimal.gte(getColResEffect(1), 1);
        }),
        active: true,
        name: computed(() => { return 'Firsterious'; }),
        effect: computed(() => {
            return getColResEffect(1);
        }),
        color: 'col',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return Decimal.gte(timesCompleted("df"), 1);
        }),
        active: true,
        name: computed(() => {
            return COL_CHALLENGES.df.labelRew.value;
        }),
        effect: computed(() => {
            return D(10);
        }),
        color: 'col',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return Decimal.gte(timesCompleted("dc"), 1);
        }),
        active: true,
        name: computed(() => {
            return COL_CHALLENGES.dc.labelRew.value;
        }),
        effect: computed(() => {
            let total = D(0);
            for (let i = 0; i < tmp.value.main.upgrades.length; i++) {
                total = total.add(player.value.gameProgress.main.upgrades[i].bought);
            }
            return total.sqrt().pow_base(getColChalRewEffects("dc")[0]);
        }),
        color: 'col',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return player.value.gameProgress.layer4.gro.upgrades.overall.includes(1);
        }),
        active: true,
        name: computed(() => { return LABELS.gou2; }),
        effect: computed(() => {
            return GROWAN_UPGS.overall[1].eff!.value.prai;
        }),
        color: 'growan',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return inChallenge("im");
        }),
        active: true,
        name: computed(() => {
            return COL_CHALLENGES.im.labelEff.value;
        }),
        effect: computed(() => {
            return Decimal.pow(0.8, challengeDepth("im"));
        }),
        color: 'col',
        type: 'pow'
    },
];

export const updateAllStart = (delta: DecimalSource) => {
    updateStart(2, delta); // one upgrades (only for if they can be bought and is the tab should be highlighted)
    updateStart(1, delta); // pr2 calculations
    updateStart(0, delta); // prai calculations
    for (let i = MAIN_UPG_DATA.length - 1; i >= 0; i--) {
        updateStart(-(i + 1), delta); // all main upgs
    }
}

export const updateStart = (whatToUpdate: number, delta: DecimalSource) => {
    let i, j, generate, scal, upgID;
    let shown = false;
    let autoUnlocked = false;
    let display = ``;
    let totalDisp = ``;
    switch (whatToUpdate) {
        case 2:
            tmp.value.main.canBuyUpg = false;
            for (let i = 0; i < MAIN_ONE_UPGS.length; i++) {
                if (player.value.gameProgress.main.oneUpgrades[i] === undefined) { player.value.gameProgress.main.oneUpgrades[i] = D(0); }
                tmp.value.main.oneUpgrades[i].canBuy = Decimal.gte(player.value.gameProgress.main.prai.amount, MAIN_ONE_UPGS[i].cost.value);
                tmp.value.main.canBuyUpg = tmp.value.main.canBuyUpg || (tmp.value.main.oneUpgrades[i].canBuy && !maxxedOMUpgrade(i) && MAIN_ONE_UPGS[i].show.value);
                if (Decimal.gte(player.value.gameProgress.main.pr2.amount, 75) && player.value.gameProgress.inChallenge.im.overall && MAIN_ONE_UPGS[i].show.value) {
                    player.value.gameProgress.main.oneUpgrades[i] = Decimal.max(player.value.gameProgress.main.oneUpgrades[i], MAIN_ONE_UPGS[i].target.value.floor().add(1));
                }
            }
            break;
        case -9:
        case -8:
        case -7:
        case -6:
        case -5:
        case -4:
        case -3:
        case -2:
        case -1:
            upgID = -1 - whatToUpdate

            tmp.value.main.upgrades[upgID].active = true;
            if ((upgID === 3 || upgID === 4 || upgID === 5) && (inChallenge("su") && Decimal.gte(challengeDepth("su"), 8))) {
                tmp.value.main.upgrades[upgID].active = false;
            }

            tmp.value.main.upgrades[upgID].costBase = [
                {exp: D(0), scale: [D(5),    D(1.55),   D(1)     ]},
                {exp: D(0), scale: [D(1e3),  D(1.25),   D(1)     ]},
                {exp: D(0), scale: [D(1e10), D(100),    D(1.05)  ]},
                {exp: D(0), scale: [D(1e33), D(1.02),   D(1.0003)]},
                {exp: D(0), scale: [D(1e45), D(1.03),   D(1.0002)]},
                {exp: D(0), scale: [D(1e63), D(1.25),   D(1.025) ]},
                {exp: D(1), scale: [D(1000), D(1.01),   D(1.0001)]},
                {exp: D(1), scale: [D(1250), D(1.0075), D(1.0002)]},
                {exp: D(1), scale: [D(1500), D(1.025),  D(1.0005)]},
            ][upgID];

            if (upgID === 0) {
                if (getKuaUpgrade("s", 7)) {
                    tmp.value.main.upgrades[upgID].costBase.scale[1] = tmp.value.main.upgrades[upgID].costBase.scale[1].mul(0.95);
                }
            }
            if (upgID === 1) {
                if (getKuaUpgrade("p", 13)) {
                    tmp.value.main.upgrades[upgID].costBase.scale[1] = tmp.value.main.upgrades[upgID].costBase.scale[1].mul(0.92);
                }
            }
            if (upgID === 3 || upgID === 4 || upgID === 5) {
                if (Decimal.gte(getOMUpgrade(17), 1)) {
                    tmp.value.main.upgrades[upgID].costBase.scale[1] = tmp.value.main.upgrades[upgID].costBase.scale[1].pow(Decimal.sub(1, MAIN_ONE_UPGS[17].effect.value));
                }
            }

            scal = D(player.value.gameProgress.main.upgrades[upgID].bought);
            setFactor(0, [1, upgID, 1], "Base", `${format(scal, 2)}`, `${format(scal, 2)} effective`, true);

            if (ifAchievement(1, 6)) {
                scal = scal.div(getAchievementEffect(1, 6));
            }
            setFactor(1, [1, upgID, 1], "Achievement ID: (1, 6)", `/${format(getAchievementEffect(1, 6), 2)}`, `${format(scal, 2)} effective`, ifAchievement(1, 6), "ach");

            if (upgID === 0) {
                if (Decimal.gte(player.value.gameProgress.main.pr2.amount, 20)) {
                    scal = scal.mul(0.975);
                }
                setFactor(2, [1, upgID, 1], "PR2 20", `×${format(0.975, 2)}`, `${format(scal, 2)} effective`, Decimal.gte(player.value.gameProgress.main.pr2.amount, 20));

                if (getKuaUpgrade("p", 10)) {
                    scal = scal.div(KUA_UPGRADES.KPower[9].eff!.value);
                }
                setFactor(2, [1, upgID, 1], "KPower Upgrade 10", `/${format(KUA_UPGRADES.KPower[9].eff!.value, 2)}`, `${format(scal, 2)} effective`, getKuaUpgrade("p", 10), "kua");
            }
            if (upgID === 1) {
                if (getKuaUpgrade("s", 9)) {
                    scal = scal.sub(KUA_UPGRADES.KShards[8].eff!.value);
                }
                setFactor(3, [1, upgID, 1], "KShard Upgrade 9", `-${format(KUA_UPGRADES.KShards[8].eff!.value, 2)}`, `${format(scal, 2)} effective`, getKuaUpgrade("s", 9), "kua");

                if (getKuaUpgrade("p", 10)) {
                    scal = scal.div(KUA_UPGRADES.KPower[9].eff!.value);
                }
                setFactor(4, [1, upgID, 1], "KPower Upgrade 10", `/${format(KUA_UPGRADES.KPower[9].eff!.value, 2)}`, `${format(scal, 2)} effective`, getKuaUpgrade("p", 10), "kua");
            }
            if (upgID === 2) {
                if (Decimal.gte(player.value.gameProgress.main.pr2.amount, 11)) {
                    scal = scal.div(10 / 9);
                }
                setFactor(5, [1, upgID, 1], "PR2 11", `/${format(10 / 9, 2)}`, `${format(scal, 2)} effective`, Decimal.gte(player.value.gameProgress.main.pr2.amount, 11));
            }
            if (upgID === 3 || upgID === 4 || upgID === 5) {
                if (getKuaUpgrade("p", 11)) {
                    scal = scal.mul(0.9);
                }
                setFactor(6, [1, upgID, 1], "KPower Upgrade 11", `×${format(0.9, 2)}`, `${format(scal, 2)} effective`, getKuaUpgrade("p", 11), "kua");
            }
            if (inChallenge("su")) {
                scal = scal.mul(getColChalCondEffects("su")[0]);
            }
            setFactor(7, [1, upgID, 1], `Sabotaged Upgrades ×${format(challengeDepth("su"))}`, `×${format(getColChalCondEffects("su")[0], 2)}`, `${format(scal, 2)} effective`, inChallenge("su"), "col");
            
            if (inChallenge("dc")) {
                scal = scal.pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[3]).sub(1).pow10();
            }
            setFactor(8, [1, upgID, 1], `Dimension Crawler ×${format(challengeDepth("dc"))}`, `10^(${format(scal)}^${format(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[3], 2)})`, `${format(scal, 2)} effective`, inChallenge("dc"), "col");

            i = scal;
            scal = doAllScaling(scal, getSCSLAttribute(`upg${upgID + 1}` as ScSlItems, true), false);
            setFactor(9, [1, upgID, 1], "Scaling", `scaling(${format(i, 2)})`, `${format(scal, 2)} effective`, true);

            if (upgID === 3) {
                scal = scal.div(KUA_ENHANCERS.enhances[3].effect())
            }
            if (upgID === 4) {
                scal = scal.div(KUA_ENHANCERS.enhances[4].effect())
            }
            if (upgID === 5) {
                scal = scal.div(KUA_ENHANCERS.enhances[5].effect())
            }

            tmp.value.main.upgrades[upgID].cost = expQuadCostGrowth(scal, tmp.value.main.upgrades[upgID].costBase.scale[2], tmp.value.main.upgrades[upgID].costBase.scale[1], tmp.value.main.upgrades[upgID].costBase.scale[0], tmp.value.main.upgrades[upgID].costBase.exp, false);
            if (tmp.value.main.upgrades[upgID].costBase.scale[2].gt(1)) {
                setFactor(10, [1, upgID, 1], "Resulting Cost", `${format(tmp.value.main.upgrades[upgID].costBase.scale[2], 4)}^${format(scal)}² × ${format(tmp.value.main.upgrades[upgID].costBase.scale[1], 2)}^${format(scal)} × ${format(tmp.value.main.upgrades[upgID].costBase.scale[0])}`, `${format(tmp.value.main.upgrades[upgID].cost)}`, true);
            } else {
                setFactor(10, [1, upgID, 1], "Resulting Cost", `${format(tmp.value.main.upgrades[upgID].costBase.scale[1], 2)}^${format(scal)} × ${format(tmp.value.main.upgrades[upgID].costBase.scale[0])}`, `${format(tmp.value.main.upgrades[upgID].cost)}`, true);
            }

            if (upgID === 0) {
                if (Decimal.gte(player.value.gameProgress.main.upgrades[7].bought, 1)) {
                    tmp.value.main.upgrades[upgID].cost = tmp.value.main.upgrades[upgID].cost.pow(tmp.value.main.upgrades[7].effect ?? 1);
                }
                setFactor(11, [1, upgID, 1], "Upgrade 8", `^${format(tmp.value.main.upgrades[7].effect ?? 1, 3)}`, `${format(tmp.value.main.upgrades[upgID].cost)}`, Decimal.gte(player.value.gameProgress.main.upgrades[7].bought, 1));

                tmp.value.main.upgrades[upgID].cost = tmp.value.main.upgrades[upgID].cost.div(tmp.value.main.upgrades[1].effect ?? 1);
                setFactor(12, [1, upgID, 1], "Upgrade 2", `/${format(tmp.value.main.upgrades[1].effect ?? 1, 2)}`, `${format(tmp.value.main.upgrades[upgID].cost)}`, Decimal.gte(player.value.gameProgress.main.upgrades[1].bought, 1));

                tmp.value.main.upgrades[upgID].cost = tmp.value.main.upgrades[upgID].cost.div(tmp.value.main.upgrades[4].effect ?? 1);
                setFactor(13, [1, upgID, 1], "Upgrade 5", `/${format(tmp.value.main.upgrades[4].effect ?? 1, 2)}`, `${format(tmp.value.main.upgrades[upgID].cost)}`, Decimal.gte(player.value.gameProgress.main.upgrades[4].bought, 1));
            }

            if (upgID === 1) {
                if (Decimal.gte(player.value.gameProgress.main.oneUpgrades[0], 1)) {
                    tmp.value.main.upgrades[upgID].cost = tmp.value.main.upgrades[upgID].cost.div(MAIN_ONE_UPGS[0].effect.value);
                }
                setFactor(14, [1, upgID, 1], "One-Upgrade #1", `/${format(MAIN_ONE_UPGS[0].effect.value, 2)}`, `${format(tmp.value.main.upgrades[upgID].cost)}`, Decimal.gte(player.value.gameProgress.main.oneUpgrades[0], 1));
            }

            if (inChallenge('im') && Decimal.gte(player.value.gameProgress.main.upgrades[upgID].bought, 1)) {
                tmp.value.main.upgrades[upgID].cost = D(Infinity);
            }
            setFactor(15, [1, upgID, 1], "Inverted Mechanics", `---`, `Capped`, inChallenge('im') && Decimal.gte(player.value.gameProgress.main.upgrades[upgID].bought, 1), "col");

            tmp.value.main.upgrades[upgID].target = D(0);

            if (Decimal.gte(player.value.gameProgress.main.points, tmp.value.main.upgrades[upgID].costBase.scale[0])) {
                i = D(player.value.gameProgress.main.points);
                if (upgID === 1) {
                    if (Decimal.gte(player.value.gameProgress.main.oneUpgrades[0], 1)) {
                        i = i.mul(MAIN_ONE_UPGS[0].effect.value);
                    }
                }
                if (upgID === 0) {
                    i = i.mul(tmp.value.main.upgrades[4].effect ?? 1);
                    i = i.mul(tmp.value.main.upgrades[1].effect ?? 1);
                    i = i.root(tmp.value.main.upgrades[7].effect ?? 1);
                }

                scal = expQuadCostGrowth(i, tmp.value.main.upgrades[upgID].costBase.scale[2], tmp.value.main.upgrades[upgID].costBase.scale[1], tmp.value.main.upgrades[upgID].costBase.scale[0], tmp.value.main.upgrades[upgID].costBase.exp, true);

                if (upgID === 5) {
                    scal = scal.mul(KUA_ENHANCERS.enhances[5].effect());
                }
                if (upgID === 4) {
                    scal = scal.mul(KUA_ENHANCERS.enhances[4].effect());
                }
                if (upgID === 3) {
                    scal = scal.mul(KUA_ENHANCERS.enhances[3].effect());
                }

                scal = doAllScaling(scal, getSCSLAttribute(`upg${upgID + 1}` as ScSlItems, true), true);
                if (inChallenge("dc")) {
                    scal = scal.log10().add(1).root(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[3]);
                }
                if (inChallenge("su")) {
                    scal = scal.div(getColChalCondEffects("su")[0]);
                }
                if (upgID === 3 || upgID === 4 || upgID === 5) {
                    if (getKuaUpgrade("p", 11)) {
                        scal = scal.div(0.9);
                    }
                }
                if (upgID === 2) {
                    if (Decimal.gte(player.value.gameProgress.main.pr2.amount, 11)) {
                        scal = scal.mul(10 / 9);
                    }
                }
                if (upgID === 1) {
                    if (getKuaUpgrade("p", 10)) {
                        scal = scal.mul(KUA_UPGRADES.KPower[9].eff!.value)
                    }
                    if (getKuaUpgrade("s", 9)) {
                        scal = scal.add(KUA_UPGRADES.KShards[8].eff!.value);
                    }
                }
                if (upgID === 0) {
                    if (getKuaUpgrade("p", 10)) {
                        scal = scal.mul(KUA_UPGRADES.KPower[9].eff!.value)
                    }
                    if (Decimal.gte(player.value.gameProgress.main.pr2.amount, 20)) {
                        scal = scal.div(0.975)
                    }
                }
                if (ifAchievement(1, 6)) {
                    scal = scal.mul(getAchievementEffect(1, 6));
                }

                if (inChallenge('im')) {
                    scal = D(0);
                }
                tmp.value.main.upgrades[upgID].target = scal;
            }

            tmp.value.main.upgrades[upgID].effect = MAIN_UPG_DATA[upgID].effect.value;
            tmp.value.main.upgrades[upgID].effective = MAIN_UPG_DATA[upgID].effective.value;
            tmp.value.main.upgrades[upgID].freeExtra = MAIN_UPG_DATA[upgID].freeExtra.value;
            tmp.value.main.upgrades[upgID].effectBase = MAIN_UPG_DATA[upgID].effectBase.value;

            tmp.value.main.upgrades[upgID].calcEB = tmp.value.main.upgrades[upgID].effectBase;
            switch (upgID) {
                case 0:
                    shown = true;
                    autoUnlocked = (Decimal.gte(player.value.gameProgress.main.pr2.best[4]!, 2) && hasGrowanMilestone(3)) || Decimal.gte(player.value.gameProgress.main.pr2.best[3]!, 2);
                    break;
                case 1:
                    shown = Decimal.gte(player.value.gameProgress.main.pr2.best[3]!, 1);
                    autoUnlocked = (Decimal.gte(player.value.gameProgress.main.pr2.best[4]!, 4) && hasGrowanMilestone(3)) || Decimal.gte(player.value.gameProgress.main.pr2.best[3]!, 4);
                    break;
                case 2:
                    shown = Decimal.gte(player.value.gameProgress.main.pr2.best[3]!, 5);
                    autoUnlocked = (Decimal.gte(player.value.gameProgress.main.pr2.best[4]!, 18) && hasGrowanMilestone(3)) || Decimal.gte(player.value.gameProgress.main.pr2.best[3]!, 18);
                    break;
                case 3:
                    shown = Decimal.gt(player.value.gameProgress.kua.amount, 0);
                    autoUnlocked = (Decimal.gte(player.value.gameProgress.main.pr2.best[4]!, 12) && hasGrowanMilestone(3)) || Decimal.gte(player.value.gameProgress.main.pr2.best[3]!, 12);
                    break;
                case 4:
                    shown = Decimal.gte(player.value.gameProgress.kua.kshards.amount, 0.01);
                    autoUnlocked = (Decimal.gte(player.value.gameProgress.main.pr2.best[4]!, 14) && hasGrowanMilestone(3)) || Decimal.gte(player.value.gameProgress.main.pr2.best[3]!, 14);
                    break;
                case 5:
                    shown = Decimal.gte(player.value.gameProgress.kua.kpower.amount, 1);
                    autoUnlocked = (Decimal.gte(player.value.gameProgress.main.pr2.best[4]!, 18) && hasGrowanMilestone(3)) || Decimal.gte(player.value.gameProgress.main.pr2.best[3]!, 18);
                    break;
                case 6:
                    shown = getKuaUpgrade('s', 15);
                    autoUnlocked = (Decimal.gte(player.value.gameProgress.main.pr2.best[4]!, 100) && hasGrowanMilestone(3)) || Decimal.gte(player.value.gameProgress.main.pr2.best[3]!, 100);
                    break;
                case 7:
                    shown = getKuaUpgrade('s', 16);
                    autoUnlocked = (Decimal.gte(player.value.gameProgress.main.pr2.best[4]!, 125) && hasGrowanMilestone(3)) || Decimal.gte(player.value.gameProgress.main.pr2.best[3]!, 125);
                    break;
                case 8:
                    shown = getKuaUpgrade('s', 17);
                    autoUnlocked = (Decimal.gte(player.value.gameProgress.main.pr2.best[4]!, 150) && hasGrowanMilestone(3)) || Decimal.gte(player.value.gameProgress.main.pr2.best[3]!, 150);
                    break;
                default:
                    throw new Error(`${upgID} is not a valid index for main upgrade`);
            }
            if (upgID >= 0 && upgID < 9 && hasGrowanMilestone(2)) {
                shown = true;
            }
            if (upgID >= 0 && upgID < 9 && hasGrowanMilestone(3)) {
                autoUnlocked = true;
            }
            tmp.value.main.upgrades[upgID].shown = shown;
            tmp.value.main.upgrades[upgID].autoUnlocked = autoUnlocked;

            // switch (upgID) {
            //     case 0:
            //     case 1:
            //     case 3:
            //     case 4:
            //     case 6:
            //     case 7:
            //     case 8:
            //         tmp.value.main.upgrades[upgID].calcEB = MAIN_UPG_DATA[upgID].effect(Decimal.add(player.value.gameProgress.main.upgrades[upgID].bought, 1)).div(MAIN_UPG_DATA[upgID].effect());
            //         break;
            //     case 2:
            //     case 5:
            //         tmp.value.main.upgrades[upgID].calcEB = MAIN_UPG_DATA[upgID].effect(Decimal.add(player.value.gameProgress.main.upgrades[upgID].bought, 1)).sub(MAIN_UPG_DATA[upgID].effect());
            //         break;
            //     default:
            //         throw new Error(`${upgID} is not a valid index for main upgrade`);
            // }

            switch (upgID) {
                case 0:
                case 3:
                    display = `Increase point gain by ${format(tmp.value.main.upgrades[upgID].calcEB, 3)}×`;
                    totalDisp = `Total: ${format(tmp.value.main.upgrades[upgID].effect, 2)}× to point gain`;
                    break;
                case 1:
                case 4:
                    display = `Decreases Upgrade 1's cost by /${format(tmp.value.main.upgrades[upgID].calcEB, 3)}`;
                    totalDisp = `Total: /${format(tmp.value.main.upgrades[upgID].effect, 2)} to Upgrade 1's cost`;
                    break;
                case 2:
                case 5:
                    display = `Increases Upgrade 1's base by +${format(tmp.value.main.upgrades[upgID].calcEB, 3)}`;
                    totalDisp = `Total: +${format(tmp.value.main.upgrades[upgID].effect, 3)} to Upgrade 1's base`;
                    break;
                case 6:
                    display = `Raise Upgrade 1's effect by ^${format(tmp.value.main.upgrades[upgID].calcEB, 3)}`;
                    totalDisp = `Total: ^${format(tmp.value.main.upgrades[upgID].effect, 3)} to Upgrade 1's effect`;
                    break;
                case 7:
                    display = `Raise Upgrade 1's cost by ^${format(tmp.value.main.upgrades[upgID].calcEB, 3)}`;
                    totalDisp = `Total: ^${format(tmp.value.main.upgrades[upgID].effect, 3)} to Upgrade 1's cost`;
                    break;
                case 8:
                    display = `Multiply Upgrade 1's base by ×${format(tmp.value.main.upgrades[upgID].calcEB, 3)}`;
                    totalDisp = `Total: ×${format(tmp.value.main.upgrades[upgID].effect, 3)} to Upgrade 1's base`;
                    break;
                default:
                    throw new Error(`${upgID} is not a valid index for main upgrade`);
            }
            tmp.value.main.upgrades[upgID].display = display;
            tmp.value.main.upgrades[upgID].totalDisp = totalDisp;

            // this is only used for Col Challenge 'Dimension Crawler!'
            tmp.value.main.upgrades[upgID].multiplier = D(1);
            if (inChallenge('dc') || Decimal.gte(timesCompleted("dc"), 10)) {
                i = inChallenge('dc')
                    ? COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[0]
                    : getColChalRewEffects("dc")[3];
                tmp.value.main.upgrades[upgID].multiplier = tmp.value.main.upgrades[upgID].multiplier.mul(i.pow(tmp.value.main.upgrades[upgID].effective));

                if (inChallenge('dc')) {
                    tmp.value.main.upgrades[upgID].multiplier = tmp.value.main.upgrades[upgID].multiplier.pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[2]);
                }

                if (upgID > 0) {
                    player.value.gameProgress.main.upgrades[upgID - 1].accumulated = Decimal.add(player.value.gameProgress.main.upgrades[upgID - 1].accumulated, tmp.value.main.upgrades[upgID].effective.add(player.value.gameProgress.main.upgrades[upgID].accumulated).add(player.value.gameProgress.main.upgrades[upgID].bought).mul(tmp.value.main.upgrades[upgID].multiplier).mul(delta))
                }

                tmp.value.main.upgrades[upgID].dc11FreeLvs = !player.value.gameProgress.inChallenge.dc.overall && Decimal.gte(timesCompleted("dc"), 11)
                    ? Decimal.max(player.value.gameProgress.main.upgrades[upgID].accumulated, 0).add(1).log2().add(1).pow(0.8).sub(1).div(0.8).add(1).ln().div(getColChalRewEffects("dc")[4]).add(1).pow(getColChalRewEffects("dc")[4]).sub(1)
                    : D(0)
            }

            tmp.value.main.upgrades[upgID].effectTextColor = "#FFFFFF";
            if (player.value.settings.scaleSoftColors) {
                for (let i = getSCSLAttribute(`upg${upgID + 1}` as ScSlItems, false).length - 1; i >= 0; i--) {
                    if (Decimal.gte(tmp.value.main.upgrades[upgID].effect, getSCSLAttribute(`upg${upgID + 1}` as ScSlItems, false)[i].start)) {
                        tmp.value.main.upgrades[upgID].effectTextColor = SOFT_ATTR[i].color;
                        break;
                    }
                }
            }

            tmp.value.main.upgrades[upgID].costTextColor = "#FFFFFF";
            if (player.value.settings.scaleSoftColors) {
                for (let i = getSCSLAttribute(`upg${upgID + 1}` as ScSlItems, true).length - 1; i >= 0; i--) {
                    if (Decimal.gte(player.value.gameProgress.main.upgrades[upgID].bought, getSCSLAttribute(`upg${upgID + 1}` as ScSlItems, true)[i].start)) {
                        tmp.value.main.upgrades[upgID].costTextColor = SCALE_ATTR[i].color;
                        break;
                    }
                } 
            }

            if (player.value.gameProgress.main.upgrades[upgID].auto) {
                player.value.gameProgress.main.upgrades[upgID].bought = Decimal.max(player.value.gameProgress.main.upgrades[upgID].bought, tmp.value.main.upgrades[upgID].target.add(1).floor());
            }
            
            for (let i = 0; i < player.value.gameProgress.main.upgrades[upgID].boughtInReset.length; i++) {
                player.value.gameProgress.main.upgrades[upgID].boughtInReset[i] = Decimal.max(player.value.gameProgress.main.upgrades[upgID].boughtInReset[i]!, player.value.gameProgress.main.upgrades[upgID].bought);
            }

            tmp.value.main.upgrades[upgID].canBuy = Decimal.gte(player.value.gameProgress.main.points, tmp.value.main.upgrades[upgID].cost);
            player.value.gameProgress.main.upgrades[upgID].best = Decimal.max(player.value.gameProgress.main.upgrades[upgID].best, player.value.gameProgress.main.upgrades[upgID].bought);
            break;
        case 0: // prai
            tmp.value.main.prai.effActive = true;

            player.value.gameProgress.main.prai.timeInPRai = Decimal.add(player.value.gameProgress.main.prai.timeInPRai, delta);

            resetFactor([2, 2]);
            tmp.value.main.prai.req = D(1e6);
            tmp.value.main.prai.gainExp = D(1 / 3);
            pushFactor([2, 2], LABELS.def, `${format(tmp.value.main.prai.gainExp, 3)}`, `^${format(tmp.value.main.prai.gainExp, 3)}`)

            if (ifAchievement(1, 8)) {
                tmp.value.main.prai.gainExp = tmp.value.main.prai.gainExp.add(5/3000);
                pushFactor([2, 2], LABELS.ach1_8, `+${format(5/3000, 3)}`, `^${format(tmp.value.main.prai.gainExp, 3)}`, "ach")
            }

            if (player.value.gameProgress.layer4.gro.upgrades.idle.includes(0)) {
                tmp.value.main.prai.gainExp = tmp.value.main.prai.gainExp.add(GROWAN_UPGS.idle[0].eff!.value)
                pushFactor([2, 2], LABELS.giu1, `+${format(GROWAN_UPGS.idle[0].eff!.value, 3)}`, `^${format(tmp.value.main.prai.gainExp, 3)}`, "col");
            }

            if (Decimal.gte(player.value.gameProgress.main.pr2.amount, 1) && Decimal.gte(player.value.gameProgress.main.totals[0]!, tmp.value.main.prai.req)) {
                let eff, txt;
                i = D(1);
                resetFactor([2, 0]);

                for (let j = 0; j < PRAI_GAIN_CALC.length; j++) {
                    PRAI_GAIN_CALC[j].active = PRAI_GAIN_CALC[j].baseActive.value;

                    txt = '';
                    if (PRAI_GAIN_CALC[j].active) {
                        eff = PRAI_GAIN_CALC[j].effect.value;

                        if (PRAI_GAIN_CALC[j].type === 'mult') {
                            if (inChallenge('dc') && PRAI_GAIN_CALC[j].name.value !== 'Base') {
                                eff = eff.max(1).log10().add(1).pow(0.5).sub(1).pow10();
                            }
                            i = i.mul(eff);
                            txt = `×${format(eff, 2)}`;
                        }
                        if (PRAI_GAIN_CALC[j].type === 'pow') {
                            i = i.pow(eff);
                            txt = `^${format(eff, 3)}`;
                        }

                        if (PRAI_GAIN_CALC[j].name.value === 'Base') {
                            txt = `(1+${format(tmp.value.main.prai.gainExp, 3)}(${format(player.value.gameProgress.main.totals[0]!)}/${format(tmp.value.main.prai.req)})^${format(tmp.value.main.prai.gainExp, 3)}-1) dilate ${format(0.9, 2)}`;
                        }
                        pushFactor([2, 0], PRAI_GAIN_CALC[j].name.value, txt, `${format(i, 1)}`, PRAI_GAIN_CALC[j].color);
                    }
                }

                const data = {
                    oldGain: i,
                    oldPRai: D(0),
                    newPRai: D(0),
                };
                data.oldPRai = Decimal.max(player.value.gameProgress.main.prai.amount, 10);

                if (inChallenge("df")) {
                    data.newPRai = scale(scale(scale(scale(data.oldPRai.max(10).log10(), 0.2, true, 1, 1, Decimal.pow(0.9, challengeDepth("df"))).pow10().add(i).log10(), 0.2, false, 1, 1, Decimal.pow(0.9, challengeDepth("df"))).pow10(), 0.2, true, 10, 1, Decimal.pow(0.75, challengeDepth("df"))).add(i), 0.2, false, 10, 1, Decimal.pow(0.75, challengeDepth("df")));

                    i = data.newPRai.sub(data.oldPRai).max(1);
                    pushFactor([2, 0], "Decaying Feeling", `/${format(Decimal.div(data.oldGain, i), 2)}`, `${format(i)}`, "col")
                }

                tmp.value.main.prai.pending = i.floor().max(0);

                i = tmp.value.main.prai.pending.add(1).floor();
                if (Decimal.gte(getColResLevel(1), 1)) {
                    i = i.div(getColResEffect(1));
                }
                if (ifAchievement(2, 1)) {
                    i = i.div(5);
                }
                if (ifAchievement(1, 11)) {
                    i = i.div(getAchievementEffect(1, 11));
                }
                if (getKuaUpgrade("s", 8)) {
                    i = i.div(KUA_UPGRADES.KShards[7].eff!.value);
                }
                if (Decimal.gt(player.value.gameProgress.kua.kshards.amount, 0)) {
                    i = i.div(tmp.value.kua.effects.kshardPassive);
                }
                if (Decimal.gte(player.value.gameProgress.main.oneUpgrades[3], 1)) {
                    i = i.div(MAIN_ONE_UPGS[3].effect.value);
                }
                if (player.value.gameProgress.unlocks.pr2) {
                    i = i.div(tmp.value.main.pr2.effActive ? tmp.value.main.pr2.effect : 1);
                }
                i = i.log10().root(0.9).pow10().sub(1).div(tmp.value.main.prai.gainExp).add(1).root(tmp.value.main.prai.gainExp).mul(tmp.value.main.prai.req);
                tmp.value.main.prai.next = i.sub(player.value.gameProgress.main.totals[0]!);
            } else {
                tmp.value.main.prai.pending = Decimal.max(player.value.gameProgress.main.totals[0]!, 1e6).div(1e6).log(1e2).add(1).min(10).floor(); // hidden thing, usually 1 but when ppl decide to go further, they should get rewarded somehow
                tmp.value.main.prai.next = tmp.value.main.prai.req.sub(player.value.gameProgress.main.totals[0]!).div(tmp.value.main.pps);

                for (let j = 0; j < PRAI_GAIN_CALC.length; j++) {
                    setFactor(j, [2, 0], '', '', '', false);
                }
            }

            if (player.value.gameProgress.main.prai.auto) { 
                generate = tmp.value.main.prai.pending.mul(delta).mul(0.0001);
                if (player.value.gameProgress.kua.upgrades >= 1) {
                    generate = generate.mul(100);
                }
                if (player.value.gameProgress.layer4.gro.upgrades.idle.includes(0)) {
                    generate = generate.mul(10);
                }
                if (inChallenge("df")) {
                    generate = generate.mul(10000);
                }
                player.value.gameProgress.main.prai.amount = Decimal.add(player.value.gameProgress.main.prai.amount, generate);
                updateAllTotal(player.value.gameProgress.main.prai.totals, generate);
                player.value.gameProgress.main.prai.totalEver = Decimal.add(player.value.gameProgress.main.prai.totalEver, generate);
            }

            NaNCheck(player.value.gameProgress.main.prai.amount, 'PRai amount is NaN!');

            j = D(4);
            if (ifAchievement(0, 5)) {
                j = j.mul(1.25);
            }

            i = D(player.value.gameProgress.main.prai.amount);
            setFactor(0, [2, 1], "Base", `${format(player.value.gameProgress.main.prai.amount)}`, `×${format(i, 2)}`, true);

            i = i.mul(j).add(1).log10().pow(0.975).pow10();
            setFactor(1, [2, 1], "Base Mult", `(${format(player.value.gameProgress.main.prai.amount)} × ${format(j)}) dilate ${format(0.975, 3)}`, `×${format(i, 2)}`, true);

            if (ifAchievement(0, 9)) {
                i = i.mul(2);
            }
            setFactor(2, [2, 1], "Achievement ID: (0, 9)", `×${format(2)}`, `×${format(i, 2)}`, ifAchievement(0, 9), "ach");

            if (ifAchievement(0, 17)) {
                i = i.mul(getAchievementEffect(0, 17));
            }
            setFactor(3, [2, 1], "Achievement ID: (0, 17)", `×${format(getAchievementEffect(0, 17), 2)}`, `×${format(i, 2)}`, ifAchievement(0, 17), "ach");

            if (getKuaUpgrade("s", 2)) {
                i = i.mul(KUA_UPGRADES.KShards[1].eff!.value);
            }
            setFactor(4, [2, 1], "KShard Upgrade 2", `×${format(KUA_UPGRADES.KShards[1].eff!.value, 2)}`, `×${format(i, 2)}`, getKuaUpgrade("s", 2), "kua");

            if (getKuaUpgrade("p", 5)) {
                i = i.pow(KUA_UPGRADES.KPower[4].eff!.value);
            }
            setFactor(5, [2, 1], "KPower Upgrade 5", `^${format(KUA_UPGRADES.KPower[4].eff!.value, 3)}`, `×${format(i, 2)}`, getKuaUpgrade("p", 5), "kua");

            if (inChallenge("su") && Decimal.gte(challengeDepth("su"), 9)) {
                i = i.pow(getColChalCondEffects("su")[3]);
            }
            setFactor(6, [2, 1], `Sabotaged Upgrades ×${format(challengeDepth("su"))}`, `^${format(getColChalCondEffects("su")[3], 3)}`, `×${format(i, 2)}`, inChallenge("su") && Decimal.gte(challengeDepth("su"), 9), "col");

            if (Decimal.gt(player.value.gameProgress.layer4.gro.totalAmt, 0)) {
                i = i.pow(tmp.value.layer4.growan.solEff.prai);
            }
            setFactor(7, [2, 1], "Grōwan Solution Effect", `^${format(tmp.value.layer4.growan.solEff.prai, 3)}`, `×${format(i, 2)}`, Decimal.gt(player.value.gameProgress.layer4.gro.totalAmt, 0), "growan");

            tmp.value.main.prai.effect = i;

            i = Decimal.add(player.value.gameProgress.main.prai.amount, tmp.value.main.prai.pending);
            i = i.mul(j).add(1).log10().pow(0.975).pow10();
            if (ifAchievement(0, 9)) {
                i = i.mul(2);
            }
            if (ifAchievement(0, 17)) {
                i = i.mul(getAchievementEffect(0, 17));
            }
            if (getKuaUpgrade("p", 2)) {
                i = i.mul(KUA_UPGRADES.KShards[1].eff!.value);
            } 
            if (getKuaUpgrade("p", 5)) {
                i = i.pow(KUA_UPGRADES.KPower[4].eff!.value);
            }
            if (inChallenge("su") && Decimal.gte(challengeDepth("su"), 9)) {
                i = i.pow(getColChalCondEffects("su")[3]);
            }
            if (Decimal.gt(player.value.gameProgress.layer4.gro.totalAmt, 0)) {
                i = i.pow(tmp.value.layer4.growan.solEff.prai);
            }
            tmp.value.main.prai.nextEffect = i;

            updateAllBest(player.value.gameProgress.main.prai.best, player.value.gameProgress.main.prai.amount);
            player.value.gameProgress.main.prai.bestEver = Decimal.max(player.value.gameProgress.main.prai.bestEver, player.value.gameProgress.main.prai.amount);
            tmp.value.main.prai.canDo = Decimal.gte(player.value.gameProgress.main.totals[0]!, tmp.value.main.prai.req);
            break;
        case 1: // pr2
            tmp.value.main.pr2.effActive = true;

            i = D(10);
            setFactor(0, [3, 1], "Base", `${format(10, 2)}`, `${format(i, 2)}^`, true);
            if (ifAchievement(0, 14)) {
                i = i.sub(1);
            }
            setFactor(1, [3, 1], "Achievement ID: (0, 14)", `-${format(1, 2)}`, `${format(i, 2)}^`, ifAchievement(0, 14), "ach");

            if (getKuaUpgrade("k", 3)) { 
                i = i.sub(1); 
            }
            setFactor(2, [3, 1], "Kuaraniai Upgrade 4", `-${format(1, 2)}`, `${format(i, 2)}^`, getKuaUpgrade("k", 3), "kua");

            if (getKuaUpgrade("k", 4)) { 
                i = i.sub(1);
            }
            setFactor(3, [3, 1], "Kuaraniai Upgrade 5", `-${format(1, 2)}`, `${format(i, 2)}^`, getKuaUpgrade("k", 4), "kua");

            tmp.value.main.pr2.cost = getPR2Cost(player.value.gameProgress.main.pr2.amount, false, true);

            tmp.value.main.pr2.target = getPR2Cost(player.value.gameProgress.main.prai.amount, true, false);

            if (player.value.gameProgress.main.pr2.auto) {
                player.value.gameProgress.main.pr2.amount = Decimal.max(player.value.gameProgress.main.pr2.amount, tmp.value.main.pr2.target.add(1).floor());
            }

            j = D(0.05);
            setFactor(0, [3, 3], "Base", `${format(0.05, 2)}`, `${format(j.add(1), 2)}^`, true);
            if (getKuaUpgrade("s", 5)) {
                j = j.mul(2);
            }
            setFactor(1, [3, 3], "KShard Upgrade 5", `×${format(2, 2)}`, `${format(j.add(1), 2)}^`, getKuaUpgrade("s", 5), "kua");

            i = D(player.value.gameProgress.main.pr2.amount);
            setFactor(0, [3, 2], "Base", `${format(player.value.gameProgress.main.pr2.amount)}`, `${format(i)} effective`, true);

            if (Decimal.gte(player.value.gameProgress.main.oneUpgrades[8], 1)) {
                i = i.add(MAIN_ONE_UPGS[8].effect.value);
            }
            setFactor(1, [3, 2], "One Upgrade #9", `+${format(MAIN_ONE_UPGS[8].effect.value, 2)}`, `${format(i)} effective`, Decimal.gte(player.value.gameProgress.main.oneUpgrades[8], 1));
            tmp.value.main.pr2.effective = i;

            i = tmp.value.main.pr2.effective.max(0).add(1).pow(tmp.value.main.pr2.effective.mul(j).add(1).ln().add(1));
            setFactor(2, [3, 2], "Resulting Effect", `(${format(tmp.value.main.pr2.effective)} + 1) ^ (1 + ln(1 + (${format(j, 2)})(${format(tmp.value.main.pr2.effective)})))`, `×${format(i)}`, true);

            if (getKuaUpgrade("p", 8)) {
                i = Decimal.pow(j.add(1), tmp.value.main.pr2.effective).mul(i);
            }
            setFactor(3, [3, 2], "KPower Upgrade 8", `×(1 + ${format(j, 2)}) ^ (${format(tmp.value.main.pr2.effective)})`, `×${format(i)}`, getKuaUpgrade("p", 8), "kua");

            tmp.value.main.pr2.effect = i;

            updateAllBest(player.value.gameProgress.main.pr2.best, player.value.gameProgress.main.pr2.amount);
            player.value.gameProgress.main.pr2.bestEver = Decimal.max(player.value.gameProgress.main.pr2.bestEver, player.value.gameProgress.main.pr2.amount);

            tmp.value.main.pr2.canDo = Decimal.gte(player.value.gameProgress.main.prai.amount, Decimal.sub(tmp.value.main.pr2.cost, 0.5));

            tmp.value.main.pr2.costTextColor = "#FFFFFF";
            if (player.value.settings.scaleSoftColors) {
                for (let i = getSCSLAttribute('pr2', true).length - 1; i >= 0; i--) {
                    if (Decimal.gte(player.value.gameProgress.main.pr2.amount, getSCSLAttribute('pr2', true)[i].start)) {
                        tmp.value.main.pr2.costTextColor = SCALE_ATTR[i].color;
                        break;
                    }
                }
            }

            tmp.value.main.pr2.textEffect = {when: D(0), txt: ''};
            if (Decimal.lte(player.value.gameProgress.main.pr2.amount, PR2_EFF[PR2_EFF.length - 1].when)) {
                // this feels cursed not putting a "let i"
                for (i = 0; i < PR2_EFF.length; i++) {
                    // console.log(`${format(player.value.gameProgress.main.pr2.amount)} < ${PR2_EFF[i].when} & ${PR2_EFF[i].show}`)
                    if (Decimal.lt(player.value.gameProgress.main.pr2.amount, PR2_EFF[i].when) && PR2_EFF[i].show.value) {
                        tmp.value.main.pr2.textEffect = {when: PR2_EFF[i].when, txt: PR2_EFF[i].text.value};
                        break;
                    }
                }
            }
            break;
        default:
            throw new RangeError(`updateStart threw! ${whatToUpdate} is not something that can be updated, or it doesn't exist!`)
    }
}

export const getPR2Cost = (x: DecimalSource, inverse: boolean, updateFact: boolean) => {
    let costExp = D(10);
    if (updateFact) {
        setFactor(0, [3, 1], "Base", `${format(10, 2)}`, `${format(costExp, 2)}^`, true);
    }

    if (ifAchievement(0, 14)) {
        costExp = costExp.sub(1);
    }
    if (updateFact) {
        setFactor(1, [3, 1], "Achievement ID: (0, 14)", `-${format(1, 2)}`, `${format(costExp, 2)}^`, ifAchievement(0, 14), "ach");
    }

    if (getKuaUpgrade("k", 3)) { 
        costExp = costExp.sub(1); 
    }
    if (updateFact) {
        setFactor(2, [3, 1], "Kuaraniai Upgrade 4", `-${format(1, 2)}`, `${format(costExp, 2)}^`, getKuaUpgrade("k", 3), "kua");
    }

    if (getKuaUpgrade("k", 4)) { 
        costExp = costExp.sub(1);
    }
    if (updateFact) {
        setFactor(3, [3, 1], "Kuaraniai Upgrade 5", `-${format(1, 2)}`, `${format(costExp, 2)}^`, getKuaUpgrade("k", 4), "kua");
    }

    let cost = D(x);
    if (inverse) {
        if (ifAchievement(0, 7)) {
            cost = cost.mul(1.5);
        }

        if (cost.lt(costExp)) {
            return D(0);
        }

        cost = smoothPoly(smoothExp(cost.log(costExp).sub(1), 1.03, true), 2, 200, true);

        cost = cost.mul(KUA_ENHANCERS.enhances[6].effect());

        cost = doAllScaling(cost, getSCSLAttribute('pr2', true), true);

        if (inChallenge("im")) {
            cost = cost.div(Decimal.pow(1.2, challengeDepth("im")))
        }
    } else {
        if (updateFact) {
            setFactor(0, [3, 0], "Base", `${format(cost)}`, `${format(cost)} effective`, true);
        }

        if (inChallenge("im")) {
            cost = cost.mul(Decimal.pow(1.2, challengeDepth("im")))
        }
        if (updateFact) {
            setFactor(1, [3, 0], `Inverted Mechanics ×${format(challengeDepth("im"))}`, `×${format(Decimal.pow(1.2, challengeDepth("im")), 3)}`, `${format(cost)} effective`, inChallenge("im"), "col");
        }

        cost = doAllScaling(cost, getSCSLAttribute('pr2', true), false);
        if (updateFact) {
            setFactor(2, [3, 0], "Scaling", `scaling(${format(cost)})`, `${format(cost)} effective`, true);
        }

        cost = cost.div(KUA_ENHANCERS.enhances[6].effect())

        const effective = cost;
        cost = smoothExp(smoothPoly(cost, 2, 200, false), 1.03, false).add(1).pow_base(costExp);
        if (updateFact) {
            setFactor(3, [3, 0], "Resulting Requirement", `${format(costExp, 2)} ^ (${format(effective)} × 1.03 ^ (${format(effective)}) ^ 2) (approx.)`, `${format(cost)}`, true);
        }

        if (ifAchievement(0, 7)) {
            cost = cost.div(1.5);
        }
        if (updateFact) {
            setFactor(4, [3, 0], "Achievement ID: (0, 7)", `/${format(1.5, 2)}`, `${format(cost)}`, ifAchievement(0, 7), "ach");
        }
    }

    return cost;
}