'use server';

import { SearchResult, YoutubeProcessRequest } from './types';

import { addPunctuationAndCapitalization, cosineSimilarity, getEmbedding } from './openai-helpers';
import {
  addEmbeddingToCaption,
  mergeCaptions,
  chunkArray,
  formatSearchResult,
  downloadVideoCaptions,
} from './youtube-helpers';

async function searchItems(items: any[], query: string, top = 3): Promise<SearchResult[]> {
  const embedding = await getEmbedding(query);
  const results: SearchResult[] = items
    .map((item) => ({
      ...item,
      similarity: cosineSimilarity(item.embedding, embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, top);
  return results;
}

export async function processYoutubeLinkWithGPT({ video, prompt, videoId, lang }: YoutubeProcessRequest) {
  const captions = await downloadVideoCaptions(videoId, lang);
  const captionsWithEnlargedContext = chunkArray(captions, 20).map((captionChunks) =>
    captionChunks.reduce(mergeCaptions),
  );

  const captionsWithEmbeddings = await Promise.all(captionsWithEnlargedContext.map(addEmbeddingToCaption));
  const searchResults = await searchItems(captionsWithEmbeddings, prompt);
  const formattedResults = searchResults.map((result) => formatSearchResult(result, video));
  await Promise.all(formattedResults.map(addPunctuationAndCapitalization)); // FIXME: Array.map for side effect anti-pattern

  return formattedResults;
}
