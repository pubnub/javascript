import { Query } from './types/api';
export declare const encodeString: (input: string | number) => string;
export declare const encodeNames: (names: string[], defaultString?: string) => string;
export declare const removeSingleOccurrence: (source: string[], elementsToRemove: string[]) => string[];
export declare const findUniqueCommonElements: (a: string[], b: string[]) => string[];
export declare const queryStringFromObject: (query: Query) => string;
