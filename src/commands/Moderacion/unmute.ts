import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Routes } from 'discord.js';
import { SlashCommand, SlashContext } from '../../types';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('🔊 Quita el aislamiento (timeout) a un usuario')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) =>
      option
        .setName('usuario')
        .setDescription('El usuario al que deseas quitar el aislamiento')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('razon')
        .setDescription('Razón de la desmutación')
        .setRequired(false)
    ),
  category: 'Moderación',
  permissions: [PermissionFlagsBits.ModerateMembers],
  run: async (ctx: SlashContext) => {
    if (!ctx.guildId) {
      return ctx.reply({ content: '❌ Este comando solo puede usarse en un servidor.', ephemeral: true });
    }

    const targetUser = ctx.options.getUser('usuario');
    if (!targetUser) {
      return ctx.reply({ content: '❌ Debes especificar un usuario válido.', ephemeral: true });
    }

    const razon = ctx.options.getString('razon') || 'No se ha especificado ninguna razón.';

    try {
      await ctx.rest.patch(Routes.guildMember(ctx.guildId, targetUser.id), {
        body: { communication_disabled_until: null },
        reason: razon,
      });

      const embed = new EmbedBuilder()
        .setTitle('🔊 Aislamiento Removido')
        .setDescription(
          `**Usuario:** <@${targetUser.id}>\n` +
          `**Razón:** ${razon}\n` +
          `**Moderador:** <@${ctx.user.id}>`
        )
        .setColor('Green')
        .setTimestamp();

      return ctx.reply({ embeds: [embed] });
    } catch (error: any) {
      console.error('Error al quitar aislamiento:', error);
      return ctx.reply({
        content: `❌ No se pudo quitar el aislamiento al usuario.\n*Detalle:* \`${error?.message || error}\``,
        ephemeral: true,
      });
    }
  },
};

export default command;
