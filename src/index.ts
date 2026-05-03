import FileReader from "./utils/readFile.utils.js"
import createChunks from "./utils/chunks.utils.js"
import generateEmbeddings from "./utils/embeddings.utils.js"

const fileContents = FileReader.readTxtFile('notes.txt')

const chunks  =  createChunks(fileContents)

const embeddings = await generateEmbeddings(chunks)

console.log(embeddings)








