import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { SlashCommand, SlashContext } from '../../types';
import warnSchema from '../../models/warns';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('leaderboard-warners')
    .setDescription('👮 Muestra la clasificación de los moderadores que más avisos han emitido'),
  category: 'Moderación',
  run: async (ctx: SlashContext) => {
    if (!ctx.guildId) {
      return ctx.reply({ content: '❌ Este comando solo puede usarse en un servidor.', ephemeral: true });
    }

    const docs = await warnSchema.find({ guildID: ctx.guildId });
    const counts: Record<string, number> = {};

    for (const doc of docs) {
      if (Array.isArray(doc.warnings)) {
        for (const w of doc.warnings) {
          if (w.autor) {
            counts[w.autor] = (counts[w.autor] || 0) + 1;
          }
        }
      }
    }

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);

    if (!sorted.length) {
      return ctx.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('👮 Top Moderadores con más Avisos')
            .setDescription('No hay registros de avisos aplicados en este servidor.')
            .setColor('Green'),
        ],
      });
    }

    const rows = sorted
      .map(([modId, total], index) => `**${index + 1}.** <@${modId}> — \`${total}\` advertencia(s)`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setTitle('👮 Top Moderadores con más Avisos')
      .setDescription(rows)
      .setColor(ctx.color as any)
      .setTimestamp();

    return ctx.reply({ embeds: [embed] });
  },
};

export default command;
