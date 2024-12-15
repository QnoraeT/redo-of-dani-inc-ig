import { makeChallengeInfo, type Player } from "./main";
import { D } from "./calc";
import Decimal from "break_eternity.js";

export const updatePlayerData = (player: Player): Player => {
    player.version = player.version || -1;
    if (player.version < 0) {
        player.version = 0;
    }
    if (player.version === 0) {
        for (let i = 0; i < 9; i++) {
            if (player.gameProgress.main.upgrades[i] === undefined) {
                player.gameProgress.main.upgrades[i] = {
                    bought: D(0),
                    best: D(0),
                    auto: false,
                    boughtInReset: [D(0), D(0), D(0), D(0), D(0)],
                    accumulated: D(0)
                };
            }
        }
        player.displayVersion = 'v1.0.1';
        player.version = 1;
    }
    if (player.version === 1) {
        player.displayVersion = 'v1.0.2'; // tbh not much other than a late commit
        player.version = 2;
    }
    if (player.version === 2) {
        player.displayVersion = 'v1.0.0'; // game isn't even released lmao
        player.version = 3;
    }
    if (player.version === 3) {
        player.gameProgress.dilatedTime = {
            normalized: false,
            normalizeTime: 0.05,
            paused: false,
            speed: 1,
            speedEnabled: false
        }
        player.version = 4;
    }
    if (player.version === 4) {
        player.gameProgress.dilatedTime.speedEnabled = false;
        
        player.version = 5;
    }
    if (player.version === 5) {
        player.displayVersion = 'v1.0.0 - Nov-02-2024';
        player.version = 6;
    }
    if (player.version === 6) {
        player.gameProgress.kua.blessings = {
            amount: D(0),
            clickCooldown: D(0),
            totals: [null, null, null, D(0), D(0)],
            best: [null, null, null, D(0), D(0)],
            upgrades: [D(0), D(0), D(0), D(0)],
            totalEver: D(0),
            bestEver: D(0),
        }
        player.version = 7;
    }
    if (player.version === 7) {
        player.version = 8;
    }
    if (player.version === 8) {
        player.displayVersion = 'The Sentreon Update - Nov-05-2024';
        player.version = 9;
    }
    if (player.version === 9) {
        player.displayVersion = 'v1.0.0.1 - Nov-05-2024';
        player.version = 10;
    }
    if (player.version === 10) {
        player.gameProgress.kua.blessings.totalEver = D(0)
        player.gameProgress.kua.blessings.bestEver = D(0)
        player.displayVersion = 'v1.0.0.2 - Nov-06-2024';
        player.version = 11;
    }
    if (player.version === 11) {
        player.gameProgress.kua.upgrades = 0

        player.displayVersion = 'v1.0.0.3 - Nov-09-2024';
        player.version = 12;
    }
    if (player.version === 12) {
        player.gameProgress.unlocks = {
            pr2: false,
            kua: false,
            kenhancers: false,
            kblessings: false,
            kproofs: {
                main: false,
                strange: false,
                finicky: false
            },
            col: false,
            tax: false
        },
        player.gameProgress.kua.proofs = {
            amount: D(0),
            totals: [null, null, null, D(0), D(0)],
            best: [null, null, null, D(0), D(0)],
            totalEver: D(0),
            bestEver: D(0),
            automationBought: {
                other: [false, false, false],
                effect: [false, false, false, false, false, false, false, false, false],
                kp: [false, false, false, false, false, false, false, false, false],
                skp: [false, false, false, false, false, false, false, false, false],
                fkp: [false, false, false, false, false, false, false, false, false]
            },
            automationEnabled: {
                other: [false, false, false],
                effect: [false, false, false, false, false, false, false, false, false],
                kp: [false, false, false, false, false, false, false, false, false],
                skp: [false, false, false, false, false, false, false, false, false],
                fkp: [false, false, false, false, false, false, false, false, false]
            },
            upgrades: {
                effect: [D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0)],
                kp: [D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0)],
                skp: [D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0)],
                fkp: [D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0)]
            },
            strange: {
                cooldown: D(0),
                amount: D(0),
                hiddenExp: D(0),
                times: D(0),
                totals: [null, null, null, D(0), D(0)],
                best: [null, null, null, D(0), D(0)],
                totalEver: D(0),
                bestEver: D(0)
            },
            finicky: {
                cooldown: D(0),
                amount: D(0),
                hiddenExp: D(0),
                times: D(0),
                totals: [null, null, null, D(0), D(0)],
                best: [null, null, null, D(0), D(0)],
                totalEver: D(0),
                bestEver: D(0),
                powers: {
                    white: {
                        alloc: D(0),
                        amount: D(0),
                        upgrades: D(0)
                    },
                    cyan: {
                        alloc: D(0),
                        amount: D(0),
                        upgrades: D(0)
                    },
                    yellow: {
                        alloc: D(0),
                        amount: D(0),
                        upgrades: D(0)
                    }
                }
            }
        }
        player.displayVersion = 'v1.0.0.4 - Nov-14-2024';
        player.version = 13;
    }
    if (player.version === 13) {
        player.gameProgress.kua.proofs = {
            amount: D(0),
            totals: [null, null, null, D(0), D(0)],
            best: [null, null, null, D(0), D(0)],
            totalEver: D(0),
            bestEver: D(0),
            automationBought: {
                other: [false, false, false],
                effect: [false, false, false, false, false, false, false, false, false],
                kp: [false, false, false, false, false, false, false, false, false],
                skp: [false, false, false, false, false, false, false, false, false],
                fkp: [false, false, false, false, false, false, false, false, false]
            },
            automationEnabled: {
                other: [false, false, false],
                effect: [false, false, false, false, false, false, false, false, false],
                kp: [false, false, false, false, false, false, false, false, false],
                skp: [false, false, false, false, false, false, false, false, false],
                fkp: [false, false, false, false, false, false, false, false, false]
            },
            upgrades: {
                effect: [D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0)],
                kp: [D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0)],
                skp: [D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0)],
                fkp: [D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0)]
            },
            strange: {
                cooldown: D(0),
                amount: D(0),
                hiddenExp: D(0),
                times: D(0),
                totals: [null, null, null, D(0), D(0)],
                best: [null, null, null, D(0), D(0)],
                totalEver: D(0),
                bestEver: D(0)
            },
            finicky: {
                cooldown: D(0),
                amount: D(0),
                hiddenExp: D(0),
                times: D(0),
                totals: [null, null, null, D(0), D(0)],
                best: [null, null, null, D(0), D(0)],
                totalEver: D(0),
                bestEver: D(0),
                powers: {
                    white: {
                        alloc: D(0),
                        amount: D(0),
                        upgrades: D(0)
                    },
                    cyan: {
                        alloc: D(0),
                        amount: D(0),
                        upgrades: D(0)
                    },
                    yellow: {
                        alloc: D(0),
                        amount: D(0),
                        upgrades: D(0)
                    }
                }
            }
        }
        player.displayVersion = 'v1.0.0.5 - Nov-15-2024';
        player.version = 14;
    }
    if (player.version === 14) {
        player.gameProgress.kua.proofs = {
            amount: D(0),
            totals: [null, null, null, D(0), D(0)],
            best: [null, null, null, D(0), D(0)],
            totalEver: D(0),
            bestEver: D(0),
            automationBought: {
                other: [false, false, false],
                effect: [false, false, false, false, false, false, false, false, false],
                kp: [false, false, false, false, false, false, false, false, false],
                skp: [false, false, false, false, false, false, false, false, false],
                fkp: [false, false, false, false, false, false, false, false, false]
            },
            automationEnabled: {
                other: [false, false, false],
                effect: [false, false, false, false, false, false, false, false, false],
                kp: [false, false, false, false, false, false, false, false, false],
                skp: [false, false, false, false, false, false, false, false, false],
                fkp: [false, false, false, false, false, false, false, false, false]
            },
            upgrades: {
                effect: [D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0)],
                kp: [D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0)],
                skp: [D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0)],
                fkp: [D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0)]
            },
            strange: {
                cooldown: D(0),
                amount: D(0),
                hiddenExp: D(0),
                times: D(0),
                totals: [null, null, null, D(0), D(0)],
                best: [null, null, null, D(0), D(0)],
                totalEver: D(0),
                bestEver: D(0)
            },
            finicky: {
                cooldown: D(0),
                amount: D(0),
                hiddenExp: D(0),
                times: D(0),
                totals: [null, null, null, D(0), D(0)],
                best: [null, null, null, D(0), D(0)],
                totalEver: D(0),
                bestEver: D(0),
                powers: {
                    white: {
                        alloc: D(0),
                        amount: D(0),
                        upgrades: D(0)
                    },
                    cyan: {
                        alloc: D(0),
                        amount: D(0),
                        upgrades: D(0)
                    },
                    yellow: {
                        alloc: D(0),
                        amount: D(0),
                        upgrades: D(0)
                    }
                }
            }
        }
        player.displayVersion = 'v1.0.0.6 - Nov-06-2024';
        player.version = 15;
    }
    if (player.version === 15) {
        player.gameProgress.unlocks = {
            pr2: false,
            kua: false,
            kenhancers: false,
            kblessings: false,
            kproofs: {
                main: false,
                strange: false,
                finicky: false
            },
            col: false,
            tax: false
        },
        player.displayVersion = 'v1.0.0.7 - Nov-17-2024';
        player.version = 16;
    }
    if (player.version === 16) {
        player.gameProgress.kua.proofs = {
            amount: D(0),
            totals: [null, null, null, D(0), D(0)],
            best: [null, null, null, D(0), D(0)],
            totalEver: D(0),
            bestEver: D(0),
            automationBought: {
                other: [false, false, false],
                effect: [false, false, false, false, false, false, false, false, false],
                kp: [false, false, false, false, false, false, false, false, false],
                skp: [false, false, false, false, false, false, false, false, false],
                fkp: [false, false, false, false, false, false, false, false, false]
            },
            automationEnabled: {
                other: [false, false, false],
                effect: [false, false, false, false, false, false, false, false, false],
                kp: [false, false, false, false, false, false, false, false, false],
                skp: [false, false, false, false, false, false, false, false, false],
                fkp: [false, false, false, false, false, false, false, false, false]
            },
            upgrades: {
                effect: [D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0)],
                kp: [D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0)],
                skp: [D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0)],
                fkp: [D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0), D(0)]
            },
            strange: {
                cooldown: D(0),
                amount: D(0),
                hiddenExp: D(0),
                times: D(0),
                totals: [null, null, null, D(0), D(0)],
                best: [null, null, null, D(0), D(0)],
                totalEver: D(0),
                bestEver: D(0)
            },
            finicky: {
                cooldown: D(0),
                amount: D(0),
                hiddenExp: D(0),
                times: D(0),
                totals: [null, null, null, D(0), D(0)],
                best: [null, null, null, D(0), D(0)],
                totalEver: D(0),
                bestEver: D(0),
                powers: {
                    white: {
                        alloc: D(0),
                        amount: D(0),
                        upgrades: D(0)
                    },
                    cyan: {
                        alloc: D(0),
                        amount: D(0),
                        upgrades: D(0)
                    },
                    yellow: {
                        alloc: D(0),
                        amount: D(0),
                        upgrades: D(0)
                    }
                }
            }
        }
        player.displayVersion = 'v1.0.0.8 - Nov-17-2024';
        player.version = 17;
    }
    if (player.version === 17) {
        player.gameProgress.kua.proofs.automationBought = {
                other: [false, false, false],
                effect: [false, false, false, false, false, false, false, false, false],
                kp: [false, false, false, false, false, false, false, false, false],
                skp: [false, false, false, false, false, false, false, false, false],
                fkp: [false, false, false, false, false, false, false, false, false]
        }
        player.displayVersion = 'v1.0.0.9 - Nov-18-2024';
        player.version = 18;
    }
    if (player.version === 18) {
        player.gameProgress.kua.proofs.automationBought = {
            other: [false, false, false],
            effect: [false, false, false, false, false, false, false, false, false],
            kp: [false, false, false, false, false, false, false, false, false],
            skp: [false, false, false, false, false, false, false, false, false],
            fkp: [false, false, false, false, false, false, false, false, false]
        }
        player.gameProgress.kua.proofs.automationEnabled = {
            other: [false, false, false],
            effect: [false, false, false, false, false, false, false, false, false],
            kp: [false, false, false, false, false, false, false, false, false],
            skp: [false, false, false, false, false, false, false, false, false],
            fkp: [false, false, false, false, false, false, false, false, false]
        }
        player.displayVersion = 'v1.0.0.10 - Nov-18-2024';
        player.version = 19;
    }
    if (player.version === 19) {
        player.gameProgress.inChallenge.dc = makeChallengeInfo();
        player.gameProgress.col.completed.dc = D(0);
        player.gameProgress.col.saved.dc = null;
        player.displayVersion = 'v1.0.0.11 - Nov-23-2024';
        player.version = 20;
    }
    if (player.version === 20) {
        player.gameProgress.kua.proofs.finicky = {
            cooldown: D(0),
            amount: D(0),
            hiddenExp: D(0),
            times: D(0),
            totals: [null, null, null, D(0), D(0)],
            best: [null, null, null, D(0), D(0)],
            totalEver: D(0),
            bestEver: D(0),
            powers: {
                white: {
                    alloc: D(0),
                    amount: D(0),
                    upgrades: D(0)
                },
                cyan: {
                    alloc: D(0),
                    amount: D(0),
                    upgrades: D(0)
                },
                yellow: {
                    alloc: D(0),
                    amount: D(0),
                    upgrades: D(0)
                }   
            }
        }
        player.displayVersion = 'v1.0.0.12 - Nov-26-2024';
        player.version = 21;
    }
    if (player.version === 21) {
        player.gameProgress.kua.proofs.finicky.powers = {
                white: {
                    alloc: D(0),
                    amount: D(0),
                    upgrades: D(0)
                },
                cyan: {
                    alloc: D(0),
                    amount: D(0),
                    upgrades: D(0)
                },
                yellow: {
                    alloc: D(0),
                    amount: D(0),
                    upgrades: D(0)
                }
            }
        player.displayVersion = 'v1.0.0.13 - Nov-26-2024';
        player.version = 22;
    }
    if (player.version === 22) {
        player.gameProgress.inChallenge.dc = makeChallengeInfo();
        player.gameProgress.col.completed.dc = D(0);
        player.gameProgress.col.saved.dc = null;
        player.gameProgress.inChallenge.sn = makeChallengeInfo();
        player.gameProgress.col.completed.sn = D(0);
        player.gameProgress.col.saved.sn = null;
        player.displayVersion = 'v1.0.14 - Nov-27-2024';
        player.version = 23;
    }
    if (player.version === 23) {
        // delete player.gameProgress.inChallenge.ci;
        // delete player.gameProgress.col.completed.ci;
        // delete player.gameProgress.col.saved.ci;
        player.displayVersion = 'v1.0.15 - Nov-27-2024';
        player.version = 24;
    }
    if (player.version === 24) {
        for (let i = 0; i < 9; i++) {
            if (player.gameProgress.main.upgrades[i] === undefined) {
                player.gameProgress.main.upgrades[i] = {
                    bought: D(0),
                    best: D(0),
                    auto: false,
                    boughtInReset: [D(0), D(0), D(0), D(0), D(0)],
                    accumulated: D(0)
                };
            }
        };
        player.displayVersion = 'v1.0.16 - Nov-27-2024';
        player.version = 25;
    }
    if (player.version === 25) {
        player.gameProgress.kua.proofs.finicky.powers = {
            white: {
                alloc: D(0),
                amount: D(0),
                upgrades: D(0)
            },
            cyan: {
                alloc: D(0),
                amount: D(0),
                upgrades: D(0)
            },
            yellow: {
                alloc: D(0),
                amount: D(0),
                upgrades: D(0)
            }
        };
        // revert the thing, you aren't even publishing the thing why make it a 3rd important version?
        player.displayVersion = 'v1.0.0.17 - Nov-27-2024';
        player.version = 26;
    }
    if (player.version === 26) {
        player.settings.scaledUpgBase = true;
        player.displayVersion = 'v1.0.0.18 - Dec-03-2024';
        player.version = 27;
    }
    if (player.version === 27) {
        player.gameProgress.dilatedTime.normalizeTime = 0.05;
        player.displayVersion = 'v1.0.0.17 - Nov-27-2024';
        player.version = 28;
    }
    if (player.version === 28) {

        player.displayVersion = 'v1.1.0 - Dec-08-2024';
        player.version = 29;
    }
    if (player.version === 29) {
        if (Decimal.gt(player.gameProgress.col.power, 1)) {
            player.gameProgress.unlocks.col = true;
        }
        player.displayVersion = 'v1.1.0.1 - Dec-09-2024';
        player.version = 30;
    }
    if (player.version === 30) {

        player.displayVersion = 'v1.1.2 - Dec-09-2024';
        player.version = 31;
    }
    if (player.version === 31) {
        player.gameProgress.kua.blessings.clickCooldown = D(0);
        player.displayVersion = 'v1.1.2.1 - Dec-12-2024';
        player.version = 32;
    }
    if (player.version === 32) {
        player.settings.notationLimit = 1e6;
        player.displayVersion = 'v1.1.2.2 - Dec-13-2024';
        player.version = 33;
    }
    if (player.version === 33) {
        player.settings.notationLimit = 6;
        player.displayVersion = 'v1.1.3 - Dec-15-2024';
        player.version = 34;
    }
    if (player.version === 34) {

        // player.displayVersion = 'v1.1.3.1 - Dec-15-2024';
        // player.version = 35;
    }
    if (player.version === 35) {

        // player.displayVersion = 'v1.1.3.2 - Dec-15-2024';
        // player.version = 36;
    }
    if (player.version === 36) {

        // player.displayVersion = 'v1.1.3.3 - Dec-15-2024';
        // player.version = 37;
    }
    return player;
};