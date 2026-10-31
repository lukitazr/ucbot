import { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } from 'discord.js';
import { SlashCommand, SlashContext } from '../../types';
import warnSchema from '../../models/warns';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('⚠️ Envía un aviso (warning) a un usuario del servidor')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption((option) =>
      option
        .setName('usuario')
        .setDescription('El usuario al que deseas avisar')
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName('razon')
        .setDescription('La razón del aviso')
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
      return ctx.reply({ content: '❌ No puedes avisarte a ti mismo.', ephemeral: true });
    }

    const razon = ctx.options.getString('razon') || 'No se ha especificado ninguna razón.';

    const nuevoWarn = {
      fecha: Date.now(),
      autor: ctx.user.id,
      razon,
    };

    const doc = await warnSchema.findOneAndUpdate(
      { guildID: ctx.guildId, userID: targetUser.id },
      { $push: { warnings: nuevoWarn } },
      { upsert: true, new: true }
    );

    const totalWarns = doc?.warnings?.length || 1;

    const embed = new EmbedBuilder()
      .setTitle('⚠️ Usuario Avisado')
      .setDescription(
        `**Usuario:** <@${targetUser.id}> (\`${targetUser.id}\`)\n` +
        `**Razón:** \`\`\`yml\n${razon}\`\`\`\n` +
        `**Total de advertencias:** \`${totalWarns}\`\n` +
        `**Moderador:** <@${ctx.user.id}>`
      )
      .setColor('Yellow')
      .setTimestamp();

    return ctx.reply({ embeds: [embed] });
  },
};

export default command;
