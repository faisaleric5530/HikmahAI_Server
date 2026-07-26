const db = require('../../database');

const EMBEDDING_MODEL = 'Xenova/bge-small-en-v1.5';

// @xenova/transformers ships ESM-only — dynamic import() from this CommonJS
// file is the supported way to consume it without converting the whole project.
let _embedderPromise = null;
const getEmbedder = () => {
  if (!_embedderPromise) {
    _embedderPromise = import('@xenova/transformers').then(({ pipeline }) =>
      pipeline('feature-extraction', EMBEDDING_MODEL)
    );
  }
  return _embedderPromise;
};

const embed = async (text) => {
  const embedder = await getEmbedder();
  const output = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data);
};

// Hybrid search: 0.7 x vector cosine similarity + 0.3 x full-text rank.
const retrieve = async (query, topK = 3) => {
  const vector = await embed(query);
  const vectorLiteral = `[${vector.join(',')}]`;

  const results = await db.sequelize.query(
    `
    SELECT
      chunk_text,
      source,
      author,
      section,
      discipline,
      1 - (embedding <=> :vec::vector) AS vector_score,
      ts_rank(to_tsvector('english', chunk_text), plainto_tsquery('english', :query)) AS text_score
    FROM knowledge_chunk
    ORDER BY
      (0.7 * (1 - (embedding <=> :vec::vector)))
      + (0.3 * ts_rank(to_tsvector('english', chunk_text), plainto_tsquery('english', :query))) DESC
    LIMIT :topK
    `,
    {
      replacements: { vec: vectorLiteral, query, topK },
      type: db.Sequelize.QueryTypes.SELECT,
    }
  );

  return results;
};

module.exports = { retrieve, embed };
