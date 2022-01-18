/**
 * Clear all caches retained by the library.
 */
export function clearCaches(): void;
/**
 * Gather configurations together from all of the places we can find.
 *
 * @param {string} appName The application name.  All of the characters in the
 *   name should be safe for use in a filename.
 * @param {import('./types').Options} [opts] Options.
 * @returns {Promise<object>} The combined configurations.
 * @throws {Error} Invalid appName.
 */
export function sumconfig(appName: string, opts?: import('./types').Options): Promise<object>;
export { defaultMeta };
export default sumconfig;
import { defaultMeta } from "./defaults.js";
