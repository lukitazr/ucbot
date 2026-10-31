import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Routes } from 'discord.js';
import { SlashCommand, SlashContext } from '../../types';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('👢 Expulsa a un usuario del servidor')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((option) =>
      option
        .setName('usuario')
        .setDescription('El usuario que deseas expulsar')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('razon')
        .setDescription('La razón de la expulsión')
        .setRequired(false)
    ),
  category: 'Moderación',
  permissions: [PermissionFlagsBits.KickMembers],
  run: async (ctx: SlashContext) => {
    if (!ctx.guildId) {
      return ctx.reply({ content: '❌ Este comando solo puede usarse en un servidor.', ephemeral: true });
    }

    const targetUser = ctx.options.getUser('usuario');
    if (!targetUser) {
      return ctx.reply({ content: '❌ Debes especificar un usuario válido a expulsar.', ephemeral: true });
    }

    if (targetUser.id === ctx.user.id) {
      return ctx.reply({ content: '❌ ¡No puedes expulsarte a ti mismo!', ephemeral: true });
    }

    const razon = ctx.options.getString('razon') || 'No se ha especificado ninguna razón.';

    try {
      await ctx.rest.delete(Routes.guildMember(ctx.guildId, targetUser.id), {
        reason: razon,
      });

      const embed = new EmbedBuilder()
        .setTitle('👢 Usuario Expulsado')
        .setDescription(`**Usuario:** <@${targetUser.id}> (\`${targetUser.id}\`)\n**Razón:** ${razon}\n**Moderador:** <@${ctx.user.id}>`)
        .setColor('Orange')
        .setTimestamp();

      return ctx.reply({ embeds: [embed] });
    } catch (error: any) {
      console.error('Error al expulsar usuario:', error);
      return ctx.reply({
        content: `❌ No se pudo expulsar al usuario. Verifica que el bot tenga permisos suficientes.\n*Detalle:* \`${error?.message || error}\``,
        ephemeral: true,
      });
    }
  },
};

export default command;
