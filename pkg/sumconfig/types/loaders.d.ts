export class Loaders {
    /**
     * @type {{[fileName: string]: import('./loaded').OptInitial}}
     */
    static cache: {
        [fileName: string]: any;
    };
    /**
     * Clear the loader cache.
     */
    static clearCache(): void;
    /**
     * @private
     * @param {string} f The full path of the file to read from.  MUST be in utf8.
     * @param {import('./loaded').Options} opts Options.
     * @returns {Promise<string>} The file contents.
     */
    private static readFile;
    /**
     * Load a Yaml file.
     *
     * @private
     * @param {string} appName The application name.
     * @param {string} fileName The full path of the file to load.
     * @param {import('./loaded').Options} opts Options for loading.
     * @returns {Promise<object>} The loaded config, or {} if there was an
     *   ignorable error.
     */
    private static loadYaml;
    /**
     * Load a JSON file.
     *
     * @private
     * @param {string} appName The application name.
     * @param {string} fileName The full path of the file to load.
     * @param {import('./loaded').Options} opts Options for loading.
     * @returns {Promise<object>} The loaded config, or {} if there was an
     *   ignorable error.
     */
    private static loadJson;
    /**
     * Load a package.json file, and extract the correct key from it if it exists.
     *
     * @private
     * @param {string} appName The application name.
     * @param {string} fileName The full path of the file to load.
     * @param {import('./loaded').Options} opts Options for loading.
     * @returns {Promise<object>} The loaded config, or {} if there was an
     *   ignorable error.
     */
    private static loadPackageJson;
    /**
     * Load a js module.  Must not be cjs, so if you're loading from a config
     * directory without a package.json, use `.mjs`.
     *
     * @private
     * @param {string} appName The application name.
     * @param {string} fileName The full path of the file to load.
     * @param {import('./loaded').Options} opts Options for loading.
     * @returns {Promise<import('./loaded').OptInitial>} The loaded config, or
     *   {} if there was an ignorable error.
     */
    private static loadJs;
    /**
     * The default loaders.
     *
     * @type {import('./loaded').LoaderMap}
     */
    static map: import('./loaded').LoaderMap;
    /**
     * Pick the correct loader, and call it.
     *
     * @param {string} appName The application name.
     * @param {string} fileName The full path of the file to load.
     * @param {import('./loaded').Options} opts Options for loading.
     * @returns {Promise<Loaded>} The loaded config, or {} if
     *   there was an ignorable error.
     * @throws {Error} No known loader for this file type.
     */
    static loadFile(appName: string, fileName: string, opts: import('./loaded').Options): Promise<Loaded>;
}
import { Loaded } from "./loaded.js";
