import { ChatInputCommandInteraction, Message, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { Command, ExtendedClient } from '../../types';
import warnSchema from '../../models/warns';

const command: Command = {
  name: 'leaderboard-warns',
  aliases: ['warns-g', 'server-warns', 'warnings-server', 'leader-warns'],
  desc: 'Sirve para mostrar los warnings del server',
  slashBuilder: new SlashCommandBuilder()
    .setName('leaderboard-warns')
    .setDescription('Sirve para mostrar los warnings del server'),
  async run(
    client: ExtendedClient,
    message: Message | null,
    _args: string[],
    _prefix: string,
    _interaction: ChatInputCommandInteraction | null,
  ): Promise<void> {
    if (!message || !message.guild) return;

    const topUsers = await warnSchema.aggregate([
      {
        $project: {
          userID: 1,
          warnCount: { $size: { $ifNull: ['$warnings', []] } },
        },
      },
      { $sort: { warnCount: -1 } },
      { $limit: 10 },
    ]);

    const rows = topUsers.map((user, index) => `**${index + 1}.** <@${user.userID}> \`${user.userID}\` - ${user.warnCount} warns`).join('\n');

    const embed = new EmbedBuilder()
      .setTitle('Top 10 usuarios con más warns')
      .setDescription(rows || 'No se encontraron usuarios.')
      .setColor(client.color as any);

    await message.reply({ embeds: [embed] });
  },
};

export default command;
