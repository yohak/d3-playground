// https://qiita.com/kznrluk/items/790f1b154d1b6d4de398
export const transpose = (a: number[][]): number[][] =>
  a[0].map((_, c) => a.map((r) => r[c]));
