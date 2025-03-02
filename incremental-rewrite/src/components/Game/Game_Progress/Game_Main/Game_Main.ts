import Decimal, { type DecimalSource } from 'break_eternity.js'
import { format, formatPerc } from '@/format'
import { tmp, player, NaNCheck, type TrueFactor } from '@/main'
import { D, smoothExp, smoothPoly } from '@/calc'
import { getAchievementEffect, ifAchievement } from '../../Game_Achievements/Game_Achievements'
import { LABELS, pushFactor, resetFactor, setFactor } from '../../Game_Stats/Game_Stats'
import { computed } from 'vue'
import { getKuaUpgrade, KUA_UPGRADES } from '../Game_Kuaraniai/Game_KuaUpgrades/Game_KuaUpgrades'
import { getColResEffect, getColResLevel } from '../Game_Colosseum/Game_ColResearches/Game_ColResearches'
import { MAIN_ONE_UPGS, maxxedOMUpgrade } from './Game_OneUpgrades/Game_OneUpgrades'
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
        text: computed(() => { return `unlock the Upgrade 2 Autobuyer and increase the Upgrade 2 base from ${format(3, 3)}x -> ${format(3.5, 3)}x.`; })
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
    // {
    //     show: computed(() => { return !inChallenge('dc'); }),
    //     when: D(15),
    //     text: computed(() => { return `decrease Upgrade 2's superscaling strength by ${formatPerc(8 / 7, 3)}.`; })
    // },
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
    // {
    //     show: computed(() => { return true; }),
    //     when: D(25),
    //     text: computed(() => { return inChallenge('dc') ? `keep One-Upgrades on Kuaraniai reset.` : `keep One-Upgrades, and Upgrade 1 and 2's scaling and super scaling starts ${format(15, 1)} later.`; })
    // },
    {
        show: computed(() => { return getKuaUpgrade("s", 11); }),
        when: D(45),
        text: computed(() => { return `boosts Kuaraniai effects based on how much PR2 you have.`; })
    },
    // {
    //     show: computed(() => { return Decimal.gt(player.value.gameProgress.kua.amount, 0.0001) }),
    //     when: D(75),
    //     text: computed(() => { 
    //         if (player.value.gameProgress.inChallenge.im.overall) {
    //             return `unlock the Kuaraniai generator (works by ${format(1)}%/s) and the One-Upgrade automator.`
    //         }
    //         return `unlock the Kuaraniai generator (works by ${format(1)}%/s).`; 
    //     })
    // },
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
            return Decimal.max(player.value.gameProgress.totalPointsInPrai, 0).div(tmp.value.main.prai.req).pow(tmp.value.main.prai.gainExp).sub(1).mul(tmp.value.main.prai.gainExp).add(1).log10().pow(0.9).pow10();
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
            return Decimal.gte(player.value.gameProgress.oneUpgrades[3], 1);
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
            return Decimal.gt(player.value.gameProgress.kua.kshards, 0);
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
    let i, j, generate, upgID;
    let shown = false;
    let autoUnlocked = false;
    let display = ``;
    let totalDisp = ``;
    switch (whatToUpdate) {
        case 2:
            tmp.value.main.canBuyUpg = false;
            for (let i = 0; i < MAIN_ONE_UPGS.length; i++) {
                if (player.value.gameProgress.oneUpgrades[i] === undefined) { player.value.gameProgress.oneUpgrades[i] = D(0); }
                tmp.value.main.oneUpgrades[i].canBuy = Decimal.gte(player.value.gameProgress.prai.amount, MAIN_ONE_UPGS[i].cost.value);
                tmp.value.main.canBuyUpg = tmp.value.main.canBuyUpg || (tmp.value.main.oneUpgrades[i].canBuy && !maxxedOMUpgrade(i) && MAIN_ONE_UPGS[i].show.value);
                // if (Decimal.gte(player.value.gameProgress.pr2.amount, 75) && player.value.gameProgress.inChallenge.im.overall && MAIN_ONE_UPGS[i].show.value) {
                //     player.value.gameProgress.oneUpgrades[i] = Decimal.max(player.value.gameProgress.oneUpgrades[i], MAIN_ONE_UPGS[i].target.value.floor().add(1));
                // }
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

            switch (upgID) {
                case 0:
                    shown = true;
                    autoUnlocked = (Decimal.gte(player.value.gameProgress.pr2.amount, 2) && hasGrowanMilestone(3)) || Decimal.gte(player.value.gameProgress.pr2.amount, 2);
                    break;
                case 1:
                    shown = Decimal.gte(player.value.gameProgress.pr2.amount, 1);
                    autoUnlocked = (Decimal.gte(player.value.gameProgress.pr2.amount, 4) && hasGrowanMilestone(3)) || Decimal.gte(player.value.gameProgress.pr2.amount, 4);
                    break;
                case 2:
                    shown = Decimal.gte(player.value.gameProgress.pr2.amount, 5);
                    autoUnlocked = (Decimal.gte(player.value.gameProgress.pr2.amount, 18) && hasGrowanMilestone(3)) || Decimal.gte(player.value.gameProgress.pr2.amount, 18);
                    break;
                case 3:
                    shown = Decimal.gt(player.value.gameProgress.kua.amount, 0);
                    autoUnlocked = (Decimal.gte(player.value.gameProgress.pr2.amount, 12) && hasGrowanMilestone(3)) || Decimal.gte(player.value.gameProgress.pr2.amount, 12);
                    break;
                case 4:
                    shown = Decimal.gte(player.value.gameProgress.kua.kshards, 0.01);
                    autoUnlocked = (Decimal.gte(player.value.gameProgress.pr2.amount, 14) && hasGrowanMilestone(3)) || Decimal.gte(player.value.gameProgress.pr2.amount, 14);
                    break;
                case 5:
                    shown = Decimal.gte(player.value.gameProgress.kua.kpower, 1);
                    autoUnlocked = (Decimal.gte(player.value.gameProgress.pr2.amount, 18) && hasGrowanMilestone(3)) || Decimal.gte(player.value.gameProgress.pr2.amount, 18);
                    break;
                case 6:
                    shown = getKuaUpgrade('s', 15);
                    autoUnlocked = (Decimal.gte(player.value.gameProgress.pr2.amount, 100) && hasGrowanMilestone(3)) || Decimal.gte(player.value.gameProgress.pr2.amount, 100);
                    break;
                case 7:
                    shown = getKuaUpgrade('s', 16);
                    autoUnlocked = (Decimal.gte(player.value.gameProgress.pr2.amount, 125) && hasGrowanMilestone(3)) || Decimal.gte(player.value.gameProgress.pr2.amount, 125);
                    break;
                case 8:
                    shown = getKuaUpgrade('s', 17);
                    autoUnlocked = (Decimal.gte(player.value.gameProgress.pr2.amount, 150) && hasGrowanMilestone(3)) || Decimal.gte(player.value.gameProgress.pr2.amount, 150);
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
            //         tmp.value.main.upgrades[upgID].calcEB = MAIN_UPG_DATA[upgID].effect(Decimal.add(player.value.gameProgress.upgrades[upgID].bought, 1)).div(MAIN_UPG_DATA[upgID].effect());
            //         break;
            //     case 2:
            //     case 5:
            //         tmp.value.main.upgrades[upgID].calcEB = MAIN_UPG_DATA[upgID].effect(Decimal.add(player.value.gameProgress.upgrades[upgID].bought, 1)).sub(MAIN_UPG_DATA[upgID].effect());
            //         break;
            //     default:
            //         throw new Error(`${upgID} is not a valid index for main upgrade`);
            // }

            switch (upgID) {
                case 0:
                case 3:
                    display = `Increase point gain by ${format(MAIN_UPG_DATA[upgID].effectBase.value, 3)}×`;
                    totalDisp = `Total: ${format(MAIN_UPG_DATA[upgID].effect(), 2)}× to point gain`;
                    break;
                case 1:
                case 4:
                    display = `Decreases Upgrade 1's cost by /${format(MAIN_UPG_DATA[upgID].effectBase.value, 3)}`;
                    totalDisp = `Total: /${format(MAIN_UPG_DATA[upgID].effect(), 2)} to Upgrade 1's cost`;
                    break;
                case 2:
                case 5:
                    display = `Increases Upgrade 1's base by +${format(MAIN_UPG_DATA[upgID].effectBase.value, 3)}`;
                    totalDisp = `Total: +${format(MAIN_UPG_DATA[upgID].effect(), 3)} to Upgrade 1's base`;
                    break;
                case 6:
                    display = `Raise Upgrade 1's effect by ^${format(MAIN_UPG_DATA[upgID].effectBase.value, 3)}`;
                    totalDisp = `Total: ^${format(MAIN_UPG_DATA[upgID].effect(), 3)} to Upgrade 1's effect`;
                    break;
                case 7:
                    display = `Raise Upgrade 1's cost by ^${format(MAIN_UPG_DATA[upgID].effectBase.value, 3)}`;
                    totalDisp = `Total: ^${format(MAIN_UPG_DATA[upgID].effect(), 3)} to Upgrade 1's cost`;
                    break;
                case 8:
                    display = `Multiply Upgrade 1's base by ×${format(MAIN_UPG_DATA[upgID].effectBase.value, 3)}`;
                    totalDisp = `Total: ×${format(MAIN_UPG_DATA[upgID].effect(), 3)} to Upgrade 1's base`;
                    break;
                default:
                    throw new Error(`${upgID} is not a valid index for main upgrade`);
            }
            tmp.value.main.upgrades[upgID].display = display;
            tmp.value.main.upgrades[upgID].totalDisp = totalDisp;

            // this is only used for Col Challenge 'Dimension Crawler!'
            tmp.value.main.upgrades[upgID].multiplier = D(1);
            // if (inChallenge('dc') || Decimal.gte(timesCompleted("dc"), 10)) {
            //     i = inChallenge('dc')
            //         ? COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[0]
            //         : getColChalRewEffects("dc")[3];
            //     tmp.value.main.upgrades[upgID].multiplier = tmp.value.main.upgrades[upgID].multiplier.mul(i.pow(MAIN_UPG_DATA[upgID].effective()));

            //     if (inChallenge('dc')) {
            //         tmp.value.main.upgrades[upgID].multiplier = tmp.value.main.upgrades[upgID].multiplier.pow(COL_CHALLENGES.dc.type3ChalCond!(challengeDepth('dc'))[2]);
            //     }

            //     if (upgID > 0) {
            //         player.value.gameProgress.upgrades[upgID - 1].accumulated = Decimal.add(player.value.gameProgress.upgrades[upgID - 1].accumulated, MAIN_UPG_DATA[upgID].effective().add(player.value.gameProgress.upgrades[upgID].accumulated).add(player.value.gameProgress.upgrades[upgID].bought).mul(tmp.value.main.upgrades[upgID].multiplier).mul(delta))
            //     }

            //     tmp.value.main.upgrades[upgID].dc11FreeLvs = !player.value.gameProgress.inChallenge.dc.overall && Decimal.gte(timesCompleted("dc"), 11)
            //         ? Decimal.max(player.value.gameProgress.upgrades[upgID].accumulated, 0).add(1).log2().add(1).pow(0.8).sub(1).div(0.8).add(1).ln().div(getColChalRewEffects("dc")[4]).add(1).pow(getColChalRewEffects("dc")[4]).sub(1)
            //         : D(0)
            // }

            if (player.value.gameProgress.upgrades[upgID].auto) {
                player.value.gameProgress.upgrades[upgID].bought = Decimal.max(player.value.gameProgress.upgrades[upgID].bought, MAIN_UPG_DATA[upgID].target(player.value.gameProgress.points).add(1).floor());
            }

            player.value.gameProgress.upgrades[upgID].boughtInKua = Decimal.max(player.value.gameProgress.upgrades[upgID].boughtInKua, player.value.gameProgress.upgrades[upgID].bought);

            tmp.value.main.upgrades[upgID].canBuy = Decimal.gte(player.value.gameProgress.points, MAIN_UPG_DATA[upgID].cost(player.value.gameProgress.upgrades[upgID].bought));
            player.value.gameProgress.upgrades[upgID].best = Decimal.max(player.value.gameProgress.upgrades[upgID].best, player.value.gameProgress.upgrades[upgID].bought);
            break;
        case 0: // prai
            tmp.value.main.prai.effActive = true;

            player.value.gameProgress.prai.timeInPRai = Decimal.add(player.value.gameProgress.prai.timeInPRai, delta);

            resetFactor([2, 2]);
            tmp.value.main.prai.req = D(1e6);
            tmp.value.main.prai.gainExp = D(1 / 3);
            pushFactor([2, 2], LABELS.def, `${format(tmp.value.main.prai.gainExp, 3)}`, `^${format(tmp.value.main.prai.gainExp, 3)}`)

            if (player.value.gameProgress.layer4.gro.upgrades.idle.includes(0)) {
                tmp.value.main.prai.gainExp = tmp.value.main.prai.gainExp.add(GROWAN_UPGS.idle[0].eff!.value)
                pushFactor([2, 2], LABELS.giu1, `×${format(GROWAN_UPGS.idle[0].eff!.value, 3)}`, `^${format(tmp.value.main.prai.gainExp, 3)}`, "col");
            }

            if (ifAchievement(1, 8)) {
                tmp.value.main.prai.gainExp = tmp.value.main.prai.gainExp.mul(1.005);
                pushFactor([2, 2], LABELS.ach1_8, `×${format(1.005, 3)}`, `^${format(tmp.value.main.prai.gainExp, 3)}`, "ach")
            }

            if (Decimal.gte(player.value.gameProgress.pr2.amount, 1) && Decimal.gte(player.value.gameProgress.totalPointsInPrai, tmp.value.main.prai.req)) {
                let eff, txt;
                i = D(1);
                resetFactor([2, 0]);

                for (let j = 0; j < PRAI_GAIN_CALC.length; j++) {
                    PRAI_GAIN_CALC[j].active = PRAI_GAIN_CALC[j].baseActive.value;

                    txt = '';
                    if (PRAI_GAIN_CALC[j].active) {
                        eff = PRAI_GAIN_CALC[j].effect.value;

                        if (PRAI_GAIN_CALC[j].type === 'mult') {
                            i = i.mul(eff);
                            txt = `×${format(eff, 2)}`;
                        }
                        if (PRAI_GAIN_CALC[j].type === 'pow') {
                            i = i.pow(eff);
                            txt = `^${format(eff, 3)}`;
                        }

                        Decimal.max(player.value.gameProgress.totalPointsInPrai, 0).div(tmp.value.main.prai.req).ln().div(tmp.value.main.prai.gainExp).add(1).pow(tmp.value.main.prai.gainExp);
                        if (PRAI_GAIN_CALC[j].name.value === 'Base') {
                            txt = `(${format(1)}+ln(${format(player.value.gameProgress.totalPointsInPrai)}/${format(tmp.value.main.prai.req)})/${format(tmp.value.main.prai.gainExp, 3)})^${format(tmp.value.main.prai.gainExp)}`;
                        }
                        pushFactor([2, 0], PRAI_GAIN_CALC[j].name.value, txt, `${format(i, 1)}`, PRAI_GAIN_CALC[j].color);
                    }
                }

                const data = {
                    oldGain: i,
                    oldPRai: D(0),
                    newPRai: D(0),
                };
                data.oldPRai = Decimal.max(player.value.gameProgress.prai.amount, 10);

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
                if (Decimal.gt(player.value.gameProgress.kua.kshards, 0)) {
                    i = i.div(tmp.value.kua.effects.kshardPassive);
                }
                if (Decimal.gte(player.value.gameProgress.oneUpgrades[3], 1)) {
                    i = i.div(MAIN_ONE_UPGS[3].effect.value);
                }
                if (player.value.gameProgress.unlocks.pr2) {
                    i = i.div(tmp.value.main.pr2.effActive ? tmp.value.main.pr2.effect : 1);
                }
                i = i.log10().root(0.9).pow10().sub(1).div(tmp.value.main.prai.gainExp).add(1).root(tmp.value.main.prai.gainExp).mul(tmp.value.main.prai.req);
                tmp.value.main.prai.next = i.sub(player.value.gameProgress.totalPointsInPrai);
            } else {
                tmp.value.main.prai.pending = Decimal.max(player.value.gameProgress.totalPointsInPrai, 1e6).div(1e6).log(1e2).add(1).min(10).floor(); // hidden thing, usually 1 but when ppl decide to go further, they should get rewarded somehow
                tmp.value.main.prai.next = tmp.value.main.prai.req.sub(player.value.gameProgress.totalPointsInPrai).div(tmp.value.main.pps);

                for (let j = 0; j < PRAI_GAIN_CALC.length; j++) {
                    setFactor(j, [2, 0], '', '', '', false);
                }
            }

            if (player.value.gameProgress.prai.auto) { 
                generate = tmp.value.main.prai.pending.mul(delta).mul(0.0001);
                if (player.value.gameProgress.kua.upgrades[2] >= 1) {
                    generate = generate.mul(100);
                }
                if (player.value.gameProgress.layer4.gro.upgrades.idle.includes(0)) {
                    generate = generate.mul(10);
                }
                player.value.gameProgress.prai.amount = Decimal.add(player.value.gameProgress.prai.amount, generate);
            }

            NaNCheck(player.value.gameProgress.prai.amount, 'PRai amount is NaN!');

            j = D(4);
            if (ifAchievement(0, 5)) {
                j = j.mul(1.25);
            }

            i = D(player.value.gameProgress.prai.amount);
            setFactor(0, [2, 1], "Base", `${format(player.value.gameProgress.prai.amount)}`, `×${format(i, 2)}`, true);

            i = i.mul(j).add(1);
            setFactor(1, [2, 1], "Base Mult", `(${format(player.value.gameProgress.prai.amount)} × ${format(j)}) dilate ${format(0.975, 3)}`, `×${format(i, 2)}`, true);

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

            if (Decimal.gt(player.value.gameProgress.layer4.gro.totalAmt, 0)) {
                i = i.pow(tmp.value.layer4.growan.solEff.prai);
            }
            setFactor(7, [2, 1], "Grōwan Solution Effect", `^${format(tmp.value.layer4.growan.solEff.prai, 3)}`, `×${format(i, 2)}`, Decimal.gt(player.value.gameProgress.layer4.gro.totalAmt, 0), "growan");

            tmp.value.main.prai.effect = i;

            i = Decimal.add(player.value.gameProgress.prai.amount, tmp.value.main.prai.pending);
            i = i.mul(j).add(1);
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
            if (Decimal.gt(player.value.gameProgress.layer4.gro.totalAmt, 0)) {
                i = i.pow(tmp.value.layer4.growan.solEff.prai);
            }
            tmp.value.main.prai.nextEffect = i;

            tmp.value.main.prai.canDo = Decimal.gte(player.value.gameProgress.totalPointsInPrai, tmp.value.main.prai.req);
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

            tmp.value.main.pr2.cost = getPR2Cost(player.value.gameProgress.pr2.amount, false, true);

            tmp.value.main.pr2.target = getPR2Cost(player.value.gameProgress.prai.amount, true, false);

            if (player.value.gameProgress.pr2.auto) {
                player.value.gameProgress.pr2.amount = Decimal.max(player.value.gameProgress.pr2.amount, tmp.value.main.pr2.target.add(1).floor());
            }

            j = D(0.05);
            setFactor(0, [3, 3], "Base", `${format(0.05, 2)}`, `${format(j.add(1), 2)}^`, true);
            if (getKuaUpgrade("s", 5)) {
                j = j.mul(2);
            }
            setFactor(1, [3, 3], "KShard Upgrade 5", `×${format(2, 2)}`, `${format(j.add(1), 2)}^`, getKuaUpgrade("s", 5), "kua");

            i = D(player.value.gameProgress.pr2.amount);
            setFactor(0, [3, 2], "Base", `${format(player.value.gameProgress.pr2.amount)}`, `${format(i)} effective`, true);

            if (Decimal.gte(player.value.gameProgress.oneUpgrades[8], 1)) {
                i = i.add(MAIN_ONE_UPGS[8].effect.value);
            }
            setFactor(1, [3, 2], "One Upgrade #9", `+${format(MAIN_ONE_UPGS[8].effect.value, 2)}`, `${format(i)} effective`, Decimal.gte(player.value.gameProgress.oneUpgrades[8], 1));
            tmp.value.main.pr2.effective = i;

            i = tmp.value.main.pr2.effective.max(0).add(1).pow(tmp.value.main.pr2.effective.mul(j).add(1).ln().add(1));
            setFactor(2, [3, 2], "Resulting Effect", `(${format(tmp.value.main.pr2.effective)} + 1) ^ (1 + ln(1 + (${format(j, 2)})(${format(tmp.value.main.pr2.effective)})))`, `×${format(i)}`, true);

            if (getKuaUpgrade("p", 8)) {
                i = Decimal.pow(j.add(1), tmp.value.main.pr2.effective).mul(i);
            }
            setFactor(3, [3, 2], "KPower Upgrade 8", `×(1 + ${format(j, 2)}) ^ (${format(tmp.value.main.pr2.effective)})`, `×${format(i)}`, getKuaUpgrade("p", 8), "kua");

            tmp.value.main.pr2.effect = i;

            tmp.value.main.pr2.canDo = Decimal.gte(player.value.gameProgress.prai.amount, Decimal.sub(tmp.value.main.pr2.cost, 0.5));

            tmp.value.main.pr2.textEffect = {when: D(0), txt: ''};
            if (Decimal.lte(player.value.gameProgress.pr2.amount, PR2_EFF[PR2_EFF.length - 1].when)) {
                // this feels cursed not putting a "let i"
                for (i = 0; i < PR2_EFF.length; i++) {
                    // console.log(`${format(player.value.gameProgress.pr2.amount)} < ${PR2_EFF[i].when} & ${PR2_EFF[i].show}`)
                    if (Decimal.lt(player.value.gameProgress.pr2.amount, PR2_EFF[i].when) && PR2_EFF[i].show.value) {
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
    } else {
        if (updateFact) {
            setFactor(0, [3, 0], "Base", `${format(cost)}`, `${format(cost)} effective`, true);
        }

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