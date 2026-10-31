import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Routes } from 'discord.js';
import { SlashCommand, SlashContext } from '../../types';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('🔨 Banea a un usuario del servidor')
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .addUserOption((option) =>
      option
        .setName('usuario')
        .setDescription('El usuario que deseas banear')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('razon')
        .setDescription('La razón del baneo')
        .setRequired(false)
    ),
  category: 'Moderación',
  permissions: [PermissionFlagsBits.BanMembers],
  run: async (ctx: SlashContext) => {
    if (!ctx.guildId) {
      return ctx.reply({ content: '❌ Este comando solo puede usarse en un servidor.', ephemeral: true });
    }

    const targetUser = ctx.options.getUser('usuario');
    if (!targetUser) {
      return ctx.reply({ content: '❌ Debes especificar un usuario válido a banear.', ephemeral: true });
    }

    if (targetUser.id === ctx.user.id) {
      return ctx.reply({ content: '❌ ¡No puedes banearte a ti mismo!', ephemeral: true });
    }

    const razon = ctx.options.getString('razon') || 'No se ha especificado ninguna razón.';

    try {
      await ctx.rest.put(Routes.guildBan(ctx.guildId, targetUser.id), {
        body: { delete_message_seconds: 0 },
        reason: razon,
      });

      const embed = new EmbedBuilder()
        .setTitle('🔨 Usuario Baneado')
        .setDescription(`**Usuario:** <@${targetUser.id}> (\`${targetUser.id}\`)\n**Razón:** ${razon}\n**Moderador:** <@${ctx.user.id}>`)
        .setColor('Red')
        .setTimestamp();

      return ctx.reply({ embeds: [embed] });
    } catch (error: any) {
      console.error('Error al banear usuario:', error);
      return ctx.reply({
        content: `❌ No se pudo banear al usuario. Asegúrate de que el bot tenga el rol de moderación por encima del usuario objetivo.\n*Detalle:* \`${error?.message || error}\``,
        ephemeral: true,
      });
    }
  },
};

export default command;
