# RAG CLI - Retrieval-Augmented Generation Command Line Interface

A Node.js CLI application that implements Retrieval-Augmented Generation (RAG) using Ollama for local embeddings and cosine similarity for semantic search. This project allows you to search through a document by finding semantically similar text chunks based on natural language queries.

## Project Overview

This project demonstrates a complete RAG pipeline:

1. **Document Loading**: Reads text from a file (`notes.txt`)
2. **Chunking**: Splits the document into overlapping chunks for better context
3. **Embedding Generation**: Converts each chunk into a vector embedding using Ollama
4. **Query Processing**: Converts user queries into embeddings
5. **Similarity Matching**: Uses cosine similarity to find the most relevant chunks
6. **Results**: Returns the top-K most similar chunks to the query

## Architecture

### Project Structure

```
src/
├── index.ts                 # Main entry point - orchestrates the RAG pipeline
├── handleInput.ts           # Processes user queries and generates embeddings
└── utils/
    ├── readFile.utils.ts    # Reads text files from disk
    ├── chunks.utils.ts      # Splits documents into chunks
    ├── embeddings.utils.ts  # Generates embeddings using Ollama
    └── cosineSimilarity.utils.ts  # Calculates semantic similarity
```

## Ollama Integration

### What is Ollama?

Ollama is a lightweight framework for running large language models locally. In this project, it's used to generate text embeddings (vector representations of text) without relying on external APIs.

### Setup Instructions

1. **Install Ollama**
   ```bash
   brew install ollama
   ```

2. **Start Ollama Service**
   ```bash
   brew services start ollama
   ```
   This starts Ollama running at `http://localhost:11434`

3. **Pull the Embedding Model**
   ```bash
   ollama pull nomic-embed-text
   ```
   The `nomic-embed-text` model is a lightweight, efficient embedding model that converts text into 768-dimensional vectors.

### How Embeddings Work in This Project

**File**: `src/utils/embeddings.utils.ts`

The embedding generation has two main functions:

#### `generateOneEmbedding(text: string): Promise<number[]>`
- Sends a POST request to `http://localhost:11434/api/embeddings`
- Sends the text to the `nomic-embed-text` model
- Returns a vector of numbers (768 dimensions) representing the semantic meaning of the text
- Used for individual chunks and user queries

```typescript
// Example: "The quick brown fox" becomes [0.123, -0.456, 0.789, ...]
```

#### `generateEmbeddings(chunks: string[]): Promise<number[][]>`
- Takes an array of text chunks
- Generates embeddings for all chunks in parallel using `Promise.all()`
- Returns a 2D array where each row is an embedding vector
- More efficient than sequential generation

### API Endpoint Details

**POST** `http://localhost:11434/api/embeddings`

**Request Body**:
```json
{
  "model": "nomic-embed-text",
  "prompt": "Your text here"
}
```

**Response**:
```json
{
  "embedding": [0.123, -0.456, 0.789, ...]
}
```

## How the RAG Pipeline Works

### Step 1: Document Reading (`readFile.utils.ts`)
```typescript
const fileContents = FileReader.readTxtFile('notes.txt')
```
Reads the entire text file into memory as a string.

### Step 2: Chunking (`chunks.utils.ts`)
```typescript
const chunks = createChunks(fileContents)
```
- Splits document by periods (`. `)
- Groups consecutive sentences into chunks (3 sentences per chunk)
- Helps maintain context while keeping chunks manageable
- Returns an array of text chunks

### Step 3: Generate Embeddings (`embeddings.utils.ts`)
```typescript
const embeddings = await generateEmbeddings(chunks)
```
- Converts each chunk into a 768-dimensional vector
- Uses Ollama's `nomic-embed-text` model
- Runs in parallel for efficiency
- Creates a semantic representation of each chunk's meaning

### Step 4: Process Query (`handleInput.ts`)
```typescript
const query = "How does retrieval work?"
const queryEmbedding = await handleInput(query)
```
- Takes the user's natural language question
- Generates its embedding using the same model for consistency
- Both chunks and queries are embedded in the same vector space

### Step 5: Calculate Similarity (`cosineSimilarity.utils.ts`)
```typescript
const similarities = embeddings.map(embedding => 
  cosineSimilarity(queryEmbedding, embedding)
)
```
- Computes cosine similarity between query and each chunk embedding
- Returns values between -1 and 1 (higher = more similar)
- Formula: `similarity = (A · B) / (||A|| × ||B||)`

### Step 6: Retrieve Top Results
```typescript
const topK = 3
const topKIndices = similarities
  .map((similarity, index) => ({ similarity, index }))
  .sort((a, b) => b.similarity - a.similarity)
  .slice(0, topK)
```
- Sorts similarities in descending order
- Extracts the top 3 most similar chunks
- Returns the original text along with similarity scores

## Installation & Usage

### Prerequisites
- Node.js (v18+)
- TypeScript
- Ollama installed and running

### Install Dependencies
```bash
npm install
```

### Run the Application
```bash
npm start
```

This command:
1. Compiles TypeScript to JavaScript (`tsc`)
2. Runs the compiled JavaScript (`node dist/index.js`)

### Example Workflow

1. Make sure Ollama is running:
   ```bash
   brew services start ollama
   ```

2. Ensure the `nomic-embed-text` model is available:
   ```bash
   ollama pull nomic-embed-text
   ```

3. Place your document in `notes.txt`

4. Run the application:
   ```bash
   npm start
   ```

5. View the top 3 most semantically similar chunks to your query

## Key Technologies

- **TypeScript**: Type-safe JavaScript for better code quality
- **Ollama**: Local embedding generation
- **nomic-embed-text**: Efficient 768-dimensional embedding model
- **Cosine Similarity**: Vector comparison algorithm
- **Node.js**: Runtime environment

## Performance Notes

- Embedding generation is parallelized for faster processing
- Cosine similarity calculation is O(n) where n is the number of chunks
- Memory usage depends on document size and number of chunks
- Local Ollama eliminates API latency and external dependencies

## Future Enhancements

- Support for different embedding models
- Batch processing for large documents
- Caching of embeddings to avoid recomputation
- Interactive CLI for multiple queries
- Support for multiple document formats (PDF, DOCX, etc.)
- Fine-tuning embeddings for domain-specific use cases
