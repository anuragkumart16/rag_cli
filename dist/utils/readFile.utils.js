import fs from 'fs';
import { file } from 'zod';
class FileReader {
    static readTxtFile(filePath) {
        const dataString = fs.readFileSync(filePath, 'utf-8');
        return dataString;
    }
}
export default FileReader;
//# sourceMappingURL=readFile.utils.js.map