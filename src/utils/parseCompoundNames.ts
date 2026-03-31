import { parseFullName, type Name } from "parse-full-name";

export function parseCompoundNames(input: string): Name[] {
  let parts = input.split(/\s+(?:and|&)\s+/i).map(p => p.trim());
  let parsedResults = parts.map(p => {
    const name = parseFullName(p)
    if (!name.first && name.last && parts.length > 1) return {...name, first: name.last, last: ''}
    else return name
  });
  if (parsedResults.length === 2 && !parsedResults[0].last && parsedResults[1].last) {
    parsedResults[0].last = parsedResults[1].last;
  }
  return parsedResults;
}

function padR(string?: string): string {
  if (string) return string + ' '
  else return ''
}

export function combineParsedNames(names: Name[]): string {
    if (names.length > 1) {
        return names.reduceRight((accumulator, name, index) => (index === 0) ?
        `${padR(name.title)}${padR(name.first)}and ${accumulator}` :
        `${padR(name.title)}${padR(name.first)}${accumulator}`
        , names[0].last || '')
    } else {
        return `${padR(names[0].title)}${padR(names[0].first)}${names[0].last}`.trimEnd()
    }
}