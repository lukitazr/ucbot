import dotenv from 'dotenv';
import path from 'path';
import { BotConfig } from '../types';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config: BotConfig = {
  token: process.env.DISCORD_TOKEN || process.env.TOKEN || '',
  applicationId:
    process.env.DISCORD_APPLICATION_ID ||
    process.env.DISCORD_CLIENT_ID ||
    process.env.APPLICATION_ID ||
    process.env.CLIENT_ID ||
    '',
  publicKey: process.env.DISCORD_PUBLIC_KEY || process.env.PUBLIC_KEY || '',
  mongodb: process.env.MONGODB_URI || process.env.MONGODB || '',
  color: process.env.BOT_COLOR || process.env.COLOR || '#ffc600',
  devGuildId: process.env.DISCORD_DEV_GUILD_ID || process.env.DEV_GUILD_ID,
};

export const { token, applicationId, publicKey, mongodb, color, devGuildId } = config;

export default config;
