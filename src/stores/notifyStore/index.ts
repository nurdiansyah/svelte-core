import { Writable, writable } from "svelte/store";

import { addNotification, clearNotifications, Notify, removeNotification } from "./action";
import { getContext, setContext } from "svelte";

export type NotifyContext = {
  stores: Record<Notify["position"], Writable<Notify[]>>;
  addNotification: (notify: Partial<Notify>) => void;
  removeNotification: (notify: Notify) => void;
  clearNotifications: () => void;
  getNotificationStore: (position) => Writable<Notify[]>;
};
const KEY = Symbol("notify-context");
export const createNotifyContext = () => {
  const stores: Record<Notify["position"], Writable<Notify[]>> = {
    "top-left": writable([]),
    "top-center": writable([]),
    "top-right": writable([]),
    "bottom-left": writable([]),
    "bottom-center": writable([]),
    "bottom-right": writable([])
  };
  const context: NotifyContext = {
    stores,
    addNotification: (notification) => {
      notification.position = notification.position || "top-right";
      return addNotification(notification, stores[notification.position]);
    },
    removeNotification: (notification) => {
      return removeNotification(notification, stores[notification.position]);
    },
    clearNotifications: () => {
      const positions = Object.keys(stores);
      for (const position of positions) {
        clearNotifications(stores[position]);
      }
    },
    getNotificationStore: (position: Notify["position"]) => {
      return stores[position];
    }
  };
  setContext(KEY, context);
  return context;
};

export const getNotifyContext = () => getContext<NotifyContext>(KEY);
export type Notification = Notify;
