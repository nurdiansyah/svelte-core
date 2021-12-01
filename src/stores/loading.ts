import { Writable, writable } from "svelte/store";
export type LoadingStore = Writable<boolean>;
export const createLoadingStore = () => {
  let countLoading = 0;
  const { subscribe, set, update } = writable(true);
  return {
    subscribe,
    update,
    set: (val) => {
      let prev;
      subscribe((_) => {
        prev = _;
      });
      if (val) {
        countLoading++;
        if (!prev) {
          set(true);
        }
      } else {
        countLoading = countLoading > 0 ? countLoading - 1 : 0;
        if (prev && countLoading === 0) {
          set(false);
        }
      }
    }
  };
};
