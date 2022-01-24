export default class SumConfig {
    static defaultMeta: typeof dm;
    /**
     * Gather all config files without keeping source data.
     *
     * @param {string} appName The application name.  All of the characters in
     *   the name should be safe for use in a filename.
     * @param {import('./types').Options} [opts] Options.
     * @returns {Promise<object>} The combined configurations.
     */
    static sumconfig(appName: string, opts?: import('./types').Options): Promise<object>;
    /**
     * Clear all caches retained by the library.
     */
    static clearCaches(): void;
    /**
     * Create a SumConfig object.
     *
     * @param {string} appName The application name.  All of the characters in
     *   the name should be safe for use in a filename.
     * @param {import('./types').Options} [opts] Options.
     */
    constructor(appName: string, opts?: import('./types').Options);
    appName: string;
    opts: {
        /**
         * Throw an error if a config file
         * exists, but it is empty.
         */
        errorOnEmpty?: boolean;
        /**
         * Map from file name or extension (including
         * dot) to a Loader function.  Defaults to loaders for package.json, .json,
         * .yaml, .yml, .js (modules only!), and .mjs.  Use "" for files with no
         * extension (defaults to the YAML loader, which handles JSON slightly
         * slower than the JSON loader).
         */
        loaders?: {
            [x: string]: import("./types").Loader;
        };
        /**
         * Where to start searching from.
         */
        startDir?: string;
        /**
         * If we get to any of these
         * directories, stop.
         */
        stopDirs?: string[];
        /**
         * Stop when a file or
         * directory of one of these names is found in a directory we visit.
         */
        stopPeers?: string[];
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
         * Logging function.
         * Defaults to debug('sumconfig'), which allows turning on logging with the
         * environment variable `DEBUG=sumconfig`.
         */
        log: (formatter: any, ...args: any[]) => void;
        /**
         * Ignore user-wide configuration files
         * (in $XDG_CONFIG_HOME, for example).
         */
        ignoreUser?: boolean;
        /**
         * Stop when this key is in a config, is
         * a boolean, and its value is false.  Set to null to turn off this
         * behavior.
         */
        stopKey?: string;
    };
    combiner: Combiner;
    /**
     * Gather configurations together from all of the places we can find.
     *
     * @returns {Promise<object>} The combined configurations.
     * @throws {Error} Invalid appName.
     */
    gather(): Promise<object>;
    /**
     * What was the final source file for a given top-level key?
     *
     * @param {string} key The top-level key.
     * @returns {string} The fully-qualified file name.
     */
    source(key: string): string;
}
import Combiner from "./combiner.js";
import { defaultMeta as dm } from "./defaults.js";
