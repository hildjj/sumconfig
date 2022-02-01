/**
 * Build a list of file names to check in each candidate directory for this app.
 *
 * @param {string} appName The application name to use to build file names.
 * @returns {string[]} The default set of filenames for this app.
 */
export function fileNames(appName: string): string[];
/**
 * The default configuration for sumconfig.
 *
 * @param {string} [appName] Name of the app.
 * @returns {import('./loaded').Options} The default options for this appName.
 */
export function defaultMeta(appName?: string): import('./loaded').Options;
