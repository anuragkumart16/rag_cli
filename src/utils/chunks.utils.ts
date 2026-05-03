export default function createChunks(fileContents:string, overlap = 100):string[]{
    const chunks:string[] = []
    const sentenceArray = fileContents.split('. ')

    // for (let index = 0 ; index < sentenceArray.length ; index++){
    //     let sentence = sentenceArray[index] || ""

    //     if (index + 1 <= sentenceArray.length){
    //         sentence += sentenceArray[index + 1]?.split(' ').slice(0, overlap).join(' ') || ""
    //     }
    //     chunks.push(sentence)
    // }
    // return chunks


    for (let index=0; index+1 < sentenceArray.length; index=index+2){
        if (index + 3 < sentenceArray.length){
            let chunk = sentenceArray.slice(index,index+3)
            chunks.push(chunk.join(" "))
        } else{
            let chunk = sentenceArray.slice(index,sentenceArray.length)
            chunks.push(chunk.join(" "))
        }

    }

    return chunks

}

