import { SearchResult, YoutubeCaption, GetSubtitlesRequest } from './types';

import { getEmbedding } from './openai-helpers';

import { getSubtitles } from 'youtube-captions-scraper';

export function mergeCaptions(mergedCaption: Partial<YoutubeCaption> = {}, caption: YoutubeCaption): YoutubeCaption {
  if (!mergedCaption) {
    mergedCaption = caption;
  }

  if (!mergedCaption.start) {
    mergedCaption.start = caption.start;
  }

  if (!mergedCaption.dur) {
    mergedCaption.dur = Number(caption.dur);
  } else {
    mergedCaption.dur = Number(caption.dur) + Number(mergedCaption.dur);
  }

  if (!mergedCaption.text) {
    mergedCaption.text = caption.text as string;
  } else {
    mergedCaption.text = mergedCaption.text + ' ' + caption.text;
  }

  return mergedCaption as YoutubeCaption;
}

export function formatSearchResult(result: SearchResult, video: string) {
  const { embedding, ...rest } = result;
  const start = Math.round(Number(result.start));
  return {
    ...rest,
    start,
    link: video + `&t=${start}`,
  };
}

export async function addEmbeddingToCaption(caption: YoutubeCaption) {
  const embedding = await getEmbedding(caption.text);

  return {
    ...caption,
    embedding,
  };
}

export function chunkArray(array: any[], chunkSize = 1) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function downloadVideoCaptions(videoId: string | null, lang = 'en') {
  return await getSubtitles({
    videoID: videoId,
    lang,
  });
}
