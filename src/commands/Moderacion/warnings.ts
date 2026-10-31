import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { SlashCommand, SlashContext } from '../../types';
import warnSchema from '../../models/warns';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('📋 Muestra la lista de advertencias de un usuario')
    .addUserOption((option) =>
      option
        .setName('usuario')
        .setDescription('El usuario del que deseas consultar los avisos')
        .setRequired(false)
    ),
  category: 'Moderación',
  run: async (ctx: SlashContext) => {
    if (!ctx.guildId) {
      return ctx.reply({ content: '❌ Este comando solo puede usarse en un servidor.', ephemeral: true });
    }

    const targetUser = ctx.options.getUser('usuario') || ctx.user;
    const data = await warnSchema.findOne({ guildID: ctx.guildId, userID: targetUser.id });

    if (!data || !data.warnings || data.warnings.length === 0) {
      return ctx.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('📋 Registro de Advertencias')
            .setDescription(`✅ <@${targetUser.id}> no tiene ningún aviso en este servidor.`)
            .setColor('Green'),
        ],
      });
    }

    const fields = data.warnings.slice(0, 25).map((warn: any, idx: number) => ({
      name: `Aviso #${idx} · <t:${Math.round(warn.fecha / 1000)}:R>`,
      value: `**Moderador:** <@${warn.autor}>\n**Razón:** ${warn.razon}`,
    }));

    const embed = new EmbedBuilder()
      .setTitle(`📋 Advertencias de ${targetUser.username} (${data.warnings.length})`)
      .setColor(ctx.color as any)
      .addFields(fields)
      .setFooter({ text: 'Usa /unwarn para retirar una advertencia con su índice' })
      .setTimestamp();

    return ctx.reply({ embeds: [embed] });
  },
};

export default command;
