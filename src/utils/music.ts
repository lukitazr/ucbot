import { EmbedBuilder, Message, ChatInputCommandInteraction, VoiceChannel } from 'discord.js';
import { ExtendedClient, EmbedConfig } from '../types';


/**
 * Verifica que el usuario esté en un canal de voz.
 * Si no, envía el mensaje de error y devuelve null.
 */
export function ensureVoice(message: Message | ChatInputCommandInteraction): VoiceChannel | null {
  if (!message) return null;
  // Both Message and ChatInputCommandInteraction have a member property
  const member = message.member;

  // Check if member is a GuildMember (not APIInteractionGuildMember)
  if (!member || !('voice' in member)) {
    message.reply({ content: '❌ ¡Necesitas estar en un canal de voz primero! ❌', ephemeral: true });
    return null;
  }

  const vc = member.voice.channel;

  if (!vc) {
    message.reply({ content: '❌ ¡Necesitas estar en un canal de voz primero! ❌', ephemeral: true });
    return null;
  }

  return vc as VoiceChannel;
}

/**
 * Crea o devuelve el player de LavaLink.
 */
export function createPlayer(
  client: ExtendedClient,
  guildId: string,
  voiceChannelId: string,
  textChannelId: string
) {
  const player = client.manager.players.create({
    guildId,
    voiceChannelId,
    textChannelId,
  });

  if (!player) {
    throw new Error('Failed to create music player');
  }

  player.connect({ setDeaf: true });
  return player;
}

/**
 * Realiza la búsqueda en YouTube Music.
 */
export async function searchMusic(client: ExtendedClient, query: string, requesterId: string) {
  // Si es un link de Spotify, resolver primero y luego buscar en Deezer
  if (query.includes("spotify.com")) {
    // Primero resolver el link de Spotify para obtener metadata
    const spotifyResult = await client.manager.search({
      query: query,
      requester: requesterId
    });

    // Si encontramos tracks, usar title y author para buscar en Deezer
    if (spotifyResult.tracks && spotifyResult.tracks.length > 0) {
      const track = spotifyResult.tracks[0];
      const searchQuery = `${track.title} ${track.author}`;

      // Buscar en Deezer con el título y autor
      const deezerResult = await client.manager.search({
        query: searchQuery,
        requester: requesterId,
        source: "dzsearch"
      });

      // Si Deezer encuentra resultados, usarlos
      if (deezerResult.tracks && deezerResult.tracks.length > 0) {
        return deezerResult;
      }
    }

    // Si no funciona, devolver el resultado original de Spotify
    return spotifyResult;
  }

  // Links de Deezer se pasan directamente
  if (query.includes("deezer.com")) {
    return client.manager.search({
      query: query,
      requester: requesterId
    });
  }

  // Si es un link de YouTube Music, convertir a link normal de YouTube
  if (query.includes("music.youtube.com")) {
    // Extraer el video ID del link de YouTube Music
    const videoIdMatch = query.match(/[?&]v=([^&]+)/);
    if (videoIdMatch) {
      const videoId = videoIdMatch[1];
      // Convertir a link normal de YouTube
      query = `https://www.youtube.com/watch?v=${videoId}`;
    }
  }

  // Si es un link de YouTube, resolver primero y luego buscar en Deezer
  if (query.includes("youtube.com") || query.includes("youtu.be")) {
    // Workaround: agregar parámetro list si no existe (evita detección anti-bot)
    if (!query.includes("list=") && query.includes("watch?v=")) {
      query = query + "&list=RD" + query.match(/v=([^&]+)/)?.[1];
    }

    // Primero intentar resolver el link de YouTube para obtener metadata
    const youtubeResult = await client.manager.search({
      query: query,
      requester: requesterId
    });

    // Si encontramos tracks, usar title y author para buscar en Deezer
    if (youtubeResult.tracks && youtubeResult.tracks.length > 0) {
      const track = youtubeResult.tracks[0];
      const searchQuery = `${track.title} ${track.author}`;

      // Buscar en Deezer con el título y autor
      const deezerResult = await client.manager.search({
        query: searchQuery,
        requester: requesterId,
        source: "dzsearch"
      });

      // Si Deezer encuentra resultados, usarlos
      if (deezerResult.tracks && deezerResult.tracks.length > 0) {
        return deezerResult;
      }
    }

    // Si no funciona, devolver el resultado original de YouTube
    return youtubeResult;
  }

  // Otros URLs se pasan directamente
  if (query.startsWith("http")) {
    return client.manager.search({
      query: query,
      requester: requesterId
    });
  }

  // Búsquedas de texto usan dzsearch para buscar en Deezer
  return client.manager.search({
    query: query,
    requester: requesterId,
    source: "dzsearch"
  });
}

/**
 * Añade toda la playlist a la cola y envía embed de confirmación.
 */
export async function enqueuePlaylist(
  player: any,
  searchResult: any,
  message: Message | false = false,
  interaction: ChatInputCommandInteraction | false = false
): Promise<void> {
  const { tracks, playlistInfo } = searchResult;
  player.queue.add(tracks);

  if (message) {
    await message.reply({
      embeds: [
        buildEmbed({
          title: '✅ Playlist añadida',
          description: `**${playlistInfo.name}** (${tracks.length} temas) en la cola.\n> Solicitada por <@${tracks[0].requestedBy.id}>`,
          thumbnail: tracks[0].artworkUrl,
        }),
      ],
    });
    return;
  }

  if (interaction) {
    await interaction.deferReply();
    await interaction.editReply({
      embeds: [
        buildEmbed({
          author: 'La Última Radio',
          title: '✅ Playlist añadida',
          description: `**${playlistInfo.name}** (${tracks.length} temas) en la cola.\n> Solicitada por <@${tracks[0].requestedBy.id}>`,
          thumbnail: tracks[0].artworkUrl,
        }),
      ],
    });
  }
}

/**
 * Añade un único track a la cola y envía embed de confirmación.
 */
export async function enqueueTrack(
  player: any,
  track: any,
  message: Message | false = false,
  interaction: ChatInputCommandInteraction | false = false
): Promise<void> {
  player.queue.add(track);

  if (message) {
    await message.reply({
      embeds: [
        buildEmbed({
          author: 'La Última Radio',
          title: '✅ Canción añadida',
          description: `[${track.title}](${track.url}) — ${track.author}\n> Solicitada por <@${track.requestedBy.id}>`,
          thumbnail: track.artworkUrl,
        }),
      ],
    });
    return;
  }

  if (interaction) {
    await interaction.deferReply();
    await interaction.editReply({
      embeds: [
        buildEmbed({
          author: 'La Última Radio',
          title: '✅ Canción añadida',
          description: `[${track.title}](${track.url}) — ${track.author}\n> Solicitada por <@${track.requestedBy.id}>`,
          thumbnail: track.artworkUrl,
        }),
      ],
    });
  }
}

/**
 * Construye un EmbedBuilder a partir de un objeto de configuración.
 */
export function buildEmbed({ author, title, description, thumbnail, color = 'Yellow' }: EmbedConfig): EmbedBuilder {
  const e = new EmbedBuilder();
  if (author) e.setAuthor({ name: author });
  if (title) e.setTitle(title);
  if (description) e.setDescription(description);
  if (thumbnail) e.setThumbnail(thumbnail);
  e.setColor(color as any);
  return e;
}

export const formatDuration = (ms: number): string => {
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  return `${hours ? `${hours}:` : ''}${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
