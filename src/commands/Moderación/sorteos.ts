import { SlashCommandBuilder, EmbedBuilder, TextChannel, ChatInputCommandInteraction, Message } from 'discord.js';
import { Command, ExtendedClient } from '../../types';
import ms from 'ms';

const command: Command = {
  name: 'giveaway',
  aliases: ['sorteo', 'sorteos', 'giveaways'],
  desc: 'Sirve administrar/crear un sistema de sorteos',
  permisos: ['BanMembers'],
  permisos_bot: ['BanMembers'],
  slashBuilder: new SlashCommandBuilder()
    .setName('giveaway')
    .setDescription('Sirve administrar/crear un sistema de sorteos')
    .addSubcommand(subcommand =>
      subcommand
        .setName('start')
        .setDescription('Inicia un sorteo')
        .addChannelOption(option => option.setName('canal').setDescription('Canal del sorteo').setRequired(true))
        .addStringOption(option => option.setName('duracion').setDescription('Duración del sorteo (1m, 1h, 1d)').setRequired(true))
        .addIntegerOption(option => option.setName('ganadores').setDescription('Cantidad de ganadores').setRequired(true))
        .addStringOption(option => option.setName('premio').setDescription('Premio del sorteo').setRequired(true))
    ),
  async run(
    client: ExtendedClient,
    message: Message | null,
    args: string[],
    prefix: string,
    _interaction: ChatInputCommandInteraction | null,
  ): Promise<void> {
    if (!message || !message.guild) return;

    // definimos los metodos del sorteos
    const metodos = ['start', 'reroll', 'end'];
    if (!args || !metodos.includes(args[0])) {
      await message.reply({
        embeds: [new EmbedBuilder()
          .setTitle('❌ Tienes que especificar un método válido!')
          .setColor('Red')
          .setDescription(`Métodos disponibles: ${metodos.map(metodo => `\`${metodo}\``).join(', ')}`),
        ],
      });
      return;
    }

    switch (args[0]) {
      case 'start': {
        const embed = new EmbedBuilder()
          .setDescription(`**Uso:** \`${prefix}sorteo <#canal> <duración> <ganadores> <premio>\``)
          .setColor('Red');

        const canal = message.guild.channels.cache.get(args[1]) || message.mentions.channels.filter(c => c instanceof TextChannel && c.guild.id == message.guild!.id).first();
        if (!canal || !(canal instanceof TextChannel)) {
          await message.reply({
            embeds: [embed.setTitle('❌ Tienes que especificar un canal válido!')],
          });
          return;
        }
        const tiempo = args[2];
        if (!tiempo) {
          await message.reply({
            embeds: [embed.setTitle('❌ Tienes que especificar una duración del sorteo válida!')],
          });
          return;
        }

        const tiempo_en_ms = ms(tiempo as any) as unknown as number;
        if (!tiempo_en_ms || isNaN(tiempo_en_ms) || tiempo_en_ms < 0) {
          await message.reply({
            embeds: [embed.setTitle('❌ Tienes que especificar una duración del sorteo válida!')],
          });
          return;
        }
        const ganadores = Number(args[3]);
        if (!ganadores || isNaN(ganadores) || ganadores < 0 || ganadores % 1 != 0) {
          await message.reply({
            embeds: [embed.setTitle('❌ Tienes que especificar una cantidad de ganadores válida!')],
          });
          return;
        }
        const premio = args.slice(4).join(' ');
        if (!premio) {
          await message.reply({
            embeds: [embed.setTitle('❌ Tienes que especificar un premio válido!')],
          });
          return;
        }

        client.giveawaysManager.start(canal, {
          duration: tiempo_en_ms,
          winnerCount: Number(ganadores),
          prize: premio,
          hostedBy: message.author,
          messages: {
            giveaway: '🎉🎉 **NUEVO SORTEO** 🎉🎉',
            giveawayEnded: '⌚ **SORTEO FINALIZADO** ⌚',
            inviteToParticipate: 'Reacciona con 🎉 para participar!',
            winMessage: '🎉 Enhorabuena {winners} has/habéis ganado **{this.prize}**',
            winners: 'Ganador(es)',
            hostedBy: 'Hosteado por {this.hostedBy}',
            endedAt: 'Finalizado el',
            drawing: 'Termina en <t:{Math.round(this.endAt / 1000)}:R>',
          },
        }).then(() => {
          return message.reply(`✅ **Sorteo iniciado en ${canal}**`);
        });
        break;
      }

      default:
        break;
    }
  },
};

export default command;
