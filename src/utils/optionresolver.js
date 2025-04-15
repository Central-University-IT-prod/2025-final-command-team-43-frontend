export function renderChoices(choices, ansString) {
  const c = ansString.split(";");
  return c.map(c => choices[c]);
}
