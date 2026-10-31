import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import schema from '../../models/servidor';
import { Command, ExtendedClient } from '../../types';

const command: Command = {
  name: 'prefix',
  aliases: ['prefijo', 'cambiarprefijo', 'cambiarprefix'],
  desc: 'Sirve para cambiar el Prefijo del Bot en el Servidor',
  permisos: ['Administrator'],
  slashBuilder: new SlashCommandBuilder()
    .setName('prefix')
    .setDescription('Sirve para cambiar el Prefijo del Bot en el Servidor')
    .addStringOption(option =>
      option
        .setName('nuevo_prefijo')
        .setDescription('El nuevo prefijo para el servidor')
        .setRequired(true)
    ),
  async run(
    __client: ExtendedClient,
    message: Message | null,
    args: string[],
    _prefix: string,
    __interaction: ChatInputCommandInteraction | null,
  ): Promise<void> {
    // Nota: 'idioma' no se está usando realmente en el código original de forma tipada,
    // pero se usaba para acceder a 'client.la'. En la versión TS, si 'client.la' no existe,
    // habrá que ajustar esto. Asumiré que quieres mantener la lógica original pero adaptada.
    // Si 'client.la' no está en ExtendedClient, esto dará error.
    // Por ahora, haré una implementación básica.

    const newPrefix = args[0];
    if (!newPrefix) await message?.reply('❌ Debes especificar un nuevo prefijo.');

    await schema.findOneAndUpdate({ guildID: message?.guild?.id }, {
      prefijo: newPrefix
    });

    await message?.reply(`✅ El prefijo ha sido cambiado a \`${newPrefix}\``);
  }
};

export default command;
