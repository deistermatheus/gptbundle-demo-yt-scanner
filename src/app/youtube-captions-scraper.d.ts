import { GetSubtitlesRequest, YoutubeCaption } from './src/app/examples/generation/parse-youtube/types';

declare module 'youtube-captions-scraper' {
  export function getSubtitles(input: GetSubtitlesRequest): YoutubeCaption[];
}
