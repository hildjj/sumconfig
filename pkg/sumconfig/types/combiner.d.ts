/**
 * @callback Combine
 * @param {any} a The previous value.
 * @param {import('./types.js').Loaded|any} b The new value.
 * @param {boolean} top Top-level file, b is a Loaded.
 * @returns {Promise | any} The combined value.
 * @throws {TypeError} Unknown JS type.
 */
export default class Combiner {
    /**
     * @private
     * @param {any} a Previous value.
     * @param {Array} b New value.
     * @returns {Array} Combined value.
     */
    private static Array;
    /**
     * @private
     * @param {any} a Previous value.
     * @param {Map} b New value.
     * @returns {Map} Combined value.
     */
    private static Map;
    /**
     * @private
     * @param {any} a Previous value.
     * @param {Set} b New value.
     * @returns {Set} Combined value.
     */
    private static Set;
    /**
     * @private
     * @template {{valueOf(): U}} T Any boxed type.
     * @template U
     * @param {any} _ Previous value.
     * @param {T} b New value.
     * @returns {U} Combined value.
     */
    private static boxed;
    /**
     * @private
     * @template T
     * @param {any} _ Previous value.
     * @param {T} b New value.
     * @returns {T} The new value.
     */
    private static overwrite;
    /**
     * @type {Object.<string,Combine>}
     */
    static map: {
        [x: string]: Combine;
    };
    /**
     * Create a Combiner.
     *
     * @param {import('./types').Options} opts Options.
     */
    constructor(opts: import('./types').Options);
    /** @type {{[topLevelKey: string]: string}} */
    top: {
        [topLevelKey: string]: string;
    };
    /** @type {import('./types').Options} */
    opts: import('./types').Options;
    /**
     * What was the final source file for a given top-level key?
     *
     * @param {string} key The top-level key.
     * @returns {string} The fully-qualified file name.
     */
    source(key: string): string;
    /**
     * Combine top-level objects loaded from files.
     *
     * @param {any} a Previous value.
     * @param {import('./types.js').Loaded} b New value.
     * @param {boolean} top Top level.  Should always be true.
     * @returns {Promise<object>} The combination of a and b.object.
     * @throws {Error} Invalid state.
     */
    Loaded(a: any, b: import('./types.js').Loaded, top: boolean): Promise<object>;
    /**
     * Combine the contents of different config options together in an
     * opinionated fashion.
     *
     * @param {any} a The pre-existing value.  Might
     *   be undefined.
     * @param {import('./types.js').Loaded|any} b The new value.
     * @param {boolean} [top=true] Is this a top-leve combination?  If so, b
     *   has type Loaded.
     * @returns {Promise<any>} A careful combination of a and b.
     * @throws {TypeError} Unknown JS type.  Should be impossible until new JS
     *   types get added again.
     */
    combine(a: any, b: import('./types.js').Loaded | any, top?: boolean): Promise<any>;
}
export type Combine = (a: any, b: import('./types.js').Loaded | any, top: boolean) => Promise<any> | any;
