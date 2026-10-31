import { ChatInputCommandInteraction, Message, SlashCommandBuilder } from 'discord.js';
import { Command, ExtendedClient } from '../../types';
import { paginacion, asegurar_todo } from '../../utils/funciones';
import warnSchema from '../../models/warns';

const command: Command = {
  name: 'warnings',
  aliases: ['avisos', 'user-warns', 'warnings-usuario', 'warns'],
  desc: 'Sirve para mostrar los warnings de un Usuario',
  slashBuilder: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('Sirve para mostrar los warnings de un Usuario')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('El usuario a ver sus warnings')
        .setRequired(false)
    ),
  async run(
    client: ExtendedClient,
    message: Message | null,
    args: string[],
    _prefix: string,
    _interaction: ChatInputCommandInteraction | null,
  ): Promise<void> {
    if (!message || !message.guild) return;

    const usuario = message.guild.members.cache.get(args[0]) || message.mentions.members?.filter(m => m.guild.id == message.guild!.id).first() || message.member;
    if (!usuario) {
      await message.reply('❌ **No se ha encontrado al usuario que has especificado!**');
      return;
    }

    await asegurar_todo(message.guild.id, usuario.id);
    const data = await warnSchema.findOne({ guildID: message.guild.id, userID: usuario.id });

    if (!data || data.warnings.length == 0) {
      await message.reply(`✅ **\`${usuario.user.tag}\` no tiene ningún warning en el servidor!**`);
      return;
    }

    const texto = data.warnings.map((warn: any, index: number) => `================================\n**ID DE WARN:** \`${index}\`\n**FECHA:** <t:${Math.round(warn.fecha / 1000)}>\n**AUTOR:** <@${warn.autor}> \n**RAZÓN:** \`${warn.razon}\`\n`);

    await paginacion(client, message, texto, `🛠 \`[${data.warnings.length}]\` WARNINGS DE ${usuario.user.tag}`, 1);
  },
};

export default command;
