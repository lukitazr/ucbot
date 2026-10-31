import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Message } from 'discord.js';
import { Command, ExtendedClient } from '../../types';

const command: Command = {
  name: 'unmute',
  aliases: ['desmutear', 'jajadesmuteao'],
  desc: 'Comando para desmutear a tal usuario',
  permisos: ['BanMembers'],
  permisos_bot: ['BanMembers'],
  slashBuilder: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Comando para desmutear a tal usuario')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('El usuario a desmutear')
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

    const usuario = message.guild.members.cache.get(args[0]) || message.mentions.members?.filter(m => m.guild.id == message.guild!.id).first();
    if (!usuario) {
      await message.reply('❌ **No se ha encontrado al usuario que has especificado!**');
      return;
    }
    if (usuario.id == message.guild.ownerId) {
      await message.reply('❌ **No puedes mutear al DUEÑO del Servidor!**');
      return;
    }

    if (message.guild.members.me!.roles.highest.position > usuario.roles.highest.position) {
      if (message.member && message.member.roles.highest.position > usuario.roles.highest.position) {
        usuario.send({
          embeds: [
            new EmbedBuilder()
              .setTitle(`Has sido desmuteado de __${message.guild.name}__`)
              .setColor(client.color as any)
              .setTimestamp(),
          ],
        }).catch(() => { message.reply('No se le ha podido enviar el DM al usuario!'); });

        message.reply({
          embeds: [new EmbedBuilder()
            .setTitle('✅ Usuario desmuteado')
            .setDescription(`**Se ha desmuteado exitosamente a \`${usuario.user.tag}\` *(\`${usuario.id}\`)* del servidor!**`)
            .setColor(client.color as any)
            .setTimestamp(),
          ],
        });

        usuario.timeout(null).catch(() => {
          return message.reply({
            embeds:
              [new EmbedBuilder()
                .setTitle('❌ No he podido desmutear al usuario!')
                .setColor('Red'),
              ],
          });
        });
      } else {
        await message.reply('❌ **Tu Rol está por __debajo__ del usuario que quieres desmutear!**');
        return;
      }
    } else {
      await message.reply('❌ **Mi Rol está por __debajo__ del usuario que quieres desmutear!**');
      return;
    }
  },
};

export default command;
