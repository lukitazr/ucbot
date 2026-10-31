import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { SlashCommand, SlashContext } from '../../types';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('❓ ¡Vea la latencia y estado del Bot en Vercel!'),
  category: 'Info',
  run: (ctx: SlashContext) => {
    const latency = Date.now() - ctx.receivedAt;

    const embed = new EmbedBuilder()
      .setTitle('🏓 ¡Pong!')
      .setDescription(
        `⚡ **Modo:** Vercel Serverless (HTTP Interactions)\n` +
        `⏱️ **Tiempo de respuesta:** \`${latency}ms\`\n` +
        `🌐 **WebSockets:** Deshabilitados (0 Gateway / 0 Intents)`
      )
      .setColor(ctx.color as any)
      .setTimestamp();

    return ctx.reply({ embeds: [embed] });
  },
};

export default command;
