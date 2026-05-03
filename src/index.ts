import FileReader from "./utils/readFile.utils.js"
import createChunks from "./utils/chunks.utils.js"
import generateEmbeddings from "./utils/embeddings.utils.js"
import handleInput from "./handleInput.js"
import cosineSimilarity from "./utils/cosineSimilarity.utils.js"

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

console.log("Top K similar chunks:")
topKIndices.forEach(index => {
    console.log(`Chunk: ${chunks[index]}, Similarity: ${similarities[index]}`)
})









