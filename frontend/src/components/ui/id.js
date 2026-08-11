let controlCounter = 0;

export function nextUiId(prefix) {
  controlCounter += 1;
  return `${prefix}-${controlCounter}`;
}
