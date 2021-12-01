import { getContext, setContext } from "svelte";
import { derived, Readable, Writable, writable } from "svelte/store";
import { createLoadingStore, LoadingStore } from "../stores";

export interface UIStore {
  isDark?: boolean;
  minimizeSidebarLeft?: boolean;
  openSidebarLeft?: boolean;
  minimizeSidebarSecondaryLeft?: boolean;
  openSidebarSecondaryLeft?: boolean;
  currentPath?: string;
}

export interface UIContext {
  brandTitle?: string;
  store: Readable<UIStore>;
  loadUIStore: () => void;
  toggleTheme: () => void;
  toggleMinimizeSidebarLeft: () => void;
  toggleOpenSidebarLeft: () => void;
  toggleMinimizeSidebarSecondaryLeft: () => void;
  toggleOpenSidebarSecondaryLeft: () => void;
  setCurrentPath: (path: string) => void;
  getCurrentPath: () => Readable<string>;
  isActive: (path: string) => Readable<boolean>;
  loadingStore: LoadingStore;
}

const key = Symbol("ui-context");

export const createUIContext = (options: Partial<UIContext> = {}) => {
  const store: Writable<UIStore> = writable({});
  const loadingStore = createLoadingStore();
  const loadLocalStorage = () => {
    const isDark = localStorage.getItem("is-dark");
    const minimizeSidebarLeft = localStorage.getItem("toggle-minimize-sidebar-left");
    const openSidebarLeft = localStorage.getItem("toggle-open-sidebar-left");
    const minimizeSidebarSecondaryLeft = localStorage.getItem("toggle-minimize-sidebar-secondary-left");
    const openSidebarSecondaryLeft = localStorage.getItem("toggle-open-sidebar-secondary-left");
    store.update((_) => ({
      ..._,
      isDark: isDark === "true" || false,
      minimizeSidebarLeft: minimizeSidebarLeft === "true" || false,
      openSidebarLeft: openSidebarLeft === "true" || false,
      minimizeSidebarSecondaryLeft: minimizeSidebarSecondaryLeft === "true" || false,
      openSidebarSecondaryLeft: openSidebarSecondaryLeft === "true" || false
    }));
  };
  const toggleTheme = () => {
    store.update((s: any) => {
      localStorage.setItem("is-dark", String(!s.isDark));
      s.isDark = !s.isDark;
      return s;
    });
  };

  const toggleMinimizeSidebarLeft = () => {
    store.update((s: UIStore) => {
      s.minimizeSidebarLeft = !s.minimizeSidebarLeft;
      localStorage.setItem("toggle-minimize-sidebar-left", String(s.minimizeSidebarLeft));
      return s;
    });
  };

  const toggleOpenSidebarLeft = () => {
    store.update((s: UIStore) => {
      s.openSidebarLeft = !s.openSidebarLeft;
      localStorage.setItem("toggle-open-sidebar-left", String(s.openSidebarLeft));
      return s;
    });
  };

  const toggleMinimizeSidebarSecondaryLeft = () => {
    store.update((s: UIStore) => {
      s.minimizeSidebarSecondaryLeft = !s.minimizeSidebarSecondaryLeft;
      localStorage.setItem("toggle-minimize-sidebar-secondary-left", String(s.minimizeSidebarSecondaryLeft));
      return s;
    });
  };

  const toggleOpenSidebarSecondaryLeft = () => {
    store.update((s: UIStore) => {
      s.openSidebarSecondaryLeft = !s.openSidebarSecondaryLeft;
      localStorage.setItem("toggle-open-sidebar-secondary-left", String(s.openSidebarSecondaryLeft));
      return s;
    });
  };
  const context: UIContext = {
    brandTitle: options.brandTitle,
    store: derived(store, (_: UIStore) => _),
    loadUIStore: () => {
      loadLocalStorage();
    },
    toggleTheme,
    toggleMinimizeSidebarLeft,
    toggleOpenSidebarLeft,
    toggleMinimizeSidebarSecondaryLeft,
    toggleOpenSidebarSecondaryLeft,
    setCurrentPath(path) {
      store.update((_) => {
        _.currentPath = path;
        return _;
      });
    },
    getCurrentPath() {
      return derived(store, (_) => _.currentPath);
    },
    isActive(path) {
      return derived(store, (_) => {
        const regex = new RegExp(`^${path}($|/)`);
        return !!_.currentPath?.match(regex);
      });
    },
    loadingStore
  };
  setContext(key, context);
  return context;
};

export const getUIContext = () => getContext<UIContext>(key);
