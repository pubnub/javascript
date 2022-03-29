import { Dispatcher } from './core';
import { Effects } from './effects';

export const createDispatcher = () => {
  const dispatcher = new Dispatcher<Effects>();

  return dispatcher;
};
