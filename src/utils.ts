export function range(start: number, end: number, stride = 1) {
  let arr = [];
  for (let i = start; i < end; i += stride) {
    arr.push(i);
  }
  return arr;
}

// n is 8bit number
export const to2 = (n: number) => n.toString(2).padStart(8, "0");
export const to8 = (n: number) => n.toString(8).padStart(4, "0");
export const to10 = (n: number) => n.toString(10).padStart(3, "0");
export const to16 = (n: number) => n.toString(16).padStart(2, "0");
