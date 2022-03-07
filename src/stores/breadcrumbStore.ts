import { writable, Writable } from "svelte/store";

export type BreadcrumbState = {
  icon?: string;
  path: string;
  label: string;
  onClick?: (breadcrumb: Breadcrumb) => void;
};
export type Breadcrumb = BreadcrumbState & {
  index: number;
};

export interface BreadcrumbStore extends Writable<BreadcrumbState[]> {
  reset(): void;
  addBreadcrumb(breadcrumbState: BreadcrumbState): Breadcrumb;
  removeBreadcrumb(index: number): void;
}

export const createBreadcrumbStore = (initial: BreadcrumbState[] = []): BreadcrumbStore => {
  const store = writable(initial);
  return {
    ...store,
    reset() {
      store.set(initial);
    },
    addBreadcrumb(breadcrumbState: BreadcrumbState): Breadcrumb {
      let index;
      store.update((_) => {
        index = _.length;
        return [..._, breadcrumbState];
      });
      return {
        index,
        ...breadcrumbState
      };
    },
    removeBreadcrumb(index: number) {
      store.update((_) => {
        return _.slice(0, index);
      });
    }
  };
};
