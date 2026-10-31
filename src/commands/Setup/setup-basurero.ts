import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
} from 'discord.js';
import { SlashCommand, SlashContext } from '../../types';
import setupSchema from '../../models/setups';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('setup-basurero')
    .setDescription('🗑️ Configura el canal basurero (honeypot) para detectar y sancionar cuentas hackeadas')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption((option) =>
      option
        .setName('canal')
        .setDescription('El canal de texto que actuará como basurero / trampa')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName('desactivar')
        .setDescription('Desactiva el sistema de canal basurero')
        .setRequired(false)
    ),
  category: 'Setup',
  permissions: [PermissionFlagsBits.Administrator],
  run: async (ctx: SlashContext) => {
    if (!ctx.guildId) {
      return ctx.reply({ content: '❌ Este comando solo puede usarse en un servidor.', ephemeral: true });
    }

    const desactivar = ctx.options.getBoolean('desactivar');
    const canal = ctx.options.getChannel('canal');

    if (desactivar) {
      await setupSchema.findOneAndUpdate(
        { guildID: ctx.guildId },
        { basurero: '' },
        { upsert: true }
      );

      const embed = new EmbedBuilder()
        .setTitle('✅ Canal basurero desactivado')
        .setDescription('El sistema de canal basurero ha sido deshabilitado correctamente.')
        .setColor('Red');

      return ctx.reply({ embeds: [embed] });
    }

    if (!canal) {
      const data = await setupSchema.findOne({ guildID: ctx.guildId });
      const actual = data?.basurero ? `<#${data.basurero}>` : '*Ninguno configurado*';

      const embed = new EmbedBuilder()
        .setTitle('🗑️ Configuración del Canal Basurero')
        .setDescription(
          `Canal configurado actualmente: ${actual}\n\n` +
          'Para establecer un nuevo canal, selecciona uno en el parámetro `canal` o usa `desactivar: true`.'
        )
        .setColor(ctx.color as any);

      return ctx.reply({ embeds: [embed], ephemeral: true });
    }

    await setupSchema.findOneAndUpdate(
      { guildID: ctx.guildId },
      { basurero: canal.id },
      { upsert: true }
    );

    const embed = new EmbedBuilder()
      .setTitle('🗑️ Canal Basurero Configurado')
      .setDescription(
        `Se ha establecido el canal <#${canal.id}> como basurero / honeypot.\n\n` +
        '⚠️ **Aviso:** El sistema ahora está registrado para este servidor.'
      )
      .setColor('Green');

    return ctx.reply({ embeds: [embed] });
  },
};

export default command;
