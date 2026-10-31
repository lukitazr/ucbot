import { REST, Routes, ActivityType, PresenceUpdateStatus } from 'discord.js';
import mongoose from 'mongoose';
import { ExtendedClient } from '../../types';
import config from '../../config';
import 'colors';

const { token, mongodb } = config;
const palo = 53;

export default {
  name: 'clientReady',
  once: true,
  run: (client: ExtendedClient): void => {
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

    console.log('╔═════════════════════════════════════════════════════╗'.green);
    console.log('║ '.green + ' '.repeat(-1 + palo - 1) + ' ║'.green);
    console.log('║ '.green + `      Conectado como ${client.user!.tag}`.green + ' '.repeat(-1 + palo - 1 - `      Conectado como ${client.user!.tag}`.length) + ' ║'.green);
    console.log('║ '.green + ' '.repeat(-1 + palo - 1) + ' ║'.green);
    console.log('╚═════════════════════════════════════════════════════╝'.green);

    client.user!.setActivity('twitch.tv/elultimocirculo', { type: ActivityType.Streaming });
    client.user!.setStatus(PresenceUpdateStatus.Idle);

    const commandsArray = Array.from(client.commands.values())
      .filter(cmd => cmd.slashBuilder)
      .map(cmd => cmd.slashBuilder!.toJSON());

    const rest = new REST({ version: '10' }).setToken(token);

    (async () => {
      try {
        console.log('🔄 Refrescando los comandos (slash)...'.yellow);
        await rest.put(
          Routes.applicationCommands(client.user!.id),
          { body: commandsArray },
        );

        console.log('✅ Comandos recargados con éxito.'.green);
      } catch (error) {
        console.error('❌ Error al refrescar comandos:'.red, error);
      }
    })();
  },
};
