import Decimal, { type DecimalSource } from 'break_eternity.js'
import { format, formatPerc } from '@/format'
import { tmp, player, NaNCheck, type TrueFactor } from '@/main'
import { scale, D, smoothPoly, smoothExp, expQuadCostGrowth } from '@/calc'
import { getSCSLAttribute, SCALE_ATTR, SOFT_ATTR, doAllScaling, type ScSlItems } from '@/softcapScaling'
import { getAchievementEffect, ifAchievement, setAchievement } from '../../Game_Achievements/Game_Achievements'
import { LABELS, pushFactor, resetFactor, setFactor } from '../../Game_Stats/Game_Stats'
import { computed } from 'vue'
import { challengeDepth, getColChalCondEffects, getColChalRewEffects, inChallenge, timesCompleted } from '../Game_Colosseum/Game_ColChallenges/Game_ColChalHandler'
import { getKuaUpgrade, KUA_UPGRADES } from '../Game_Kuaraniai/Game_KuaUpgrades/Game_KuaUpgrades'
import { KUA_ENHANCERS } from '../Game_Kuaraniai/Game_KuaEnhancers/Game.KuaEnhancers'
import { COL_CHALLENGES } from '../Game_Colosseum/Game_ColChallenges/Game_ColChalData'
import { getColResEffect, getColResLevel } from '../Game_Colosseum/Game_ColResearches/Game_ColResearches'
import { getOMUpgrade, MAIN_ONE_UPGS, maxxedOMUpgrade } from './Game_OneUpgrades/Game_OneUpgrades'
import { GROWAN_UPGS, hasGrowanMilestone } from '../Game_Layer4/Game_Growan/Game_Growan'
import { MAIN_UPG_DATA, MAIN_UPGRADE_COST_DATA } from './Game_MainUpgrades/Game_MainUpgrades'

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
        show: computed(() => { return Decimal.gt(player.value.prog.kua.amount, 0.0001) }),
        when: D(12),
        text: computed(() => { return `unlock the Upgrade 4 autobuyer.`; })
    },
    {
        show: computed(() => { return Decimal.gt(player.value.prog.kua.amount, 0.0001); }),
        when: D(14),
        text: computed(() => { return `unlock the Upgrade 5 autobuyer.`; })
    },
    {
        show: computed(() => { return !inChallenge('dc'); }),
        when: D(15),
        text: computed(() => { return `decrease Upgrade 2's superscaling strength by ${formatPerc(8 / 7, 3)}.`; })
    },
    {
        show: computed(() => { return Decimal.gt(player.value.prog.kua.amount, 0.0001); }),
        when: D(18),
        text: computed(() => { return `unlock the Upgrade 3 and 6 autobuyer.`; })
    },
    {
        show: computed(() => { return true; }),
        when: D(20),
        text: computed(() => { return `slow down Upgrade 1's cost by ${format(2.5, 3)}%.`; })
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
        show: computed(() => { return Decimal.gt(player.value.prog.kua.amount, 0.0001) }),
        when: D(75),
        text: computed(() => { 
            if (player.value.prog.inChallenge.im.overall) {
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
            return Decimal.max(player.value.prog.main.totalInPrai, 0).div(tmp.value.main.prai.req).pow(tmp.value.main.prai.gainExp).sub(1).mul(tmp.value.main.prai.gainExp).add(1).log10().pow(0.9).pow10();
        }),
        color: 'norm',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return player.value.prog.unlocks.pr2;
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
            return Decimal.gte(player.value.prog.main.oneUpgrades[3], 1);
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
            return Decimal.gt(player.value.prog.kua.kshards.amount, 0);
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
                total = total.add(player.value.prog.main.upgrades[i].bought);
            }
            return total.sqrt().pow_base(getColChalRewEffects("dc")[0]);
        }),
        color: 'col',
        type: 'mult'
    },
    {
        baseActive: computed(() => {
            return player.value.prog.layer4.gro.upgrades.overall.includes(1);
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
    updateOneUpgrades();
    updatePR2();
    updatePRai(delta);
    for (let i = MAIN_UPG_DATA.length - 1; i >= 0; i--) {
        updateMainUpgrades(delta, i);
    }

    if (Decimal.gt(delta, 0)) { // prevent instant achievement gets from not reaching condition
        updateMainAchievements();
    }
}

export const updateMainAchievements = () => {
    setAchievement(0, 17);
}

export const updateOneUpgrades = () => {
    tmp.value.main.canBuyUpg = false;
    for (let i = 0; i < MAIN_ONE_UPGS.length; i++) {
        if (player.value.prog.main.oneUpgrades[i] === undefined) { player.value.prog.main.oneUpgrades[i] = D(0); }
        tmp.value.main.oneUpgrades[i].canBuy = Decimal.gte(player.value.prog.main.prai.amount, MAIN_ONE_UPGS[i].cost.value);
        tmp.value.main.canBuyUpg = tmp.value.main.canBuyUpg || (tmp.value.main.oneUpgrades[i].canBuy && !maxxedOMUpgrade(i) && MAIN_ONE_UPGS[i].show.value && Decimal.gte(player.value.prog.main.pr2.bestInLayer4, 6));
        if (Decimal.gte(player.value.prog.main.pr2.amount, 75) && player.value.prog.inChallenge.im.overall && MAIN_ONE_UPGS[i].show.value) {
            player.value.prog.main.oneUpgrades[i] = Decimal.max(player.value.prog.main.oneUpgrades[i], MAIN_ONE_UPGS[i].target.value.floor().add(1));
        }
    }
}

export const updateMainUpgrades = (delta: DecimalSource, index: number) => {
    const tempMainUpg = tmp.value.main.upgrades[index];
    const playerMainUpg = player.value.prog.main.upgrades[index];
    let i, scal, shown, autoUnlocked, display, totalDisp;

    tempMainUpg.active = true;
    if ((index === 3 || index === 4 || index === 5) && (inChallenge("su") && Decimal.gte(challengeDepth("su"), 8))) {
        tempMainUpg.active = false;
    }

    tempMainUpg.costBase = MAIN_UPGRADE_COST_DATA[index];

    if (index === 3 || index === 4 || index === 5) {
        if (Decimal.gte(getOMUpgrade(17), 1)) {
            tempMainUpg.costBase.scale[1] = tempMainUpg.costBase.scale[1].pow(Decimal.sub(1, MAIN_ONE_UPGS[17].effect.value));
        }
    }

    scal = D(playerMainUpg.bought);

    if (ifAchievement(1, 6)) {
        scal = scal.div(getAchievementEffect(1, 6));
    }

    if (index === 0) {
        if (Decimal.gte(player.value.prog.main.pr2.amount, 20)) {
            scal = scal.mul(0.975);
        }

        if (getKuaUpgrade("s", 7)) {
            scal = scal.mul(0.975);
        }

        if (getKuaUpgrade("p", 10)) {
            scal = scal.div(KUA_UPGRADES.KPower[9].eff!.value);
        }
    }
    if (index === 1) {
        if (getKuaUpgrade("s", 9)) {
            scal = scal.sub(KUA_UPGRADES.KShards[8].eff!.value);
        }

        if (getKuaUpgrade("p", 10)) {
            scal = scal.div(KUA_UPGRADES.KPower[9].eff!.value);
        }

        if (getKuaUpgrade("p", 13)) {
            scal = scal.mul(0.9)
        }
    }
    if (index === 2) {
        if (Decimal.gte(player.value.prog.main.pr2.amount, 11)) {
            scal = scal.div(10 / 9);
        }
    }
    if (index === 3 || index === 4 || index === 5) {
        if (getKuaUpgrade("p", 11)) {
            scal = scal.mul(0.9);
        }
    }
    if (inChallenge("su")) {
        scal = scal.mul(getColChalCondEffects("su")[0]);
    }

    if (inChallenge("dc")) {
        scal = scal.pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[3]).sub(1).pow10();
    }

    i = scal;
    scal = doAllScaling(scal, getSCSLAttribute(`upg${index + 1}` as ScSlItems, true), false);

    if (index === 3) {
        scal = scal.div(KUA_ENHANCERS.enhances[3].effect())
    }
    if (index === 4) {
        scal = scal.div(KUA_ENHANCERS.enhances[4].effect())
    }
    if (index === 5) {
        scal = scal.div(KUA_ENHANCERS.enhances[5].effect())
    }

    tempMainUpg.cost = expQuadCostGrowth(scal, tempMainUpg.costBase.scale[2], tempMainUpg.costBase.scale[1], tempMainUpg.costBase.scale[0], tempMainUpg.costBase.exp, false);

    if (index === 0) {
        if (Decimal.gte(player.value.prog.main.upgrades[7].bought, 1)) {
            tempMainUpg.cost = tempMainUpg.cost.pow(tmp.value.main.upgrades[7].effect ?? 1);
        }
        tempMainUpg.cost = tempMainUpg.cost.div(tmp.value.main.upgrades[1].effect ?? 1);
        tempMainUpg.cost = tempMainUpg.cost.div(tmp.value.main.upgrades[4].effect ?? 1);
    }

    if (index === 1) {
        if (Decimal.gte(player.value.prog.main.oneUpgrades[0], 1)) {
            tempMainUpg.cost = tempMainUpg.cost.div(MAIN_ONE_UPGS[0].effect.value);
        }
    }

    if (inChallenge('im') && Decimal.gte(playerMainUpg.bought, 1)) {
        tempMainUpg.cost = D(Infinity);
    }

    tempMainUpg.target = D(0);

    if (Decimal.gte(player.value.prog.main.points, tempMainUpg.costBase.scale[0])) {
        i = D(player.value.prog.main.points);
        if (index === 1) {
            if (Decimal.gte(player.value.prog.main.oneUpgrades[0], 1)) {
                i = i.mul(MAIN_ONE_UPGS[0].effect.value);
            }
        }
        if (index === 0) {
            i = i.mul(tmp.value.main.upgrades[4].effect ?? 1);
            i = i.mul(tmp.value.main.upgrades[1].effect ?? 1);
            i = i.root(tmp.value.main.upgrades[7].effect ?? 1);
        }

        scal = expQuadCostGrowth(i, tempMainUpg.costBase.scale[2], tempMainUpg.costBase.scale[1], tempMainUpg.costBase.scale[0], tempMainUpg.costBase.exp, true);

        if (index === 5) {
            scal = scal.mul(KUA_ENHANCERS.enhances[5].effect());
        }
        if (index === 4) {
            scal = scal.mul(KUA_ENHANCERS.enhances[4].effect());
        }
        if (index === 3) {
            scal = scal.mul(KUA_ENHANCERS.enhances[3].effect());
        }

        scal = doAllScaling(scal, getSCSLAttribute(`upg${index + 1}` as ScSlItems, true), true);
        if (inChallenge("dc")) {
            scal = scal.log10().add(1).root(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[3]);
        }
        if (inChallenge("su")) {
            scal = scal.div(getColChalCondEffects("su")[0]);
        }
        if (index === 3 || index === 4 || index === 5) {
            if (getKuaUpgrade("p", 11)) {
                scal = scal.div(0.9);
            }
        }
        if (index === 2) {
            if (Decimal.gte(player.value.prog.main.pr2.amount, 11)) {
                scal = scal.mul(10 / 9);
            }
        }
        if (index === 1) {
            if (getKuaUpgrade("p", 13)) {
                scal = scal.div(0.9)
            }
            if (getKuaUpgrade("p", 10)) {
                scal = scal.mul(KUA_UPGRADES.KPower[9].eff!.value)
            }
            if (getKuaUpgrade("s", 9)) {
                scal = scal.add(KUA_UPGRADES.KShards[8].eff!.value);
            }
        }
        if (index === 0) {
            if (getKuaUpgrade("p", 10)) {
                scal = scal.mul(KUA_UPGRADES.KPower[9].eff!.value)
            }
            if (getKuaUpgrade("s", 7)) {
                scal = scal.div(0.975);
            }
            if (Decimal.gte(player.value.prog.main.pr2.amount, 20)) {
                scal = scal.div(0.975)
            }
        }
        if (ifAchievement(1, 6)) {
            scal = scal.mul(getAchievementEffect(1, 6));
        }

        if (inChallenge('im')) {
            scal = D(0);
        }
        tempMainUpg.target = scal;
    }

    tempMainUpg.effect = MAIN_UPG_DATA[index].effect.value;
    tempMainUpg.effective = MAIN_UPG_DATA[index].effective.value;
    tempMainUpg.freeExtra = MAIN_UPG_DATA[index].freeExtra.value;
    tempMainUpg.effectBase = MAIN_UPG_DATA[index].effectBase.value;

    tempMainUpg.calcEB = tempMainUpg.effectBase;
    switch (index) {
        case 0:
            shown = true;
            autoUnlocked = (Decimal.gte(player.value.prog.main.pr2.bestInLayer4, 2) && hasGrowanMilestone(3)) || Decimal.gte(player.value.prog.main.pr2.amount, 2);
            break;
        case 1:
            shown = Decimal.gte(player.value.prog.main.pr2.bestInLayer4, 1);
            autoUnlocked = (Decimal.gte(player.value.prog.main.pr2.bestInLayer4, 4) && hasGrowanMilestone(3)) || Decimal.gte(player.value.prog.main.pr2.amount, 4);
            break;
        case 2:
            shown = Decimal.gte(player.value.prog.main.pr2.bestInLayer4, 5);
            autoUnlocked = (Decimal.gte(player.value.prog.main.pr2.bestInLayer4, 18) && hasGrowanMilestone(3)) || Decimal.gte(player.value.prog.main.pr2.amount, 18);
            break;
        case 3:
            shown = Decimal.gt(player.value.prog.kua.amount, 0);
            autoUnlocked = (Decimal.gte(player.value.prog.main.pr2.bestInLayer4, 12) && hasGrowanMilestone(3)) || Decimal.gte(player.value.prog.main.pr2.amount, 12);
            break;
        case 4:
            shown = Decimal.gte(player.value.prog.kua.kshards.amount, 0.01);
            autoUnlocked = (Decimal.gte(player.value.prog.main.pr2.bestInLayer4, 14) && hasGrowanMilestone(3)) || Decimal.gte(player.value.prog.main.pr2.amount, 14);
            break;
        case 5:
            shown = Decimal.gte(player.value.prog.kua.kpower.amount, 1);
            autoUnlocked = (Decimal.gte(player.value.prog.main.pr2.bestInLayer4, 18) && hasGrowanMilestone(3)) || Decimal.gte(player.value.prog.main.pr2.amount, 18);
            break;
        case 6:
            shown = getKuaUpgrade('s', 15);
            autoUnlocked = (Decimal.gte(player.value.prog.main.pr2.bestInLayer4, 100) && hasGrowanMilestone(3)) || Decimal.gte(player.value.prog.main.pr2.amount, 100);
            break;
        case 7:
            shown = getKuaUpgrade('s', 16);
            autoUnlocked = (Decimal.gte(player.value.prog.main.pr2.bestInLayer4, 125) && hasGrowanMilestone(3)) || Decimal.gte(player.value.prog.main.pr2.amount, 125);
            break;
        case 8:
            shown = getKuaUpgrade('s', 17);
            autoUnlocked = (Decimal.gte(player.value.prog.main.pr2.bestInLayer4, 150) && hasGrowanMilestone(3)) || Decimal.gte(player.value.prog.main.pr2.amount, 150);
            break;
        default:
            throw new Error(`${index} is not a valid index for main upgrade`);
    }
    if (index >= 0 && index < 9 && hasGrowanMilestone(2)) {
        shown = true;
    }
    if (index >= 0 && index < 9 && hasGrowanMilestone(3)) {
        autoUnlocked = true;
    }
    tempMainUpg.shown = shown;
    tempMainUpg.autoUnlocked = autoUnlocked;

    // switch (index) {
    //     case 0:
    //     case 1:
    //     case 3:
    //     case 4:
    //     case 6:
    //     case 7:
    //     case 8:
    //         tempMainUpg.calcEB = MAIN_UPG_DATA[index].effect(Decimal.add(player.value.gameProgress.main.upgrades[index].bought, 1)).div(MAIN_UPG_DATA[index].effect());
    //         break;
    //     case 2:
    //     case 5:
    //         tempMainUpg.calcEB = MAIN_UPG_DATA[index].effect(Decimal.add(player.value.gameProgress.main.upgrades[index].bought, 1)).sub(MAIN_UPG_DATA[index].effect());
    //         break;
    //     default:
    //         throw new Error(`${index} is not a valid index for main upgrade`);
    // }

    totalDisp = `Total: `;
    switch (index) {
        case 0:
        case 3:
            display = `Increase point gain by ×`;
            totalDisp += `×${format(tempMainUpg.effect, 2)} to point gain`;
            break;
        case 1:
        case 4:
            display = `Decreases Upgrade 1's cost by /`;
            totalDisp += `/${format(tempMainUpg.effect, 2)} to Upgrade 1's cost`;
            break;
        case 2:
        case 5:
            display = `Increases Upgrade 1's base by +`;
            totalDisp += `+${format(tempMainUpg.effect, 3)} to Upgrade 1's base`;
            break;
        case 6:
            display = `Raise Upgrade 1's effect by ^`;
            totalDisp += `^${format(tempMainUpg.effect, 3)} to Upgrade 1's effect`;
            break;
        case 7:
            display = `Raise Upgrade 1's cost by ^`;
            totalDisp += `^${format(tempMainUpg.effect, 3)} to Upgrade 1's cost`;
            break;
        case 8:
            display = `Multiply Upgrade 1's base by ×`;
            totalDisp += `×${format(tempMainUpg.effect, 3)} to Upgrade 1's base`;
            break;
        default:
            throw new Error(`${index} is not a valid index for main upgrade`);
    }
    display += format(tempMainUpg.calcEB, 3);
    tempMainUpg.display = display;
    tempMainUpg.totalDisp = totalDisp;

    // this is only used for Col Challenge 'Dimension Crawler!'
    tempMainUpg.multiplier = D(1);
    if (inChallenge('dc') || Decimal.gte(timesCompleted("dc"), 10)) {
        i = inChallenge('dc')
            ? COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[0]
            : getColChalRewEffects("dc")[3];
        tempMainUpg.multiplier = tempMainUpg.multiplier.mul(i.pow(tempMainUpg.effective));

        if (inChallenge('dc')) {
            tempMainUpg.multiplier = tempMainUpg.multiplier.pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[2]);
        }

        if (index > 0) {
            player.value.prog.main.upgrades[index - 1].accumulated = Decimal.add(player.value.prog.main.upgrades[index - 1].accumulated, tempMainUpg.effective.add(playerMainUpg.accumulated).add(playerMainUpg.bought).mul(tempMainUpg.multiplier).mul(delta))
        }

        tempMainUpg.dc11FreeLvs = !player.value.prog.inChallenge.dc.overall && Decimal.gte(timesCompleted("dc"), 11)
            ? Decimal.max(playerMainUpg.accumulated, 0).add(1).log2().add(1).pow(0.8).sub(1).div(0.8).add(1).ln().div(getColChalRewEffects("dc")[4]).add(1).pow(getColChalRewEffects("dc")[4]).sub(1)
            : D(0)
    }

    tempMainUpg.effectTextColor = "#FFFFFF";
    if (player.value.settings.scaleSoftColors) {
        for (let i = getSCSLAttribute(`upg${index + 1}` as ScSlItems, false).length - 1; i >= 0; i--) {
            if (Decimal.gte(tempMainUpg.effect, getSCSLAttribute(`upg${index + 1}` as ScSlItems, false)[i].start)) {
                tempMainUpg.effectTextColor = SOFT_ATTR[i].color;
                break;
            }
        }
    }

    tempMainUpg.costTextColor = "#FFFFFF";
    if (player.value.settings.scaleSoftColors) {
        for (let i = getSCSLAttribute(`upg${index + 1}` as ScSlItems, true).length - 1; i >= 0; i--) {
            if (Decimal.gte(playerMainUpg.bought, getSCSLAttribute(`upg${index + 1}` as ScSlItems, true)[i].start)) {
                tempMainUpg.costTextColor = SCALE_ATTR[i].color;
                break;
            }
        } 
    }

    if (playerMainUpg.auto) {
        playerMainUpg.bought = Decimal.max(playerMainUpg.bought, tempMainUpg.target.add(1).floor());
    }

    // for (let i = 0; i < player.value.gameProgress.main.upgrades[index].boughtInReset.length; i++) {
    //     player.value.gameProgress.main.upgrades[index].boughtInReset[i] = Decimal.max(player.value.gameProgress.main.upgrades[index].boughtInReset[i]!, player.value.gameProgress.main.upgrades[index].bought);
    // }

    tempMainUpg.canBuy = Decimal.gte(player.value.prog.main.points, tempMainUpg.cost);
    playerMainUpg.best = Decimal.max(playerMainUpg.best, playerMainUpg.bought);
    playerMainUpg.boughtInKua = Decimal.max(playerMainUpg.boughtInKua, playerMainUpg.bought);
}

export const updatePRai = (delta: DecimalSource) => {
    const tempPRaiObj = tmp.value.main.prai;
    const playerPRaiObj = player.value.prog.main.prai;
    let i, j, generate;
    tempPRaiObj.effActive = true;

    playerPRaiObj.timeInPRai = Decimal.add(playerPRaiObj.timeInPRai, delta);

    tempPRaiObj.req = D(1e6);
    tempPRaiObj.gainExp = D(1 / 3);

    if (ifAchievement(1, 8)) {
        tempPRaiObj.gainExp = tempPRaiObj.gainExp.add(5/3000);
    }

    if (player.value.prog.layer4.gro.upgrades.idle.includes(0)) {
        tempPRaiObj.gainExp = tempPRaiObj.gainExp.add(GROWAN_UPGS.idle[0].eff!.value)
    }

    if (Decimal.gte(player.value.prog.main.pr2.amount, 1) && Decimal.gte(player.value.prog.main.totalInPrai, tempPRaiObj.req)) {
        let eff, txt;
        i = D(1);
        resetFactor([1, 0]);

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
                    txt = `~((${format(player.value.prog.main.totalInPrai)}/${format(tempPRaiObj.req)})^${format(tempPRaiObj.gainExp, 3)}) raised ^${format(0.9, 2)} to exponent`;
                }
                pushFactor([1, 0], PRAI_GAIN_CALC[j].name.value, txt, `${format(i, 1)}`, PRAI_GAIN_CALC[j].color);
            }
        }

        const data = {
            oldGain: i,
            oldPRai: D(0),
            newPRai: D(0),
        };
        data.oldPRai = Decimal.max(playerPRaiObj.amount, 10);

        if (inChallenge("df")) {
            data.newPRai = scale(scale(scale(scale(data.oldPRai.max(10).log10(), 0.2, true, 1, 1, Decimal.pow(0.9, challengeDepth("df"))).pow10().add(i).log10(), 0.2, false, 1, 1, Decimal.pow(0.9, challengeDepth("df"))).pow10(), 0.2, true, 10, 1, Decimal.pow(0.75, challengeDepth("df"))).add(i), 0.2, false, 10, 1, Decimal.pow(0.75, challengeDepth("df")));

            i = data.newPRai.sub(data.oldPRai).max(1);
            pushFactor([1, 0], "Decaying Feeling", `/${format(Decimal.div(data.oldGain, i), 2)}`, `${format(i)}`, "col")
        }

        tempPRaiObj.pending = i.floor().max(0);

        i = tempPRaiObj.pending.add(1).floor();
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
        if (Decimal.gt(player.value.prog.kua.kshards.amount, 0)) {
            i = i.div(tmp.value.kua.effects.kshardPassive);
        }
        if (Decimal.gte(player.value.prog.main.oneUpgrades[3], 1)) {
            i = i.div(MAIN_ONE_UPGS[3].effect.value);
        }
        if (player.value.prog.unlocks.pr2) {
            i = i.div(tmp.value.main.pr2.effActive ? tmp.value.main.pr2.effect : 1);
        }
        i = i.log10().root(0.9).pow10().sub(1).div(tempPRaiObj.gainExp).add(1).root(tempPRaiObj.gainExp).mul(tempPRaiObj.req);
        tempPRaiObj.next = i.sub(player.value.prog.main.totalInPrai);
    } else {
        tempPRaiObj.pending = Decimal.max(player.value.prog.main.totalInPrai, 1e6).div(1e6).log(1e2).add(1).min(10).floor(); // hidden thing, usually 1 but when ppl decide to go further, they should get rewarded somehow
        tempPRaiObj.next = tempPRaiObj.req.sub(player.value.prog.main.totalInPrai).div(tmp.value.main.pps);

        for (let j = 0; j < PRAI_GAIN_CALC.length; j++) {
            setFactor(j, [1, 0], '', '', '', false);
        }
    }

    if (playerPRaiObj.auto) { 
        generate = tempPRaiObj.pending.mul(delta).mul(0.0001);
        if (player.value.prog.kua.upgrades >= 1) {
            generate = generate.mul(100);
        }
        if (player.value.prog.layer4.gro.upgrades.idle.includes(0)) {
            generate = generate.mul(10);
        }
        if (inChallenge("df")) {
            generate = generate.mul(10000);
        }
        playerPRaiObj.amount = Decimal.add(playerPRaiObj.amount, generate);
        playerPRaiObj.totalInKua = Decimal.add(playerPRaiObj.totalInKua, generate);
    }
    

    NaNCheck(playerPRaiObj.amount, 'PRai amount is NaN!');

    j = D(4);
    if (ifAchievement(0, 5)) {
        j = j.mul(1.25);
    }

    i = D(playerPRaiObj.amount);
    setFactor(0, [1, 1], "Base", `${format(playerPRaiObj.amount)}`, `×${format(i, 2)}`, true);

    i = i.mul(j).add(1).log10().pow(0.975).pow10();
    setFactor(1, [1, 1], "Base Mult", `(${format(playerPRaiObj.amount)} × ${format(j)}) raised ^${format(0.975, 3)} to exponent`, `×${format(i, 2)}`, true);

    if (ifAchievement(0, 9)) {
        i = i.mul(2);
    }
    setFactor(2, [1, 1], "Achievement ID: (0, 9)", `×${format(2)}`, `×${format(i, 2)}`, ifAchievement(0, 9), "ach");

    if (ifAchievement(0, 17)) {
        i = i.mul(getAchievementEffect(0, 17));
    }
    setFactor(3, [1, 1], "Achievement ID: (0, 17)", `×${format(getAchievementEffect(0, 17), 2)}`, `×${format(i, 2)}`, ifAchievement(0, 17), "ach");

    if (getKuaUpgrade("s", 2)) {
        i = i.mul(KUA_UPGRADES.KShards[1].eff!.value);
    }
    setFactor(4, [1, 1], "KShard Upgrade 2", `×${format(KUA_UPGRADES.KShards[1].eff!.value, 2)}`, `×${format(i, 2)}`, getKuaUpgrade("s", 2), "kua");

    if (getKuaUpgrade("p", 5)) {
        i = i.pow(KUA_UPGRADES.KPower[4].eff!.value);
    }
    setFactor(5, [1, 1], "KPower Upgrade 5", `^${format(KUA_UPGRADES.KPower[4].eff!.value, 3)}`, `×${format(i, 2)}`, getKuaUpgrade("p", 5), "kua");

    if (inChallenge("su") && Decimal.gte(challengeDepth("su"), 9)) {
        i = i.pow(getColChalCondEffects("su")[3]);
    }
    setFactor(6, [1, 1], `Sabotaged Upgrades ×${format(challengeDepth("su"))}`, `^${format(getColChalCondEffects("su")[3], 3)}`, `×${format(i, 2)}`, inChallenge("su") && Decimal.gte(challengeDepth("su"), 9), "col");

    if (Decimal.gt(player.value.prog.layer4.gro.totalAmt, 0)) {
        i = i.pow(tmp.value.layer4.growan.solEff.prai);
    }
    setFactor(7, [1, 1], "Grōwan Solution Effect", `^${format(tmp.value.layer4.growan.solEff.prai, 3)}`, `×${format(i, 2)}`, Decimal.gt(player.value.prog.layer4.gro.totalAmt, 0), "growan");

    tempPRaiObj.effect = i;

    i = Decimal.add(playerPRaiObj.amount, tempPRaiObj.pending);
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
    if (Decimal.gt(player.value.prog.layer4.gro.totalAmt, 0)) {
        i = i.pow(tmp.value.layer4.growan.solEff.prai);
    }
    tempPRaiObj.nextEffect = i;

    playerPRaiObj.bestInKua = Decimal.max(playerPRaiObj.bestInKua, playerPRaiObj.amount);
    playerPRaiObj.bestEver = Decimal.max(playerPRaiObj.bestEver, playerPRaiObj.amount);
    tempPRaiObj.canDo = Decimal.gte(player.value.prog.main.totalInPrai, tempPRaiObj.req);
}

export const updatePR2 = () => {
    const tempPR2Obj = tmp.value.main.pr2;
    const playerPR2Obj = player.value.prog.main.pr2;
    let i;
    tempPR2Obj.effActive = true;

    i = D(10);
    setFactor(0, [2, 0], "Base", `${format(10, 2)}`, `${format(i, 2)}^`, true);
    if (ifAchievement(0, 14)) {
        i = i.sub(1);
    }
    setFactor(1, [2, 0], "Achievement ID: (0, 14)", `-${format(1, 2)}`, `${format(i, 2)}^`, ifAchievement(0, 14), "ach");

    if (getKuaUpgrade("k", 3)) { 
        i = i.sub(1); 
    }
    setFactor(2, [2, 0], "Kuaraniai Upgrade 4", `-${format(1, 2)}`, `${format(i, 2)}^`, getKuaUpgrade("k", 3), "kua");

    if (getKuaUpgrade("k", 4)) { 
        i = i.sub(1);
    }
    setFactor(3, [2, 0], "Kuaraniai Upgrade 5", `-${format(1, 2)}`, `${format(i, 2)}^`, getKuaUpgrade("k", 4), "kua");

    tempPR2Obj.cost = getPR2Cost(playerPR2Obj.amount, false, true);

    tempPR2Obj.target = getPR2Cost(player.value.prog.main.prai.amount, true, false);

    if (playerPR2Obj.auto) {
        playerPR2Obj.amount = Decimal.max(playerPR2Obj.amount, tempPR2Obj.target.add(1).floor());
    }

    tempPR2Obj.effect = getPR2Effect(playerPR2Obj.amount, true);
    tempPR2Obj.nextEffect = getPR2Effect(Decimal.add(playerPR2Obj.amount, 1), false);

    playerPR2Obj.bestEver = Decimal.max(playerPR2Obj.bestEver, playerPR2Obj.amount);
    playerPR2Obj.bestInLayer4 = Decimal.max(playerPR2Obj.bestInLayer4, playerPR2Obj.amount);

    tempPR2Obj.canDo = Decimal.gte(player.value.prog.main.prai.amount, Decimal.sub(tempPR2Obj.cost, 0.5));

    tempPR2Obj.costTextColor = "#FFFFFF";
    if (player.value.settings.scaleSoftColors) {
        for (let i = getSCSLAttribute('pr2', true).length - 1; i >= 0; i--) {
            if (Decimal.gte(playerPR2Obj.amount, getSCSLAttribute('pr2', true)[i].start)) {
                tempPR2Obj.costTextColor = SCALE_ATTR[i].color;
                break;
            }
        }
    }

    tempPR2Obj.textEffect = {when: D(0), txt: ''};
    if (Decimal.lte(playerPR2Obj.amount, PR2_EFF[PR2_EFF.length - 1].when)) {
        // this feels cursed not putting a "let i"
        for (i = 0; i < PR2_EFF.length; i++) {
            // console.log(`${format(player.value.gameProgress.main.pr2.amount)} < ${PR2_EFF[i].when} & ${PR2_EFF[i].show}`)
            if (Decimal.lt(playerPR2Obj.amount, PR2_EFF[i].when) && PR2_EFF[i].show.value) {
                tempPR2Obj.textEffect = {when: PR2_EFF[i].when, txt: PR2_EFF[i].text.value};
                break;
            }
        }
    }
}

export const getPR2Cost = (x: DecimalSource, inverse: boolean, updateFact: boolean) => {
    let costExp = D(10);
    if (ifAchievement(0, 14)) {
        costExp = costExp.sub(1);
    }

    if (getKuaUpgrade("k", 3)) { 
        costExp = costExp.sub(1); 
    }

    if (getKuaUpgrade("k", 4)) { 
        costExp = costExp.sub(1);
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
            setFactor(0, [2, 0], "Base", `${format(cost)}`, `${format(cost)} effective`, true);
        }

        if (inChallenge("im")) {
            cost = cost.mul(Decimal.pow(1.2, challengeDepth("im")))
        }
        if (updateFact) {
            setFactor(1, [2, 0], `Inverted Mechanics ×${format(challengeDepth("im"))}`, `×${format(Decimal.pow(1.2, challengeDepth("im")), 3)}`, `${format(cost)} effective`, inChallenge("im"), "col");
        }

        cost = doAllScaling(cost, getSCSLAttribute('pr2', true), false);
        if (updateFact) {
            setFactor(2, [2, 0], "Scaling", `scaling(${format(cost)})`, `${format(cost)} effective`, true);
        }

        cost = cost.div(KUA_ENHANCERS.enhances[6].effect())

        const effective = cost;
        cost = smoothExp(smoothPoly(cost, 2, 200, false), 1.03, false).add(1).pow_base(costExp);
        if (updateFact) {
            setFactor(3, [2, 0], "Resulting Requirement", `~${format(costExp, 2)} ^ (${format(effective)} × 1.03 ^ (${format(effective)}) ^ 2) `, `${format(cost)}`, true);
        }

        if (ifAchievement(0, 7)) {
            cost = cost.div(1.5);
        }
        if (updateFact) {
            setFactor(4, [2, 0], "Achievement ID: (0, 7)", `/${format(1.5, 2)}`, `${format(cost)}`, ifAchievement(0, 7), "ach");
        }
    }

    return cost;
}

export const getPR2Effect = (x: DecimalSource, updateFact: boolean) => {
    let j = D(0.05);
    if (getKuaUpgrade("s", 5)) {
        j = j.mul(2);
    }

    let i = D(x);
    if (updateFact) {
        setFactor(0, [2, 1], "Base", `${format(x)}`, `${format(i)} effective`, true);
    }

    if (Decimal.gte(player.value.prog.main.oneUpgrades[8], 1)) {
        i = i.add(MAIN_ONE_UPGS[8].effect.value);
    }
    if (updateFact) {
        setFactor(1, [2, 1], "One Upgrade #9", `+${format(MAIN_ONE_UPGS[8].effect.value, 2)}`, `${format(i)} effective`, Decimal.gte(player.value.prog.main.oneUpgrades[8], 1));
    }
    tmp.value.main.pr2.effective = i;

    i = tmp.value.main.pr2.effective.max(0).add(1).pow(tmp.value.main.pr2.effective.mul(j).add(1).ln().add(1));
    if (updateFact) {
        setFactor(2, [2, 1], "Resulting Effect", `(${format(tmp.value.main.pr2.effective)} + 1) ^ (1 + ln(1 + (${format(j, 2)})(${format(tmp.value.main.pr2.effective)})))`, `×${format(i)}`, true);
    }

    if (getKuaUpgrade("p", 8)) {
        i = Decimal.pow(j.add(1), tmp.value.main.pr2.effective).mul(i);
    }
    if (updateFact) {
        setFactor(3, [2, 1], "KPower Upgrade 8", `×(1 + ${format(j, 2)}) ^ (${format(tmp.value.main.pr2.effective)})`, `×${format(i)}`, getKuaUpgrade("p", 8), "kua");
    }

    return i;
}