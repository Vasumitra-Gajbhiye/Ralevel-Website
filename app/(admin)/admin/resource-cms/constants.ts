export const RESOURCE_BOARD_OPTIONS = [
  "CAIE",
  "Edexcel",
  "AQA",
  "WJEC/Eduqas",
] as const;

export const MAX_NOTES_TAGS = 4;
export const MAX_TOOL_DESCRIPTION_LENGTH = 200;
export const MAX_PLAYLIST_DESCRIPTION_LENGTH = 200;

export const PLAYLIST_TYPE_OPTIONS = ["playlist", "video"] as const;

export const MAX_THUMBNAIL_SIZE_BYTES = 5 * 1024 * 1024;

export const THUMBNAIL_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const THUMBNAIL_ACCEPT = THUMBNAIL_MIME_TYPES.join(",");

export const THUMBNAIL_SECTIONS = [
  "books",
  "youtubeChannel",
  "youtubePlaylist",
] as const;

export const THUMBNAIL_DEFAULT_PATHS = {
  books: "/books_thumb/default.png",
  youtubeChannel: "/youtube_thumb/default.jpg",
  youtubePlaylist: "/playlist_thumb/fallback.png",
} as const;

export const THUMBNAIL_FIELD_KEYS = {
  books: "cover",
  youtubeChannel: "thumbnail",
  youtubePlaylist: "thumbnail",
} as const;
