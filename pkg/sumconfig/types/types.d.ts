/**
 * Options that have been loaded from a file.
 */
export class Loaded {
    /**
     * Create a Loaded.
     *
     * @param {string} appName The application name.
     * @param {string} fileName The source file name.
     * @param {string} loader The function name used to load.
     * @param {OptInitial} options Either a (potentially async) function
     *   that will return the options, or an object.
     */
    constructor(appName: string, fileName: string, loader: string, options: OptInitial);
    /** @type {string} */
    appName: string;
    /** @type {string} */
    fileName: string;
    /** @type {string} */
    loader: string;
    /** @type {OptInitial} */
    options: OptInitial;
    stamp: Date;
    root: boolean;
}
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
     * Map from file name or extension (including
     * dot) to a Loader function.  Defaults to loaders for package.json, .json,
     * .yaml, .yml, .js (modules only!), and .mjs.  Use "" for files with no
     * extension (defaults to the YAML loader, which handles JSON slightly
     * slower than the JSON loader).
     */
    loaders?: LoaderMap;
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
    stopKey?: string | null;
};
export type Loader = (appName: string, fileName: string, opts: Options) => Promise<OptInitial>;
export type LoaderMap = {
    [x: string]: Loader;
};
export type OptInitial = object | Function;
