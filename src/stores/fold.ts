import { createLocalStore } from "./localstorage";
type Options = {
  key: string;
  initial: any;
};
/**
 *
 * @param key
 * @param initial
 * @return Writable<any>
 */
export const createFoldStore = ({ key, initial = [] }: Options) => {
  const { set, subscribe, clear, update } = createLocalStore(key, initial);
  return {
    set,
    subscribe,
    clear,
    update
  };
};
