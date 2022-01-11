/**
 * @callback Combiner
 * @param {any} a The previous value.
 * @param {any} b The new value.
 * @returns {Promise | any} The combined value.
 * @throws {TypeError} Unknown JS type.
 */
export default class Combiners {
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
     * Throw the new error.
     *
     * @param {any} _ Previous value.
     * @param {Error} b Error to throw.
     * @throws {Error} Whatever error was passed in b.
     */
    static throw(_: any, b: Error): void;
    /**
     * @type {Object.<string,Combiner>}
     */
    static map: {
        [x: string]: Combiner;
    };
    /**
     * Combine the contents of different config options together in an opinionated
     * fashion.
     *
     * @param {any} a The pre-existing value.  Might be undefined.
     * @param {any} b The new value.
     * @returns {Promise<any>} A careful combination of a and b.
     * @throws {TypeError} Unknown JS type.  Should be impossible until new
     *   JS types get added again.
     */
    static combine(a: any, b: any): Promise<any>;
}
export type Combiner = (a: any, b: any) => Promise<any> | any;
