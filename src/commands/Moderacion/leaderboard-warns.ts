import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { SlashCommand, SlashContext } from '../../types';
import warnSchema from '../../models/warns';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('leaderboard-warns')
    .setDescription('🏆 Muestra el top de usuarios con más advertencias en el servidor'),
  category: 'Moderación',
  run: async (ctx: SlashContext) => {
    if (!ctx.guildId) {
      return ctx.reply({ content: '❌ Este comando solo puede usarse en un servidor.', ephemeral: true });
    }

    const topUsers = await warnSchema.aggregate([
      { $match: { guildID: ctx.guildId } },
      {
        $project: {
          userID: 1,
          warnCount: { $size: { $ifNull: ['$warnings', []] } },
        },
      },
      { $match: { warnCount: { $gt: 0 } } },
      { $sort: { warnCount: -1 } },
      { $limit: 10 },
    ]);

    if (!topUsers.length) {
      return ctx.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('🏆 Top 10 Usuarios más Avisados')
            .setDescription('✅ ¡No hay usuarios con advertencias activas en este servidor!')
            .setColor('Green'),
        ],
      });
    }

    const rows = topUsers
      .map((u, i) => `**${i + 1}.** <@${u.userID}> — \`${u.warnCount}\` aviso(s)`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle('🏆 Top 10 Usuarios más Avisados')
      .setDescription(rows)
      .setColor(ctx.color as any)
      .setTimestamp();

    return ctx.reply({ embeds: [embed] });
  },
};

export default command;
