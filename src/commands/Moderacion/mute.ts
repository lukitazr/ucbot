import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Routes } from 'discord.js';
import ms from 'ms';
import { SlashCommand, SlashContext } from '../../types';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('mute')
    .setDescription('🔇 Aísla / silencia (timeout) temporalmente a un usuario')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) =>
      option
        .setName('usuario')
        .setDescription('El usuario a silenciar')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('tiempo')
        .setDescription('Duración del aislamiento (ej: 10m, 1h, 1d)')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('razon')
        .setDescription('Razón del aislamiento')
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

    if (targetUser.id === ctx.user.id) {
      return ctx.reply({ content: '❌ No puedes aislarte a ti mismo.', ephemeral: true });
    }

    const tiempoStr = ctx.options.getString('tiempo', true);
    let durationMs: number;
    try {
      const parsed = ms(tiempoStr as any);
      if (typeof parsed !== 'number' || parsed < 5000 || parsed > 28 * 24 * 60 * 60 * 1000) {
        return ctx.reply({
          content: '❌ Duración inválida. Debe ser entre 5 segundos y 28 días (ejemplos: `10m`, `2h`, `1d`).',
          ephemeral: true,
        });
      }
      durationMs = parsed;
    } catch {
      return ctx.reply({
        content: '❌ Formato de tiempo inválido. Usa formatos como `10m`, `1h`, `7d`.',
        ephemeral: true,
      });
    }

    const razon = ctx.options.getString('razon') || 'No se ha especificado ninguna razón.';
    const until = new Date(Date.now() + durationMs).toISOString();

    try {
      await ctx.rest.patch(Routes.guildMember(ctx.guildId, targetUser.id), {
        body: { communication_disabled_until: until },
        reason: razon,
      });

      const embed = new EmbedBuilder()
        .setTitle('🔇 Usuario Aislado (Timeout)')
        .setDescription(
          `**Usuario:** <@${targetUser.id}>\n` +
          `**Duración:** \`${tiempoStr}\`\n` +
          `**Razón:** ${razon}\n` +
          `**Moderador:** <@${ctx.user.id}>`
        )
        .setColor('Yellow')
        .setTimestamp();

      return ctx.reply({ embeds: [embed] });
    } catch (error: any) {
      console.error('Error al aislar usuario:', error);
      return ctx.reply({
        content: `❌ No se pudo aislar al usuario. Verifica la jerarquía de roles del bot.\n*Detalle:* \`${error?.message || error}\``,
        ephemeral: true,
      });
    }
  },
};

export default command;
