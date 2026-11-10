// How many modules go on each string.
//
// v1 always has two strings. Modules are split evenly and any remainder
// goes to string 1, e.g. 41 modules -> [21, 20], 40 modules -> [20, 20].
//
// "(modulesQty: number): number[]" means: takes a number, returns an array of numbers.
export function splitModules(modulesQty: number): number[] {
  const string2 = Math.floor(modulesQty / 2)
  const string1 = modulesQty - string2
  return [string1, string2]
}
