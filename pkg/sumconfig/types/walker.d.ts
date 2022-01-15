export default class Walker {
    /** @type {Object<string,string[]|Promise<string[]>>} */
    static cache: {
        [x: string]: string[] | Promise<string[]>;
    };
    static clearCache(): void;
    /**
     * Find the contents of a directory, with caching.
     *
     * @param {string} dirname The directory to search.
     * @returns {Promise<string[]>} The contents of the directory.
     */
    static getDir(dirname: string): Promise<string[]>;
    /**
     * Walk the directory path, starting at opts.startDir and ending at
     * opts.stopDir or the root of startDir's file system.  Return all
     * of the filenames from opts that exist on those paths.
     *
     * @param {string} appName The application name.
     * @param {import('./types').Options} opts Options.
     * @returns {Promise<string[]>} The directories.
     */
    static allDirs(appName: string, opts: import('./types').Options): Promise<string[]>;
}
