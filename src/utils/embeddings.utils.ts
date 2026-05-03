// This project uses ollama for generating embeddings
// ideal code is 
// brew install ollama
// brew services start ollama
// ollama pull nomic-embed-text
// after these commands ollama starts running at http://localhost:11434 all we need is to make a post call 

export async function generateOneEmbedding(text:string):Promise<number[]>{
    const response = await fetch('http://localhost:11434/api/embeddings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'nomic-embed-text',
            prompt: text
        })
    })

    const data = await response.json()
    return data.embedding
}

export default function generateEmbeddings(chunks:string[]):Promise<number[][]>{
    const embeddingPromises = chunks.map(chunk => generateOneEmbedding(chunk))
    return Promise.all(embeddingPromises)
}


