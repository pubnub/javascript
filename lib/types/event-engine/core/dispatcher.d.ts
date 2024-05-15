import { Handler } from './handler';
import { GenericInvocation, GenericMap, InvocationTypeFromMap } from './types';
type HandlerCreator<Payload, Dependencies> = (payload: Payload, dependencies: Dependencies) => Handler<Payload, Dependencies>;
export declare class Dispatcher<Effects extends GenericMap, Dependencies, Invocation extends GenericInvocation = InvocationTypeFromMap<Effects>> {
    private readonly dependencies;
    constructor(dependencies: Dependencies);
    private instances;
    private handlers;
    on<K extends keyof Effects & string>(type: K, handlerCreator: HandlerCreator<Effects[K], Dependencies>): void;
    dispatch(invocation: Invocation): void;
    dispose(): void;
}
export {};
