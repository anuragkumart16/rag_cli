
import {generateOneEmbedding }from "./utils/embeddings.utils.js";
export default async function handleInput(input:string){
    try {
        const response = await generateOneEmbedding(input)
        return response
    } catch (error) {
        throw new Error(`Error generating embedding: ${error}`)
    }
}