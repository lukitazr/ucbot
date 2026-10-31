import dns from 'dns';
import mongoose from 'mongoose';
import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { ExtendedClient } from './types';
import config, { token, mongodb } from './config';
import 'colors';

// Configurar servidores DNS públicos para evitar ECONNREFUSED en consultas SRV de MongoDB Atlas en Windows
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignorar si no es soportado por el entorno
}

if (mongodb) {
  mongoose.connect(mongodb).then(() => {
    console.log(`
╔═════════════════════════════════════════════════════╗
║                                                     ║
║       Conectado a la base de datos de MONGODB!      ║
║                                                     ║
╚═════════════════════════════════════════════════════╝`.blue);
  }).catch((err) => {
    console.log('☁ ERROR AL CONECTAR A LA BASE DE DATOS DE MONGODB'.red);
    console.log(err);
  });
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildExpressions,
  ],
  partials: [
    Partials.User,
    Partials.Channel,
    Partials.GuildMember,
    Partials.Message,
    Partials.Reaction,
  ],
}) as ExtendedClient;

client.commands = new Collection();
client.aliases = new Collection();
client.color = config.color;

readdirSync('./src/handlers').forEach((handler) => {
  try {
    require(`./handlers/${handler}`).default(client);
  } catch (e) {
    console.log(`ERROR EN EL HANDLER ${handler}`.red);
    console.log(e);
  }
});

client.login(token);
