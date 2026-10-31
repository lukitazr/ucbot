import { SlashCommand } from '../types';

import ping from './Info/ping';
import help from './Info/help';

import ban from './Moderacion/ban';
import kick from './Moderacion/kick';
import mute from './Moderacion/mute';
import unmute from './Moderacion/unmute';
import warn from './Moderacion/warn';
import unwarn from './Moderacion/unwarn';
import warnings from './Moderacion/warnings';
import leaderboardWarns from './Moderacion/leaderboard-warns';
import leaderboardWarners from './Moderacion/leaderboard-warners';

export const commandsList: SlashCommand[] = [
  ping,
  help,
  ban,
  kick,
  mute,
  unmute,
  warn,
  unwarn,
  warnings,
  leaderboardWarns,
  leaderboardWarners,
];

export const commandsMap = new Map<string, SlashCommand>();
for (const cmd of commandsList) {
  commandsMap.set(cmd.data.name.toLowerCase(), cmd);
}

export default commandsList;
