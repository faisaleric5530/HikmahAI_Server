module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('CREATE EXTENSION IF NOT EXISTS vector;');

    await queryInterface.createTable('knowledge_chunk', {
      id: { allowNull: false, autoIncrement: true, primaryKey: true, type: Sequelize.INTEGER },
      source: { type: Sequelize.STRING(255), allowNull: false },
      author: { type: Sequelize.STRING(255) },
      section: { type: Sequelize.STRING(255) },
      discipline: { type: Sequelize.STRING(50) },
      chunk_text: { type: Sequelize.TEXT, allowNull: false },
      doc_hash: { type: Sequelize.STRING(64) },
      created_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      updated_at: { allowNull: false, type: Sequelize.DATE, defaultValue: Sequelize.NOW },
    });

    // pgvector has no Sequelize DataType, so the embedding column is added via raw SQL.
    await queryInterface.sequelize.query('ALTER TABLE knowledge_chunk ADD COLUMN embedding vector(384);');
    await queryInterface.sequelize.query(
      'CREATE INDEX knowledge_chunk_embedding_idx ON knowledge_chunk USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);'
    );
    await queryInterface.sequelize.query(
      "CREATE INDEX knowledge_chunk_text_fts_idx ON knowledge_chunk USING GIN (to_tsvector('english', chunk_text));"
    );
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('knowledge_chunk');
  },
};
