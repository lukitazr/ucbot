import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno desde el archivo .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const defaultGreetings = [
  'Hola men',
  'Hola! Como estamos?',
  'Buenas',
  'Que me mencionas w',
  'Que quieres w',
  'Que onda w',
  'Por que me mencionas w',
  'Que pasa',
  'Holaaa :3',
  'Hello world',
  'Que tranza',
  'Si quieres usar mis comandos pon `uc!` de prefijo bro',
  '`uc!` pa usar mis comandos',
];

export interface BotConfig {
  token: string;
  prefix: string;
  mongodb: string;
  ownerIDS: string[];
  logs: string;
  color: string;
  greetings: string[];
}

export const config: BotConfig = {
  token: process.env.DISCORD_TOKEN || process.env.TOKEN || '',
  prefix: process.env.PREFIX || 'uc!',
  mongodb: process.env.MONGODB_URI || process.env.MONGODB || '',
  ownerIDS: (process.env.OWNER_IDS || process.env.OWNERIDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean),
  logs: process.env.LOGS_CHANNEL_ID || process.env.LOGS || '',
  color: process.env.BOT_COLOR || process.env.COLOR || '#ffc600',
  greetings: process.env.GREETINGS
    ? process.env.GREETINGS.split(';').map((g) => g.trim()).filter(Boolean)
    : defaultGreetings,
};

export const { token, prefix, mongodb, ownerIDS, logs, color, greetings } = config;

export default config;

