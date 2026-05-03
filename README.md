# RAG CLI - Retrieval-Augmented Generation Command Line Interface

A Node.js CLI application that implements Retrieval-Augmented Generation (RAG) using Ollama for local embeddings, cosine similarity for semantic search, and Groq for intelligent query answering. This project allows you to search through a document by finding semantically similar text chunks and generating contextual answers using an LLM.

## Project Overview

This project demonstrates a complete RAG pipeline with LLM integration:

1. **Document Loading**: Reads text from a file (`notes.txt`)
2. **Chunking**: Splits the document into overlapping chunks for better context
3. **Embedding Generation**: Converts each chunk into a vector embedding using Ollama
4. **Query Processing**: Converts user queries into embeddings
5. **Similarity Matching**: Uses cosine similarity to find the most relevant chunks
6. **Context Retrieval**: Retrieves the top-K most similar chunks
7. **LLM Generation**: Uses Groq to generate intelligent, context-aware answers based on retrieved chunks

## Architecture

### Project Structure

```
src/
├── index.ts                 # Main entry point - orchestrates the RAG pipeline
├── handleInput.ts           # Processes user queries and generates embeddings
├── services/
│   └── grok.service.ts      # Groq LLM integration for answer generation
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

## Groq Integration

### What is Groq?

Groq is a cloud-based LLM API provider that offers fast, cost-effective access to advanced language models. In this project, Groq is used to generate intelligent, context-aware answers by processing the retrieved document chunks and the user's query.

### Why Groq?

- **Speed**: Groq's inference engine provides extremely fast response times
- **Cost-effective**: Competitive pricing for API calls
- **High-quality models**: Access to powerful LLM models like `openai/gpt-oss-20b`
- **Easy integration**: Simple REST API with SDK support
- **Stateless**: No need to manage model serving infrastructure

### Setup Instructions

1. **Get a Groq API Key**
   - Sign up at [console.groq.com](https://console.groq.com)
   - Navigate to API keys section and create a new key
   - Copy your API key

2. **Set Environment Variable**
   Create a `.env` file in the project root:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Install Dependencies**
   The `groq-sdk` is already in `package.json`, just run:
   ```bash
   npm install
   ```

### How Groq Integration Works

**File**: `src/services/grok.service.ts`

The Groq service provides LLM-powered answer generation:

#### `getGroqClient(): Groq`
- Initializes the Groq client lazily (only when needed)
- Uses the `GROQ_API_KEY` environment variable
- Returns a singleton instance to avoid multiple client initializations

#### `getGroqChatCompletion(prompt: string)`
- Sends the constructed prompt to Groq's API
- Uses the `openai/gpt-oss-20b` model
- The prompt includes:
  - The original user query
  - The top K most similar document chunks (context)
  - Instructions to answer based on the provided context

```typescript
// Example prompt structure:
const prompt = `
You are a helpful assistant. Use the following chunks of information 
to answer the question: How does retrieval work?

Chunk 1: Retrieval is the process of finding relevant information...
Chunk 2: Document retrieval systems use embeddings...
Chunk 3: Similarity metrics help identify related content...
`
```

### Response Handling

Groq returns a structured response containing:
- The generated answer text
- Model metadata
- Token usage information

The answer is extracted and displayed to the user:
```typescript
chatCompletion.choices[0]?.message?.content || ""
```

### The Complete RAG + LLM Flow

1. User provides a query (e.g., "How does retrieval work?")
2. Query is embedded using Ollama's `nomic-embed-text`
3. Cosine similarity finds top 3 most relevant chunks
4. Top chunks are combined into a context string
5. Groq LLM generates an answer using the context
6. Answer is returned to the user

This combination allows the system to provide answers grounded in the actual document content, while leveraging Groq's advanced language understanding capabilities.

### API Rate Limits and Quotas

- Groq provides different quotas based on your plan
- Check your usage in the [Groq Console](https://console.groq.com)
- Free tier includes generous rate limits for testing and development
- Consider implementing caching to reduce API calls for repeated queries

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
const topKchunks = topKIndices.map(index => chunks[index]).join("\n---\n")
```
- Sorts similarities in descending order
- Extracts the top 3 most similar chunks
- Combines them into a context string for the LLM

### Step 7: Generate Answer with Groq (`services/grok.service.ts`)
```typescript
const prompt = `You are a helpful assistant. Use the following chunks...`
main(prompt)
```
- Constructs a prompt with the query and retrieved chunks
- Sends to Groq API for intelligent answer generation
- Groq processes the context and generates a relevant, grounded response
- Results are displayed to the user

## Installation & Usage

### Prerequisites
- Node.js (v18+)
- TypeScript
- Ollama installed and running
- Groq API key (get it free from [console.groq.com](https://console.groq.com))

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

1. **Set up Groq API Key**
   ```bash
   echo 'GROQ_API_KEY=your_api_key_here' > .env
   ```

2. Make sure Ollama is running:
   ```bash
   brew services start ollama
   ```

3. Ensure the `nomic-embed-text` model is available:
   ```bash
   ollama pull nomic-embed-text
   ```

4. Place your document in `notes.txt`

5. Install dependencies:
   ```bash
   npm install
   ```

6. Run the application:
   ```bash
   npm start
   ```

7. View the generated answer based on your document and query

## Key Technologies

- **TypeScript**: Type-safe JavaScript for better code quality
- **Ollama**: Local embedding generation
- **nomic-embed-text**: Efficient 768-dimensional embedding model
- **Groq**: Fast LLM API for intelligent answer generation
- **Cosine Similarity**: Vector comparison algorithm
- **Node.js**: Runtime environment

## Performance Notes

- Embedding generation is parallelized for faster processing
- Cosine similarity calculation is O(n) where n is the number of chunks
- Memory usage depends on document size and number of chunks
- Local Ollama eliminates API latency and external dependencies

## Future Enhancements

- Support for different embedding models
- Support for different Groq models (e.g., mixtral-8x7b)
- Batch processing for large documents
- Caching of embeddings to avoid recomputation
- Caching of Groq API responses for repeated queries
- Interactive CLI for multiple queries in one session
- Support for multiple document formats (PDF, DOCX, etc.)
- Fine-tuning embeddings for domain-specific use cases
- Streaming responses from Groq for faster user feedback
- Evaluation metrics for answer quality
