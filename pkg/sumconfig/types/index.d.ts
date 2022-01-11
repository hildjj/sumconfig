/**
 * @callback Loader
 * @param {string} appName The application name.
 * @param {string} fileName The full path of the file to load.
 * @param {Options} opts Options for loading.
 * @returns {Promise<object>} The loaded config, or {} if there was an
 *   ignorable error.
 */
/**
 * Options for gathering options.
 *
 * @typedef {object} Options
 * @property {boolean} [errorOnEmpty = false] Throw an error if a config file
 *   exists, but it is empty.
 * @property {Object.<string, Loader>} [loaders] Map from file name or
 *   extension (including dot) to a Loader function.  Defaults to loaders for
 *   package.json, .json, .yaml, .yml, .js (modules only!), and .mjs.  Use ""
 *   for files with no extension (defaults to the YAML loader, which handles
 *   JSON slightly slower than the JSON loader).
 * @property {string} [startDir=process.cwd()] Where to start searching from.
 * @property {string} [stopDir=os.homedir()] If we get to this directory,
 * stop.
 * @property {string[]} [dirs] What directories to search.  If not specified,
 *   will start at startDir and go to stopDir, going up a directory each time.
 *   Directories closer to the current directory take precedence.
 * @property {string[]} [fileNames] What file names to check.  If not
 *   specified, will use a list based on the appName.
 * @property {boolean} [ignoreGit] Don't stop when we get to the top of a git
 *   repo.
 * @property {import('./combiners').Combiner} [combine] Specify how to
 *   combine any two values. Defaults to the opinionated combiner in
 *   combiners.js.
 */
/**
 * Build a list of file names to check in each candidate directory for this app.
 *
 * @param {string} appName The application name to use to build file names.
 * @returns {string[]} The default set of filenames for this app.
 */
export function fileNames(appName: string): string[];
/**
 * Walk the directory path, starting at opts.startDir and ending at
 * opts.stopDir or the root of startDir's file system.
 *
 * @param {string} appName The application name.
 * @param {Options} opts Options.
 * @returns {Promise<string[]>} The directories.
 */
export function allDirs(appName: string, opts: Options): Promise<string[]>;
/**
 * Gather configurations together from all of the places we can find.
 *
 * @param {string} appName The application name.  All of the characters in the
 *   name should be safe for use in a filename.
 * @param {Options} opts Options.
 * @returns {Promise<object>} The combined configurations.
 * @throws {Error} Invalid appName.
 */
export function sumconfig(appName: string, opts?: Options): Promise<object>;
/**
 * The default loaders.
 *
 * @type {Object.<string, Loader>}
 */
export const loaders: {
    [x: string]: Loader;
};
export default sumconfig;
export type Loader = (appName: string, fileName: string, opts: Options) => Promise<object>;
/**
 * Options for gathering options.
 */
export type Options = {
    /**
     * Throw an error if a config file
     * exists, but it is empty.
     */
    errorOnEmpty?: boolean;
    /**
     * Map from file name or
     * extension (including dot) to a Loader function.  Defaults to loaders for
     * package.json, .json, .yaml, .yml, .js (modules only!), and .mjs.  Use ""
     * for files with no extension (defaults to the YAML loader, which handles
     * JSON slightly slower than the JSON loader).
     */
    loaders?: {
        [x: string]: Loader;
    };
    /**
     * Where to start searching from.
     */
    startDir?: string;
    /**
     * If we get to this directory,
     * stop.
     */
    stopDir?: string;
    /**
     * What directories to search.  If not specified,
     * will start at startDir and go to stopDir, going up a directory each time.
     * Directories closer to the current directory take precedence.
     */
    dirs?: string[];
    /**
     * What file names to check.  If not
     * specified, will use a list based on the appName.
     */
    fileNames?: string[];
    /**
     * Don't stop when we get to the top of a git
     * repo.
     */
    ignoreGit?: boolean;
    /**
     * Specify how to
     * combine any two values. Defaults to the opinionated combiner in
     * combiners.js.
     */
    combine?: import('./combiners').Combiner;
};
