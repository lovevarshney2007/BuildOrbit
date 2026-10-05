export function euclideanDistance(arr1: number[], arr2: number[]): number {
  if (arr1.length !== arr2.length) {
    throw new Error("Arrays must have the same length");
  }
  return Math.sqrt(
    arr1.reduce((sum, val, i) => sum + Math.pow(val - arr2[i], 2), 0)
  );
}

export function isFaceMatch(descriptor1: number[], descriptor2: number[], threshold = 0.5): boolean {
  const distance = euclideanDistance(descriptor1, descriptor2);
  return distance < threshold;
}
