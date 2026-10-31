import { Client, Collection, Message, ChatInputCommandInteraction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import { GiveawaysManager } from 'discord-giveaways';

export interface ExtendedClient extends Client {
  commands: Collection<string, Command>;
  aliases: Collection<string, string>;
  manager?: any;
  giveawaysManager: GiveawaysManager;
  color: string;
}

export interface Command {
  name: string;
  aliases?: string[];
  desc?: string;
  permisos?: string[];
  permisos_bot?: string[];
  slashBuilder?: SlashCommandBuilder | SlashCommandOptionsOnlyBuilder | SlashCommandSubcommandsOnlyBuilder;
  run: (
    client: ExtendedClient,
    message: Message | null,
    args: string[],
    prefix: string,
    interaction: ChatInputCommandInteraction | null
  ) => Promise<void> | void;
}

export interface LavalinkConfig {
  active: boolean;
  host: string;
  port: number;
  password: string;
  secure: boolean;
}

export interface BotConfig {
  token: string;
  lavalink?: LavalinkConfig;
  color?: string;
  mongodb?: string;
}

export interface EmbedConfig {
  author?: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  color?: string;
}
