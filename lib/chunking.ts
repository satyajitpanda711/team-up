// lib/chunking.ts

export function chunkText(
  text: string,
  chunkSize = 1200,
  overlap = 200
) {
  if (!text) return [];

  const chunks: string[] = [];

  let start = 0;

  while (start < text.length) {
    const end = start + chunkSize;

    chunks.push(
      text.slice(start, end)
    );

    start += chunkSize - overlap;
  }

  return chunks;
}