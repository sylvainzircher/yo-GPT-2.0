// ./lib/fasttext-embeddings.js
import fs from "fs";
import path from "path";
import { createInterface } from "readline";

const embeddingMap = new Map();
const VECTOR_DIM = 300;
const MAX_WORDS = 100_000; // Load only top 100,000 words

async function loadFastTextEmbeddings(filePath) {
  const rl = createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity,
  });

  let count = 0;

  for await (const line of rl) {
    // First line in .vec files often contains metadata — skip if needed
    if (count === 0 && line.match(/^\d+\s+\d+$/)) {
      count++;
      continue;
    }

    if (count++ > MAX_WORDS) break;

    const parts = line.trim().split(" ");
    const word = parts[0];
    const vector = parts.slice(1).map(Number);

    if (vector.length === VECTOR_DIM) {
      embeddingMap.set(word.toLowerCase(), vector);
    }
  }

  console.log(`✅ Loaded ${embeddingMap.size} FastText vectors.`);
}

function getWordVector(word) {
  return embeddingMap.get(word.toLowerCase()) || null;
}

function averageVectors(words) {
  const vectors = words.map(getWordVector).filter(Boolean);

  if (vectors.length === 0) return Array(VECTOR_DIM).fill(0);

  const sum = vectors[0].map((_, i) =>
    vectors.reduce((acc, v) => acc + v[i], 0)
  );

  return sum.map((val) => val / vectors.length);
}

export class FastTextEmbeddings {
  constructor() {
    if (embeddingMap.size === 0) {
      const filePath = path.join(
        process.cwd(),
        "embeddings",
        "crawl-300d-2M.vec"
      );
      console.log("⏳ Loading FastText vectors...");
      this.loaded = loadFastTextEmbeddings(filePath);
    }
  }

  async embedQuery(text) {
    await this.loaded;
    const words = text.split(/\s+/);
    return averageVectors(words);
  }

  async embedDocuments(docs) {
    await this.loaded;
    return docs.map((doc) => {
      const words = doc.split(/\s+/);
      return averageVectors(words);
    });
  }
}
