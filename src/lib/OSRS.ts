import fetch from "node-fetch";

const url =
  "https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws?player=";

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
  public constructor(
    public player: string,
    public rank: string,
    public level: string,
    public xp: string,
    public xpBehind?: number
  ) {}
}

export class Activity {
  public constructor(
    public player: string,
    public rank: string,
    public count: string
  ) {}
}

export class Boss {
  public constructor(
    public player: string,
    public rank: string,
    public count: string
  ) {}
}

async function addPlayerData(data: PlayerData, player: string) {
  const query = await fetch(url + player);
  const response = await query.text();
  const info = await response.split("\n");

  skills.forEach((skill, index) => {
    const [rank, level, xp] = info[index].split(",");
    if (!data[skill]) data[skill] = [];
    const newSkill = new Skill(player, rank, level, xp);
    data[skill].push(newSkill);
  });

  activities.forEach((activity, index) => {
    const [rank, count] = info[skills.length + index].split(",");
    if (Number(count) > 0) {
      if (!data[activity]) data[activity] = [];
      const newActivity = new Activity(player, rank, count);
      data[activity].push(newActivity);
    }
  });

  bosses.forEach((boss, index) => {
    const [rank, count] =
      info[skills.length + activities.length + index].split(",");
    if (Number(count) > 0) {
      if (!data[boss]) data[boss] = [];
      const newBoss = new Boss(player, rank, count);
      data[boss].push(newBoss);
    }
  });
}

export async function updatePlayerData(playerNames: string[]) {
  const data: PlayerData = {};
  for (let i = 0; i < playerNames.length; i++) {
    await addPlayerData(data, playerNames[i]);
  }
  Object.keys(data).forEach((stat) => {
    data[stat] = data[stat].sort((a, b) => {
      if (a instanceof Skill && b instanceof Skill) {
        return Number(b.xp) - Number(a.xp);
      } else if (!(a instanceof Skill) && !(b instanceof Skill)) {
        return Number(b.count) - Number(a.count);
      }
      return 0;
    });
    let highestXp = 0;
    data[stat].forEach((player, index) => {
      if (player instanceof Skill) {
        if (index === 0) highestXp = Number(player.xp);
        player.xpBehind = highestXp - Number(player.xp);
      }
    });
  });
  return data;
}
