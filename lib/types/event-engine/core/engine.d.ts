import { Subject } from '../../core/components/subject';
import { Change } from './change';
import { State } from './state';
import { GenericMap, Event } from './types';
export declare class Engine<Events extends GenericMap, Effects extends GenericMap> extends Subject<Change<Events, Effects>> {
    describe<Context>(label: string): State<Context, Events, Effects>;
    private currentState?;
    private currentContext?;
    start<Context>(initialState: State<Context, Events, Effects>, initialContext: Context): void;
    transition<K extends keyof Events & string>(event: Event<K, Events[K]>): void;
}
