import dotenv from 'dotenv'
dotenv.config()
import FileReader from "./utils/readFile.utils.js"
import createChunks from "./utils/chunks.utils.js"
import generateEmbeddings from "./utils/embeddings.utils.js"
import handleInput from "./handleInput.js"
import cosineSimilarity from "./utils/cosineSimilarity.utils.js"
import { main } from './services/grok.service.js'


const fileContents = FileReader.readTxtFile('notes.txt')

const chunks  =  createChunks(fileContents)

const embeddings = await generateEmbeddings(chunks)

const query = "How does retrieval work?"

const queryEmbedding = await handleInput(query)

const similarities = embeddings.map(embedding => cosineSimilarity(queryEmbedding, embedding))

const topK = 3
const topKIndices = similarities
    .map((similarity, index) => ({ similarity, index }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
    .map(item => item.index)

const topKchunks = topKIndices.map(index => chunks[index]).join("\n---\n")

const prompt = `You are a helpful assistant. Use the following chunks of information to answer the question: ${query}\n\n${topKchunks}` 

main(prompt)









