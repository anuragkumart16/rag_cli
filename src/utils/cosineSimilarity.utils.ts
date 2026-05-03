
export function dotProduct(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
        throw new Error("Vectors must be of the same length");
    }
    return vecA.reduce((sum, a, idx) => sum + a * (vecB[idx] ?? 0), 0);
}

export function magnitude(vec: number[]): number {
    return Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
}

export default function cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProd = dotProduct(vecA, vecB);
    const magA = magnitude(vecA);
    const magB = magnitude(vecB);
    if (magA === 0 || magB === 0) {
        return 0
    }
    return dotProd / (magA * magB);
}