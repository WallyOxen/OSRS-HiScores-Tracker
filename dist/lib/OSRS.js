var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fetch from "node-fetch";
const url = "https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws?player=";
const skills = [
    "OVERALL",
    "ATTACK",
    "DEFENCE",
    "STRENGTH",
    "CONSTITUTION",
    "RANGED",
    "PRAYER",
    "MAGIC",
    "COOKING",
    "WOODCUTTING",
    "FLETCHING",
    "FISHING",
    "FIREMAKING",
    "CRAFTING",
    "SMITHING",
    "MINING",
    "HERBLORE",
    "AGILITY",
    "THIEVING",
    "SLAYER",
    "FARMING",
    "RUNECRAFTING",
    "HUNTER",
    "CONSTRUCTION",
];
const activities = [
    "LEAGUE POINTS",
    "BOUNTY HUNTER HUNTER",
    "BOUNTY HUNTER ROGUE",
    "CLUE SCROLLS ALL",
    "CLUE SCROLLS BEGINNER",
    "CLUE SCROLLS EASY",
    "CLUE SCROLLS MEDIUM",
    "CLUE SCROLLS HARD",
    "CLUE SCROLLS ELITE",
    "CLUE SCROLLS MASTER",
    "LAST MAN STANDING",
    "SOUL WARS ZEAL",
];
const bosses = [
    "ABYSSAL SIRE",
    "ALCHEMICAL HYDRA",
    "BARROWS CHESTS",
    "BRYOPHYTA",
    "CALLISTO",
    "CERBERUS",
    "CHAMBERS OF XERIC",
    "CHAMBERS OF XERIC CHALLENGE MODE",
    "CHAOS ELEMENTAL",
    "CHAOS FANATIC",
    "COMMANDER ZILYANA",
    "CORPOREAL BEAST",
    "CRAZY ARCHAEOLOGIST",
    "DAGANNOTH PRIME",
    "DAGANNOTH REX",
    "DAGANNOTH SUPREME",
    "DERANGED ARCHAEOLOGIST",
    "GENERAL GRAARDOR",
    "GIANT MOLE",
    "GROTESQUE GUARDIANS",
    "HESPORI",
    "KALPHITE QUEEN",
    "KING BLACK DRAGON",
    "KRAKEN",
    "KREEARRA",
    "KRIL TSUTSAROTH",
    "MIMIC",
    "NIGHTMARE",
    "OBOR",
    "SARACHNIS",
    "SCORPIA",
    "SKOTIZO",
    "THE GAUNTLET",
    "THE CORRUPTED GAUNTLET",
    "THEATRE OF BLOOD",
    "THERMONUCLEAR SMOKE DEVIL",
    "TZKAL ZUK",
    "TZTOK JAD",
    "VENENATIS",
    "VETION",
    "VORKATH",
    "WINTERTODT",
    "ZALCANO",
    "ZULRAH",
];
export class Skill {
    constructor(player, rank, level, xp, xpBehind) {
        this.player = player;
        this.rank = rank;
        this.level = level;
        this.xp = xp;
        this.xpBehind = xpBehind;
    }
}
export class Activity {
    constructor(player, rank, count) {
        this.player = player;
        this.rank = rank;
        this.count = count;
    }
}
export class Boss {
    constructor(player, rank, count) {
        this.player = player;
        this.rank = rank;
        this.count = count;
    }
}
function addPlayerData(data, player) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = yield fetch(url + player);
        const response = yield query.text();
        const info = yield response.split("\n");
        skills.forEach((skill, index) => {
            const [rank, level, xp] = info[index].split(",");
            if (!data[skill])
                data[skill] = [];
            const newSkill = new Skill(player, rank, level, xp);
            data[skill].push(newSkill);
        });
        activities.forEach((activity, index) => {
            const [rank, count] = info[skills.length + index].split(",");
            if (Number(count) > 0) {
                if (!data[activity])
                    data[activity] = [];
                const newActivity = new Activity(player, rank, count);
                data[activity].push(newActivity);
            }
        });
        bosses.forEach((boss, index) => {
            const [rank, count] = info[skills.length + activities.length + index].split(",");
            if (Number(count) > 0) {
                if (!data[boss])
                    data[boss] = [];
                const newBoss = new Boss(player, rank, count);
                data[boss].push(newBoss);
            }
        });
    });
}
export function updatePlayerData(playerNames) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = {};
        for (let i = 0; i < playerNames.length; i++) {
            yield addPlayerData(data, playerNames[i]);
        }
        Object.keys(data).forEach((stat) => {
            data[stat] = data[stat].sort((a, b) => {
                if (a instanceof Skill && b instanceof Skill) {
                    return Number(b.xp) - Number(a.xp);
                }
                else if (!(a instanceof Skill) && !(b instanceof Skill)) {
                    return Number(b.count) - Number(a.count);
                }
                return 0;
            });
            let highestXp = 0;
            data[stat].forEach((player, index) => {
                if (player instanceof Skill) {
                    if (index === 0)
                        highestXp = Number(player.xp);
                    player.xpBehind = highestXp - Number(player.xp);
                }
            });
        });
        return data;
    });
}
