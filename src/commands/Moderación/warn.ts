import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Message } from 'discord.js';
import { Command, ExtendedClient } from '../../types';
import { asegurar_todo } from '../../utils/funciones';
import warnSchema from '../../models/warns';

const command: Command = {
  name: 'warn',
  aliases: ['warnear', 'avisar'],
  desc: 'Sirve para enviar un aviso a un usuario del Servidor',
  permisos: ['BanMembers'],
  permisos_bot: ['BanMembers'],
  slashBuilder: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Sirve para enviar un aviso a un usuario del Servidor')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('El usuario a warnear')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('razon')
        .setDescription('La razón del warn')
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

    // definimos la persona a avisar
    const usuario = message.guild.members.cache.get(args[0]) || message.mentions.members?.filter(m => m.guild.id == message.guild!.id).first();
    if (!usuario) {
      await message.reply('❌ **No se ha encontrado al usuario que has especificado!**');
      return;
    }

    await asegurar_todo(message.guild.id, usuario.id);

    // definimos razón, y si no hay, la razón será "No se ha especificado ninguna razón!"
    let razon = args.slice(1).join(' ');
    if (!razon) razon = 'No se ha especificado ninguna razón!';

    // comprobamos que el usuario a avisar no es el dueño del servidor
    if (usuario.id == message.guild.ownerId) {
      await message.reply('❌ **No puedes avisar al DUEÑO del Servidor!**');
      return;
    }

    // comprobar que el BOT está por encima del usuario a avisar
    if (message.guild.members.me!.roles.highest.position > usuario.roles.highest.position) {
      // comprobar que la posición del rol del usuario que ejecuta el comando sea mayor a la persona que vaya a avisar
      if (message.member && message.member.roles.highest.position > usuario.roles.highest.position) {
        // enviamos al usuario por privado que ha sido avisado!
        usuario.send({
          embeds: [
            new EmbedBuilder()
              .setTitle(`Has sido warneado en __${message.guild.name}__`)
              .setDescription(`**Razón:** \n\`\`\`yml\n${razon}\`\`\``)
              .setColor(client.color as any)
              .setTimestamp(),
          ],
        }).catch(() => { message.reply('No se le ha podido enviar el DM al usuario!'); });

        // enviamos en el canal que el usuario ha sido avisado exitosamenete
        message.reply({
          embeds: [new EmbedBuilder()
            .setTitle('✅ Usuario avisado')
            .setDescription(`**Se ha avisado exitosamente a \`${usuario.user.tag}\` *(\`${usuario.id}\`)* del servidor!**`)
            .addFields([{ name: 'Razón', value: `\n\`\`\`yml\n${razon}\`\`\`` }])
            .setColor(client.color as any)
            .setTimestamp(),
          ],
        });

        // creamos el objeto del warn
        const objeto_warn = {
          fecha: Date.now(),
          autor: message.author.id,
          razon,
        };

        // empujamos el objeto en la base de datos
        await warnSchema.findOneAndUpdate({ guildID: message.guild.id, userID: usuario.id }, {
          $push: {
            warnings: objeto_warn,
          },
        });
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
