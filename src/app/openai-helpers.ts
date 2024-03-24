import { OpenAI } from 'openai';

export function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  const dotProduct = vectorA.reduce((acc, val, i) => acc + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((acc, val) => acc + val ** 2, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((acc, val) => acc + val ** 2, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

export async function getEmbedding(text: string, model = 'text-embedding-ada-002'): Promise<number[]> {
  const response = await new OpenAI().embeddings.create({
    model: model,
    input: [text.replace(/\n/g, ' ')],
  });

  return response.data[0].embedding;
}

interface PunctuateAndCapitalizeInput {
  text: string;
  rawText?: string;
}

export async function addPunctuationAndCapitalization(inputObject: PunctuateAndCapitalizeInput) {
  const chatCompletion = await new OpenAI().chat.completions.create({
    messages: [
      {
        role: 'user',
        content: `I need the following text to be corrected for capitalization and punctuation: \n\n ${inputObject.text}`,
      },
    ],
    model: 'gpt-3.5-turbo',
  });

  inputObject.rawText = inputObject.text;
  inputObject.text = chatCompletion.choices[0].message.content!;

  return inputObject;
}
