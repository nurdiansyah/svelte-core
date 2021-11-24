import { SvelteComponent } from "svelte";
import { Writable } from "svelte/store";

export type MenusStore = Writable<MenuItem[] | undefined>;
export type SidebarMenus = MenusStore;
export type NavbarMenus<S = MenusStore> = {
  left?: S;
  center?: S;
  right?: S;
};
export type MenuItem = {
  label?: string;
  path?: string;
  link?: string;
  type?: "title" | "spacer" | "divider" | "menu" | "desc";
  children?: MenuItem[];
  icon?: typeof SvelteComponent | string;
  show: boolean;
  isToggle?: boolean;
  itemRight?: typeof SvelteComponent | string;
  component?: typeof SvelteComponent;
  props?: Record<string, any>;
};
