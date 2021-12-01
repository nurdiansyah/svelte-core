import { generateId } from "@deboxsoft/module-client";
import { docTitle, queueRender, Store } from "./api";
import { css, addListener, addClass, remove, animationEndEvents, outerHeight, removeClass, inArray } from "./utils";

export let DocModalCount = 0;

/**
 * @param {Noty} ref
 * @return {void}
 */
export function ghostFix(ref) {
  const ghostID = generateId({ prefix: "ghost" });
  let ghost = document.createElement("div");
  ghost.setAttribute("id", ghostID);
  css(ghost, {
    height: outerHeight(ref.barDom) + "px"
  });

  ref.barDom.insertAdjacentHTML("afterend", ghost.outerHTML);

  remove(ref.barDom);
  // @ts-ignore
  ghost = document.getElementById(ghostID);
  addClass(ghost, "noty_fix_effects_height");
  addListener(ghost, animationEndEvents, () => {
    remove(ghost);
  });
}

/**
 * @param {Noty} ref
 * @return {void}
 */
export function build(ref) {
  findOrCreateContainer(ref);

  const markup = `<div class="noty_body">${ref.options.text}</div>${buildButtons(
    ref
  )}<div class="noty_progressbar"></div>`;

  ref.barDom = document.createElement("div");
  ref.barDom.setAttribute("id", ref.id);
  addClass(ref.barDom, `noty_bar noty_type__${ref.options.type} noty_theme__${ref.options.theme}`);

  ref.barDom.innerHTML = markup;

  fire(ref, "onTemplate");
}

/**
 * @param {Noty} ref
 * @return {boolean}
 */
export function hasButtons(ref) {
  return !!(ref.options.buttons && Object.keys(ref.options.buttons).length);
}

/**
 * @param {Noty} ref
 * @return {string}
 */
function buildButtons(ref) {
  if (hasButtons(ref)) {
    let buttons = document.createElement("div");
    addClass(buttons, "noty_buttons");

    Object.keys(ref.options.buttons).forEach((key) => {
      buttons.appendChild(ref.options.buttons[key].dom);
    });

    ref.options.buttons.forEach((btn) => {
      buttons.appendChild(btn.dom);
    });
    return buttons.outerHTML;
  }
  return "";
}

/**
 * @param {Noty} ref
 * @return {void}
 */
export function handleModal(ref: any) {
  if (ref.options.modal) {
    if (DocModalCount === 0) {
      createModal();
    }

    DocModalCount++;
  }
}

/**
 * @param {Noty} ref
 * @return {void}
 */
export function handleModalClose(ref) {
  if (ref.options.modal && DocModalCount > 0) {
    DocModalCount--;

    if (DocModalCount <= 0) {
      const modal = document.querySelector(".noty_modal");

      if (modal) {
        removeClass(modal, "noty_modal_open");
        addClass(modal, "noty_modal_close");
        addListener(animationEndEvents, () => {
          remove(modal);
        });
      }
    }
  }
}

/**
 * @return {void}
 */
function createModal() {
  const body = document.querySelector("body");
  const modal = document.createElement("div");
  addClass(modal, "noty_modal");
  body.insertBefore(modal, body.firstChild);
  addClass(modal, "noty_modal_open");

  addListener(modal, animationEndEvents, () => {
    removeClass(modal, "noty_modal_open");
  });
}

/**
 * @param {Noty} ref
 * @return {void}
 */
function findOrCreateContainer(ref) {
  if (ref.options.container) {
    ref.layoutDom = document.querySelector(ref.options.container);
    return;
  }

  const layoutID = `noty_layout__${ref.options.layout}`;
  ref.layoutDom = document.querySelector(`div#${layoutID}`);

  if (!ref.layoutDom) {
    ref.layoutDom = document.createElement("div");
    ref.layoutDom.setAttribute("id", layoutID);
    ref.layoutDom.setAttribute("role", "alert");
    ref.layoutDom.setAttribute("aria-live", "polite");
    addClass(ref.layoutDom, "noty_layout");
    document.querySelector("body").appendChild(ref.layoutDom);
  }
}

/**
 * @param {Noty} ref
 * @return {void}
 */
export function queueClose(ref) {
  if (ref.options.timeout) {
    if (ref.options.progressBar && ref.progressDom) {
      css(ref.progressDom, {
        transition: `width ${ref.options.timeout}ms linear`,
        width: "0%"
      });
    }

    clearTimeout(ref.closeTimer);

    ref.closeTimer = setTimeout(() => {
      ref.close();
    }, ref.options.timeout);
  }
}

/**
 * @param {Noty} ref
 * @return {void}
 */
export function dequeueClose(ref) {
  if (ref.options.timeout && ref.closeTimer) {
    clearTimeout(ref.closeTimer);
    ref.closeTimer = -1;

    if (ref.options.progressBar && ref.progressDom) {
      css(ref.progressDom, {
        transition: "width 0ms linear",
        width: "100%"
      });
    }
  }
}

/**
 * @param {Noty} ref
 * @param {string} eventName
 * @return {void}
 */
export function fire(ref, eventName) {
  if (ref.listeners.hasOwnProperty(eventName)) {
    ref.listeners[eventName].forEach((cb) => {
      if (typeof cb === "function") {
        cb.apply(ref);
      }
    });
  }
}

/**
 * @param {Noty} ref
 * @return {void}
 */
export function openFlow(ref) {
  fire(ref, "afterShow");
  queueClose(ref);

  addListener(ref.barDom, "mouseenter", () => {
    dequeueClose(ref);
  });

  addListener(ref.barDom, "mouseleave", () => {
    queueClose(ref);
  });
}

/**
 * @param {Noty} ref
 * @return {void}
 */
export function closeFlow(ref) {
  delete Store[ref.id];
  ref.closing = false;
  fire(ref, "afterClose");

  remove(ref.barDom);

  if (ref.layoutDom.querySelectorAll(".noty_bar").length === 0 && !ref.options.container) {
    remove(ref.layoutDom);
  }

  if (
    inArray("docVisible", ref.options.titleCount.conditions) ||
    inArray("docHidden", ref.options.titleCount.conditions)
  ) {
    docTitle.decrement();
  }

  queueRender(ref.options.queue);
}

export * from "./api";
