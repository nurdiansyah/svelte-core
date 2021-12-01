import { getContext, hasContext, setContext } from "svelte";
import { writable } from "svelte/store";
import { MenuItem, NavbarMenus, SidebarMenus } from "../navigation";

export interface MenusContextOptions {
  navbarMenus?: NavbarMenus<MenuItem[]>;
  sidebarMenus?: MenuItem[];
}

export interface MenusContext {
  navbarMenus?: NavbarMenus;
  sidebarMenus?: SidebarMenus;
}

const KEY = Symbol("menus-context");
export const createMenusContext = ({ sidebarMenus, navbarMenus }: MenusContextOptions = {}) => {
  const context: MenusContext = {
    sidebarMenus: sidebarMenus ? writable(sidebarMenus) : undefined,
    navbarMenus: navbarMenus
      ? {
          left: navbarMenus.left ? writable(navbarMenus.left) : undefined,
          center: navbarMenus.center ? writable(navbarMenus.center) : undefined,
          right: navbarMenus.right ? writable(navbarMenus.right) : undefined
        }
      : undefined
  };

  setContext(KEY, context);
  return context;
};

export const getMenusContext = () => getContext<MenusContext>(KEY);

export const hasMenusContext = () => hasContext(KEY);
