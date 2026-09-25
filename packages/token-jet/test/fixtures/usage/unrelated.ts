// not a token call: a different function with a similar name
export const x = tokenize('space.x16');
function tokenize(s: string) {
  return s;
}
