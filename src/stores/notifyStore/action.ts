import { positions } from "./positions";

export type Notify = {
  id: string;
  position: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right";
  title: string;
  message: string;
  type: "success" | "error" | "dialog";
  removeAfter?: number;
  [k: string]: any;
};

export const addNotification = (notification: Partial<Notify>, store) => {
  if (!notification) return;

  const { update } = store;
  const defaultNotification = {
    id: `${new Date().getTime()}-${Math.floor(Math.random() * 9999)}`,
    title: undefined,
    message: undefined,
    ...notification
  };

  if (!defaultNotification.message || typeof defaultNotification.message !== "string") return;
  if (!positions.includes(defaultNotification.position)) return;

  update((notifications) => {
    if (defaultNotification.position.includes("top-")) {
      return [defaultNotification, ...notifications];
    }

    return [...notifications, defaultNotification];
  });
};

export const clearNotifications = (store) => store.set([]);

export const removeNotification = (notification, { update }) => {
  if (!notification) return;

  update((notifications: Notify[]) => {
    const i = notifications.findIndex((_) => _.id === notification.id);
    if (i > -1) {
      notifications.splice(i, 1);
    }
    return notifications;
  });
};
