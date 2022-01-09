interface ViewerOptions {
  page: number;
  selected: string;
  playerNames: string[];
  data: PlayerData;
  lastUpdated: number;
  pageTimer: number;
}

interface PlayerData {
  [key: string]: (Skill | Activity | Boss)[];
}
