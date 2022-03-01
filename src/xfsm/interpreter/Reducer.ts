import { Action, AnySignature } from '../description'

type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never

export type Reducer<S extends AnySignature, C, Ac extends Action<S['actionType'], any>> = UnionToIntersection<
  Ac extends Action<S['actionType'], infer X>
    ? (context: C, event?: X extends S['eventType'] ? S['eventMap'][X] : S['event']) => C | void
    : never
>

export type Reducers<S extends AnySignature, C> = {
  [Key in S['actionType']]: Reducer<S, C, S['actionMap'][Key]>
}
