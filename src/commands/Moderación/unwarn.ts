import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Message } from 'discord.js';
import { Command, ExtendedClient } from '../../types';
import { asegurar_todo } from '../../utils/funciones';
import warnSchema from '../../models/warns';

const command: Command = {
  name: 'unwarn',
  aliases: ['deswarnear', 'remove-warn', 'quitar-aviso'],
  desc: 'Sirve para quitar un aviso a un usuario del Servidor',
  permisos: ['BanMembers'],
  permisos_bot: ['BanMembers'],
  slashBuilder: new SlashCommandBuilder()
    .setName('unwarn')
    .setDescription('Sirve para quitar un aviso a un usuario del Servidor')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('El usuario a deswarnear')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('id_warn')
        .setDescription('ID del warn a remover')
        .setRequired(true)
    ),
  async run(
    client: ExtendedClient,
    message: Message | null,
    args: string[],
    _prefix: string,
    _interaction: ChatInputCommandInteraction | null,
  ): Promise<void> {
    if (!message || !message.guild) return;

    // definimos la persona a avisar
    const usuario = message.guild.members.cache.get(args[0]) || message.mentions.members?.filter(m => m.guild.id == message.guild!.id).first();
    if (!usuario) {
      await message.reply('❌ **No se ha encontrado al usuario que has especificado!**');
      return;
    }

    await asegurar_todo(message.guild.id, usuario.id);

    // definimos razón, y si no hay, la razón será "No se ha especificado ninguna razón!"
    const id_warn = parseInt(args[1]);
    const data = await warnSchema.findOne({ guildID: message.guild.id, userID: usuario.id });

    if (!data || data.warnings.length === 0) {
      await message.reply('❌ **El usuario que has especificado no tiene ningún warning!**');
      return;
    }
    if (isNaN(id_warn) || id_warn < 0) {
      await message.reply('❌ **La ID del warn que has especificado no es válida!**');
      return;
    }
    if (data.warnings[id_warn] === undefined) {
      await message.reply('❌ **No se ha encontrado el warn que has especificado!**');
      return;
    }

    // comprobamos que el usuario a avisar no es el dueño del servidor
    if (usuario.id == message.guild.ownerId) {
      await message.reply('❌ **No puedes avisar al DUEÑO del Servidor!**');
      return;
    }

    // comprobar que el BOT está por encima del usuario a avisar
    if (message.guild.members.me!.roles.highest.position > usuario.roles.highest.position) {
      // comprobar que la posición del rol del usuario que ejecuta el comando sea mayor a la persona que vaya a avisar
      if (message.member && message.member.roles.highest.position > usuario.roles.highest.position) {

        message.reply({
          embeds: [new EmbedBuilder()
            .setTitle('✅ Warn removido')
            .setDescription(`**Se ha removido el warn con ID \`${id_warn}\` de \`${usuario.user.tag}\` exitosamente!**`)
            .setColor(client.color as any)
            .setTimestamp(),
          ],
        });
        data.warnings.splice(id_warn, 1);
        await data.save();
      } else {
        await message.reply('❌ **Tu Rol está por __debajo__ del usuario que quieres avisar!**');
        return;
      }
    } else {
      await message.reply('❌ **Mi Rol está por __debajo__ del usuario que quieres avisar!**');
      return;
    }
  },
};

export default command;
