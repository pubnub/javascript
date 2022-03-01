import { fromCallback } from './CallbackHandler'
import { fromAsync } from './PromiseHandler'

export const managed = {
  from: fromCallback,
  fromAsync,
}
