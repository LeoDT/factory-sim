export function randomPick<T>(arr: T[]): T {
  const index = Math.floor(Math.random() * arr.length);

  return arr[index];
}

export function rotateMatrix<T>(mat: T[][]): T[][] {
  const n = mat.length;
  const m = mat[0].length;

  const newMat = new Array(m).fill(1).map(() => new Array(n));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      newMat[j][n - 1 - i] = mat[i][j];
    }
  }

  return newMat;
}
