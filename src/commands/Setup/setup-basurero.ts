import {
  EmbedBuilder,
  Message,
  ChannelType,
  GuildChannel,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import setupSchema from '../../models/setups';
import { Command, ExtendedClient } from '../../types';

const command: Command = {
  name: 'setup-basurero',
  aliases: ['setupbasurero', 'basurero-setup', 'basurero', 'setuphoneypot', 'honeypot'],
  desc: 'Configura un canal basurero (honeypot) donde al enviar un mensaje se purgan los mensajes recientes y se banea al usuario por cuenta hackeada',
  permisos: ['Administrator'],
  permisos_bot: ['BanMembers', 'ManageMessages'],
  slashBuilder: new SlashCommandBuilder()
    .setName('setup-basurero')
    .setDescription('Configura el canal basurero (honeypot) para detectar cuentas hackeadas')
    .addChannelOption((option) =>
      option
        .setName('canal')
        .setDescription('El canal que servirá como basurero / trampa')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(false)
    )
    .addBooleanOption((option) =>
      option
        .setName('desactivar')
        .setDescription('Desactiva el sistema de canal basurero en este servidor')
        .setRequired(false)
    ),
  run: async (
    client: ExtendedClient,
    message: Message | null,
    args: string[],
    prefix: string,
    interaction: ChatInputCommandInteraction | null
  ) => {
    const guild = message?.guild || interaction?.guild;
    if (!guild) return;

    // Manejo de Slash Command
    if (interaction) {
      const desactivar = interaction.options.getBoolean('desactivar');
      const canalSeleccionado = interaction.options.getChannel('canal');

      if (desactivar) {
        await setupSchema.findOneAndUpdate(
          { guildID: guild.id },
          { basurero: '' },
          { upsert: true }
        );

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('✅ Canal basurero desactivado')
              .setDescription('El sistema de canal basurero ha sido deshabilitado correctamente.')
              .setColor('Red'),
          ],
        });
        return;
      }

      if (!canalSeleccionado) {
        const setupData = await setupSchema.findOne({ guildID: guild.id });
        const canalActual = setupData?.basurero ? `<#${setupData.basurero}>` : '*Ninguno*';

        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle('🗑️ Configuración del Canal Basurero')
              .setDescription(
                `Canal configurado actualmente: ${canalActual}\n\n` +
                'Para establecer uno nuevo, selecciona un canal en las opciones o usa `desactivar: true`.'
              )
              .setColor((client as any).color || '#ffc600'),
          ],
          ephemeral: true,
        });
        return;
      }

      if (canalSeleccionado.type !== ChannelType.GuildText) {
        await interaction.reply({
          content: '❌ **El canal seleccionado debe ser un canal de texto!**',
          ephemeral: true,
        });
        return;
      }

      await setupSchema.findOneAndUpdate(
        { guildID: guild.id },
        { basurero: canalSeleccionado.id },
        { upsert: true }
      );

      await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`✅ Canal basurero configurado en #${canalSeleccionado.name}`)
            .setDescription(
              `*Se ha activado el sistema de seguridad en <#${canalSeleccionado.id}>.*\n\n` +
              '**Comportamiento:** Si un usuario envía cualquier mensaje en este canal:\n' +
              '• ⏳ Esperará **5 segundos**.\n' +
              '• 🧹 Borrará **todos los mensajes** que haya enviado en el servidor en los últimos **10 minutos**.\n' +
              '• 🔨 Será **baneado permanentemente** con el motivo: `Cuenta hackeada`.'
            )
            .setColor((client as any).color || 'Green'),
        ],
      });
      return;
    }

    // Manejo de mensaje con prefijo
    if (!message) return;

    let targetChannel: GuildChannel | null = null;
    let isDisable = false;

    if (args.length > 0) {
      const firstArg = args[0].toLowerCase();
      if (['desactivar', 'disable', 'off', 'eliminar', 'remove'].includes(firstArg)) {
        isDisable = true;
      } else {
        targetChannel = (guild.channels.cache.get(args[0]) ||
          message.mentions.channels.filter((c) => (c as GuildChannel).guild.id === guild.id).first()) as GuildChannel | null;
      }
    } else {
      const promptMsg = await message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('🗑️ Configuración del Canal Basurero')
            .setDescription(
              'Por favor, **menciona el canal** que deseas usar como basurero (o escribe su **ID**).\n' +
              'Para deshabilitarlo escribe `desactivar`.'
            )
            .setFooter({ text: 'Tienes 30 segundos para responder' })
            .setColor((client as any).color || '#ffc600'),
        ],
      });

      try {
        const collected = await promptMsg.channel.awaitMessages({
          filter: (m) => m.author.id === message.author.id,
          max: 1,
          time: 30000,
          errors: ['time'],
        });

        const resp = collected.first();
        if (resp) {
          const input = resp.content.trim().toLowerCase();
          if (['desactivar', 'disable', 'off', 'eliminar', 'remove'].includes(input)) {
            isDisable = true;
          } else {
            targetChannel = (guild.channels.cache.get(resp.content.trim()) ||
              resp.mentions.channels.filter((c) => (c as GuildChannel).guild.id === guild.id).first()) as GuildChannel | null;
          }
        }
      } catch {
        await message.reply('❌ **El tiempo ha expirado! Vuelve a ejecutar el comando.**');
        return;
      }
    }

    if (isDisable) {
      await setupSchema.findOneAndUpdate(
        { guildID: guild.id },
        { basurero: '' },
        { upsert: true }
      );

      await message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('✅ Canal basurero desactivado')
            .setDescription('El sistema de canal basurero ha sido deshabilitado correctamente.')
            .setColor('Red'),
        ],
      });
      return;
    }

    if (!targetChannel || targetChannel.type !== ChannelType.GuildText) {
      await message.reply(
        '❌ **El canal especificado no existe o no es un canal de texto!**\n' +
        `Uso: \`${prefix}setup-basurero #canal\` o \`${prefix}setup-basurero desactivar\``
      );
      return;
    }

    await setupSchema.findOneAndUpdate(
      { guildID: guild.id },
      { basurero: targetChannel.id },
      { upsert: true }
    );

    await message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`✅ Canal basurero configurado en #${targetChannel.name}`)
          .setDescription(
            `*Se ha activado el sistema de seguridad en <#${targetChannel.id}>.*\n\n` +
            '**Comportamiento:** Si un usuario envía un mensaje en este canal:\n' +
            '• ⏳ Esperará **5 segundos**.\n' +
            '• 🧹 Borrará **todos sus mensajes** enviados al servidor (todos los canales) en los últimos **10 minutos**.\n' +
            '• 🔨 Será **baneado permanentemente** con el motivo: `Cuenta hackeada`.'
          )
          .setColor((client as any).color || 'Green'),
      ],
    });
  },
};

export default command;