import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, Message } from 'discord.js';
import { Command, ExtendedClient } from '../../types';
const command: Command = {
  name: 'mute',
  aliases: ['mutear', 'intenta-hablar', 'jajamuteao', 'timeout', 'stfu', 'callao'],
  desc: 'Comando para mutear a tal usuario por un determinado tiempo',
  permisos: ['BanMembers'], // Assuming BanMembers is used for timeout as well per original code, though ModerateMembers is more appropriate for timeout
  permisos_bot: ['BanMembers'],
  slashBuilder: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Comando para mutear a tal usuario por un determinado tiempo')
    .addUserOption(option =>
      option
        .setName('usuario')
        .setDescription('El usuario a mutear')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName('tiempo')
        .setDescription('Tiempo en minutos')
        .setRequired(true)
    )
    .addStringOption(option =>
      option
        .setName('razon')
        .setDescription('La razón del muteo')
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

    const usuario = message.guild.members.cache.get(args[0]) || message.mentions.members?.filter(m => m.guild.id == message.guild!.id).first();

    if (!usuario) {
      await message.reply('❌ **No se ha encontrado al usuario que has especificado!**');
      return;
    };

    let tiempo = parseInt(args[1]);
    if (isNaN(tiempo) || !tiempo || tiempo <= 0) {
      tiempo = 1;
    }
    let sas = '';
    if (tiempo > 1) sas = 'minutos';
    else if (tiempo == 1) sas = 'minuto';

    const tempo = (tiempo * 60) * (10 ** 3);

    let razon = args.slice(2).join(' ');
    if (!razon) razon = 'No se ha especificado ninguna razón!';

    if (usuario.id == message.guild.ownerId) {
      await message.reply('❌ **No puedes mutear al DUEÑO del Servidor!**');
      return;
    };

    if (message.guild.members.me!.roles.highest.position > usuario.roles.highest.position) {
      if (message.member && message.member.roles.highest.position > usuario.roles.highest.position) {

        usuario.timeout(tempo, razon).catch(() => {
          return message.reply({
            embeds:
              [new EmbedBuilder()
                .setTitle('❌ No he podido mutear al usuario!')
                .setColor('Red'),
              ],
          });
        });

        usuario.send({
          embeds: [
            new EmbedBuilder()
              .setTitle(`Has sido muteado en __${message.guild.name}__`)
              .setDescription(`**Razón:** \n\`\`\`yml\n${razon}\`\`\``)
              .addFields([{ name: 'Tiempo', value: `\n\`\`\`yml\n${tiempo} ${sas}\`\`\`` }])
              .setColor(client.color as any)
              .setTimestamp(),
          ],
        }).catch(() => { message.reply('No se le ha podido enviar el DM al usuario!'); });

        message.reply({
          embeds: [new EmbedBuilder()
            .setTitle('✅ Usuario muteado')
            .setDescription(`**Se ha muteado exitosamente a \`${usuario.user.tag}\` *(\`${usuario.id}\`)* del servidor!**`)
            .addFields([{ name: 'Razón', value: `\n\`\`\`yml\n${razon}\`\`\`` }])
            .addFields([{ name: 'Tiempo', value: `\n\`\`\`yml\n${tiempo} ${sas}\`\`\`` }])
            .setColor(client.color as any)
            .setTimestamp(),
          ],
        });

      } else {
        await message.reply('❌ **Tu Rol está por __debajo__ del usuario que quieres mutear!**');
        return;
      }
    } else {
      await message.reply('❌ **Mi Rol está por __debajo__ del usuario que quieres mutear!**');
      return;
    }
  },
};

export default command;
