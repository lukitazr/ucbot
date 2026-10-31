import {
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
  REST,
  APIApplicationCommandInteractionDataOption,
  APIUser,
  APIGuildMember,
  APIChannel,
  APIRole,
} from 'discord.js';

export interface SlashContextOptions {
  getSubcommand: (required?: boolean) => string | undefined;
  getSubcommandGroup: (required?: boolean) => string | undefined;
  getString: (name: string, required?: boolean) => string | undefined;
  getInteger: (name: string, required?: boolean) => number | undefined;
  getNumber: (name: string, required?: boolean) => number | undefined;
  getBoolean: (name: string, required?: boolean) => boolean | undefined;
  getUser: (name: string, required?: boolean) => APIUser | undefined;
  getMember: (name: string, required?: boolean) => APIGuildMember | undefined;
  getRole: (name: string, required?: boolean) => APIRole | { id: string } | undefined;
  getChannel: (name: string, required?: boolean) => APIChannel | { id: string } | undefined;
  getRaw: (name: string) => APIApplicationCommandInteractionDataOption | undefined;
}

export interface ReplyOptions {
  content?: string;
  embeds?: any[];
  components?: any[];
  ephemeral?: boolean;
}

export interface SlashContext {
  interaction: any;
  guildId?: string;
  channelId?: string;
  user: APIUser;
  member?: APIGuildMember;
  receivedAt: number;
  color: string;
  rest: REST;
  options: SlashContextOptions;
  reply: (data: string | ReplyOptions) => any;
  deferReply: (ephemeral?: boolean) => any;
  editReply: (data: string | ReplyOptions) => Promise<any>;
}

export interface SlashCommand {
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder
    | Omit<SlashCommandBuilder, 'addSubcommand' | 'addSubcommandGroup'>;
  category: string;
  permissions?: bigint[];
  run: (ctx: SlashContext) => Promise<any> | any;
}

export interface BotConfig {
  token: string;
  applicationId: string;
  publicKey: string;
  mongodb: string;
  color: string;
  devGuildId?: string;
}
