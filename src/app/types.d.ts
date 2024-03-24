export interface YoutubeProcessRequest {
  video: string;
  prompt: string;
  videoId: string | null;
  lang?: string;
}

export interface YoutubeCaption {
  text: string;
  start: string | number;
  dur: string | number;
  embedding?: number[];
}

export interface SearchResult extends YoutubeCaption {
  similarity: number;
  rawText: string;
}

export interface GetSubtitlesRequest {
  lang?: string;
  videoID: string | null;
}
