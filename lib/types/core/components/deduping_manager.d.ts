/**
 * Real-time events deduplication manager.
 *
 * @internal
 */
export default class _default {
    constructor({ config }: {
        config: any;
    });
    _config: any;
    hashHistory: any[];
    getKey(message: any): string;
    isDuplicate(message: any): boolean;
    addEntry(message: any): void;
    clearHistory(): void;
}
