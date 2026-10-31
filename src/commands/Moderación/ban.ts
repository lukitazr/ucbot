import { SlashCommandBuilder, EmbedBuilder, Message } from 'discord.js';
import { Command, ExtendedClient } from '../../types';

const command: Command = {
  name: 'ban',
  aliases: ['banear', 'banuser', 'kill', 'papear'],
  desc: 'Sirve para banear a un usuario del Servidor',
  permisos: ['BanMembers'],
  permisos_bot: ['BanMembers'],
  slashBuilder: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Sirve para banear a un usuario del Servidor')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('El usuario a banear')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('razon')
        .setDescription('La razón del baneo')
        .setRequired(false)
    ),
  async run(client: ExtendedClient, message: Message | null, args: string[], _prefix: string): Promise<void> {
    if (!message || !message.guild) return;

    const usuario = message.guild.members.cache.get(args[0]) || message.mentions.members?.filter(m => m.guild.id == message.guild!.id).first();
    if (!usuario) {
      await message.reply('❌ **No se ha encontrado al usuario que has especificado!**');
      return;
    };

    let razon = args.slice(1).join(' ');
    if (!razon) razon = 'No se ha especificado ninguna razón!';

    if (usuario.id == message.guild.ownerId) await message.reply('❌ **No puedes banear al DUEÑO del Servidor!**');

    if (message.guild.members.me!.roles.highest.position > usuario.roles.highest.position) {
      if (message.member && message.member.roles.highest.position > usuario.roles.highest.position) {
        await usuario.send({
          embeds: [
            new EmbedBuilder()
              .setTitle(`Has sido baneado de __${message.guild.name}__`)
              .setDescription(`**Razón:** \n\`\`\`yml\n${razon}\`\`\``)
              .setColor(client.color as any)
              .setTimestamp(),
          ],
        }).catch(() => { message.reply('No se le ha podido enviar el DM al usuario!'); });

        message.reply({
          embeds: [new EmbedBuilder()
            .setTitle('✅ Usuario baneado')
            .setDescription(`**Se ha baneado exitosamente a \`${usuario.user.tag}\` *(\`${usuario.id}\`)* del servidor!**`)
            .addFields([{ name: 'Razón', value: `\n\`\`\`yml\n${razon}\`\`\`` }])
            .setColor(client.color as any)
            .setTimestamp(),
          ],
        });

        usuario.ban({ reason: razon }).catch(() => {
          return message.reply({
            embeds:
              [new EmbedBuilder()
                .setTitle('❌ No he podido banear al usuario!')
                .setColor('Red'),
              ],
          });
        });
      } else {
        await message.reply('❌ **Tu Rol está por __debajo__ del usuario que quieres banear!**');
        return;
      }
    } else {
      await message.reply('❌ **Mi Rol está por __debajo__ del usuario que quieres banear!**');
      return;
    }
  },
};

export default command;
