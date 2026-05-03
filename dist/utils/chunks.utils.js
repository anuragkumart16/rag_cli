export default function createChunks(fileContents, overlap = 100) {
    const chunks = [];
    const sentenceArray = fileContents.split('. ');
    for (let index = 0; index < sentenceArray.length; index++) {
        let sentence = sentenceArray[index] || "";
        if (index + 1 <= sentenceArray.length) {
            sentence += sentenceArray[index + 1]?.split(' ').slice(0, overlap).join(' ') || "";
        }
        chunks.push(sentence);
    }
    return chunks;
}
//# sourceMappingURL=chunks.utils.js.map