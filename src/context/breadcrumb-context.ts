import { getContext, hasContext, setContext } from "svelte";
import { BreadcrumbState, BreadcrumbStore, createBreadcrumbStore } from "../stores";

export interface BreadcrumbContext {
  breadcrumbStore?: BreadcrumbStore;
  add(input: BreadcrumbState): number;
  remove(index: number): void;
}

const KEY = "BREADCRUMB-CONTEXT";
export const createBreadcrumbContext = (initial: BreadcrumbState[] = []) => {
  const breadcrumbStore = createBreadcrumbStore(initial);
  const context: BreadcrumbContext = {
    breadcrumbStore,
    add(input) {
      const breadcrumb = breadcrumbStore.addBreadcrumb(input);
      return breadcrumb.index;
    },
    remove(index: number) {
      breadcrumbStore.removeBreadcrumb(index);
    }
  };
  setContext(KEY, context);
  return context;
};

export const getBreadcrumbContext = () => {
  return getContext<BreadcrumbContext>(KEY);
};

export const hasBreadcrumbContext = () => hasContext(KEY);
