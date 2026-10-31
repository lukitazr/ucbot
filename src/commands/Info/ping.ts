import { SlashCommandBuilder, Message, ChatInputCommandInteraction } from 'discord.js';
import { ExtendedClient, Command } from '../../types';

const command: Command = {
  name: 'ping',
  aliases: ['latencia', 'ms'],
  desc: 'Sirve para ver la latencia del Bot',
  slashBuilder: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('❓¡Vea la latencia del Bot!'),
  /**
   * Ejecuta el comando ping.
   * @param client Instancia del cliente de Discord
   * @param message Mensaje que invocó el comando
   * @param _args Argumentos del comando
   * @param _prefix Prefijo utilizado
   * @param interaction Interacción de slash command
   */
  async run(
    client: ExtendedClient,
    message: Message | null,
    _args: string[],
    _prefix: string,
    interaction: ChatInputCommandInteraction | null,
  ): Promise<void> {
    const latency = Math.round(client.ws.ping);
    if (interaction) await interaction.reply(`Pong! El ping del Bot es de \`${latency}ms\``);
    if (message) await message.reply(`Pong! El ping del Bot es de \`${latency}ms\``);
  },
};

export default command;
