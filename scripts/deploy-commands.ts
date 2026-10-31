import { Routes } from 'discord.js';
import { commandsList } from '../src/commands';
import rest from '../src/lib/rest';
import { applicationId, devGuildId } from '../src/config';
import 'colors';

async function deployCommands() {
  const appId = applicationId || process.env.DISCORD_APPLICATION_ID || process.env.CLIENT_ID;

  if (!appId) {
    console.error('❌ DISCORD_APPLICATION_ID o CLIENT_ID no está configurado en .env'.red);
    process.exit(1);
  }

  const slashCommandsPayload = commandsList.map((cmd) => cmd.data.toJSON());

  console.log(`\n🚀 Preparando registro de ${slashCommandsPayload.length} slash commands...`.cyan);
  console.table(
    commandsList.map((cmd) => ({
      Comando: `/${cmd.data.name}`,
      Categoría: cmd.category,
      Descripción: cmd.data.description,
    }))
  );

  try {
    if (devGuildId) {
      console.log(`📌 Registrando en Servidor de Pruebas (Guild ID: ${devGuildId})...`.yellow);
      await rest.put(
        Routes.applicationGuildCommands(appId, devGuildId),
        { body: slashCommandsPayload }
      );
      console.log(`✅ ¡Comandos de prueba actualizados inmediatamente en el servidor ${devGuildId}!\n`.green);
    } else {
      console.log('🌐 Registrando comandos de forma GLOBAL con Discord REST API...'.yellow);
      await rest.put(
        Routes.applicationCommands(appId),
        { body: slashCommandsPayload }
      );
      console.log('✅ ¡Comandos globales registrados exitosamente!\n'.green);
    }
  } catch (error) {
    console.error('❌ Error al registrar los comandos en Discord:'.red, error);
    process.exit(1);
  }
}

deployCommands();
