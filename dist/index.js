import FileReader from "./utils/readFile.utils.js";
import createChunks from "./utils/chunks.utils.js";
const fileContents = FileReader.readTxtFile('notes.txt');
const chunks = createChunks(fileContents);
console.log(chunks);
//# sourceMappingURL=index.js.map