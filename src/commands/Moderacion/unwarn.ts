import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { SlashCommand, SlashContext } from '../../types';
import warnSchema from '../../models/warns';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('unwarn')
    .setDescription('🗑️ Quita un aviso a un usuario mediante su ID/Índice')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) =>
      option
        .setName('usuario')
        .setDescription('El usuario al que deseas quitar el aviso')
        .setRequired(true)
    )
    .addIntegerOption((option) =>
      option
        .setName('id_warn')
        .setDescription('El número/índice del aviso que deseas remover')
        .setRequired(true)
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

    const warnId = ctx.options.getInteger('id_warn');
    if (warnId === undefined || warnId < 0) {
      return ctx.reply({ content: '❌ Debes ingresar un ID/índice válido mayor o igual a 0.', ephemeral: true });
    }

    const data = await warnSchema.findOne({ guildID: ctx.guildId, userID: targetUser.id });
    if (!data || !data.warnings || data.warnings.length === 0) {
      return ctx.reply({
        content: `❌ El usuario <@${targetUser.id}> no tiene ningún aviso registrado.`,
        ephemeral: true,
      });
    }

    if (data.warnings[warnId] === undefined) {
      return ctx.reply({
        content: `❌ No existe ningún aviso con el ID \`${warnId}\`. Usa \`/warnings\` para ver los avisos activos.`,
        ephemeral: true,
      });
    }

    data.warnings.splice(warnId, 1);
    await data.save();

    const embed = new EmbedBuilder()
      .setTitle('✅ Aviso Removido')
      .setDescription(
        `Se ha removido correctamente el aviso \`#${warnId}\` de <@${targetUser.id}>.\n` +
        `Avisos restantes: \`${data.warnings.length}\`\n` +
        `**Moderador:** <@${ctx.user.id}>`
      )
      .setColor('Green')
      .setTimestamp();

    return ctx.reply({ embeds: [embed] });
  },
};

export default command;
