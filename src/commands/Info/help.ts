import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { SlashCommand, SlashContext } from '../../types';
import { commandsList } from '../index';

const command: SlashCommand = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('📖 Muestra la lista de comandos disponibles y su información')
    .addStringOption((option) =>
      option
        .setName('comando')
        .setDescription('Nombre del comando específico del que deseas ver detalles')
        .setRequired(false)
    ),
  category: 'Info',
  run: (ctx: SlashContext) => {
    const requestedCommand = ctx.options.getString('comando')?.toLowerCase();

    if (requestedCommand) {
      const target = commandsList.find((c) => c.data.name.toLowerCase() === requestedCommand);
      if (!target) {
        return ctx.reply({
          content: `❌ No se encontró ningún comando con el nombre \`${requestedCommand}\`.`,
          ephemeral: true,
        });
      }

      const json = target.data.toJSON();
      const embed = new EmbedBuilder()
        .setTitle(`Comando: /${json.name}`)
        .setDescription(json.description || 'Sin descripción.')
        .addFields({
          name: 'Categoría',
          value: target.category || 'General',
          inline: true,
        })
        .setColor(ctx.color as any)
        .setFooter({ text: 'ucbot · Vercel Serverless Edition' });

      return ctx.reply({ embeds: [embed] });
    }

    // Listar todos por categoría
    const categories: Record<string, string[]> = {};
    for (const cmd of commandsList) {
      const cat = cmd.category || 'General';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(`\`/${cmd.data.name}\``);
    }

    const embed = new EmbedBuilder()
      .setTitle('📚 Panel de Ayuda - Comandos del Bot')
      .setDescription(
        'Este bot opera mediante **Discord HTTP Interactions** en Vercel.\n' +
        'Usa `/help [comando]` para obtener información detallada sobre un comando específico.'
      )
      .setColor(ctx.color as any)
      .setFooter({ text: '© desarrollado por lukitaz_r' });

    for (const [category, cmds] of Object.entries(categories)) {
      embed.addFields({
        name: `📁 ${category}`,
        value: cmds.join(', '),
      });
    }

    return ctx.reply({ embeds: [embed] });
  },
};

export default command;
