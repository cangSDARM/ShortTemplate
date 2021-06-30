/**
 * Execute corresponding regexp specified times
 *
 * - **Will Not** capture any group
 * @param str needed parsed string
 * @param regex regex. Required: `global` flag
 * @param limit 0 to infinity
 */
export default function matchLimit(
  str: string,
  regex: RegExp,
  limit: number = 0
): { matched: string[]; rest: string } {
  regex.lastIndex = 0;
  let i = 0;
  let reResult: RegExpExecArray | null;
  let strRest = str;
  const matched: string[] = [];
  while ((reResult = regex.exec(str)) != null && i++ < limit) {
    strRest = strRest.substring(reResult[0].length);
    matched.push(reResult[0].trim());
  }
  return { matched, rest: strRest.trim() };
}
