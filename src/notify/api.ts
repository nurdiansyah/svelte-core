/* eslint-disable no-prototype-builtins */
export let PageHidden = false;

const DocTitleProps = {
  originalTitle: null,
  count: 0,
  changed: false,
  timer: -1
};

export const setPageHidden = (hidden: boolean) => {
  PageHidden = hidden;
};

export const docTitle = {
  increment: () => {
    DocTitleProps.count++;

    docTitle._update();
  },

  decrement: () => {
    DocTitleProps.count--;

    if (DocTitleProps.count <= 0) {
      docTitle._clear();
      return;
    }

    docTitle._update();
  },

  _update: () => {
    const title = document.title;

    if (!DocTitleProps.changed) {
      DocTitleProps.originalTitle = title;
      document.title = `(${DocTitleProps.count}) ${title}`;
      DocTitleProps.changed = true;
    } else {
      document.title = `(${DocTitleProps.count}) ${DocTitleProps.originalTitle}`;
    }
  },

  _clear: () => {
    if (DocTitleProps.changed) {
      DocTitleProps.count = 0;
      document.title = DocTitleProps.originalTitle;
      DocTitleProps.changed = false;
    }
  }
};

export const DefaultMaxVisible = 5;

export const Queues = {
  global: {
    maxVisible: DefaultMaxVisible,
    queue: []
  }
};

export const Store = {};

export let Defaults = {
  type: "alert",
  layout: "topRight",
  theme: "mint",
  text: "",
  timeout: false,
  progressBar: true,
  closeWith: ["click"],
  animation: {
    open: "noty_effects_open",
    close: "noty_effects_close"
  },
  id: false,
  force: false,
  killer: false,
  queue: "global",
  container: false,
  buttons: [],
  callbacks: {
    beforeShow: null,
    onShow: null,
    afterShow: null,
    onClose: null,
    afterClose: null,
    onClick: null,
    onHover: null,
    onTemplate: null
  },
  sounds: {
    sources: [],
    volume: 1,
    conditions: []
  },
  titleCount: {
    conditions: []
  },
  modal: false,
  visibilityControl: false
};

export const setDefault = (val: any) => {
  Defaults = val;
};

/**
 * @param {string} queueName
 * @return {object}
 */
export function getQueueCounts(queueName = "global") {
  let count = 0;
  let max = DefaultMaxVisible;

  if (Queues.hasOwnProperty(queueName)) {
    max = Queues[queueName].maxVisible;
    Object.keys(Store).forEach((i) => {
      if (Store[i].options.queue === queueName && !Store[i].closed) count++;
    });
  }

  return {
    current: count,
    maxVisible: max
  };
}

/**
 * @param {Noty} ref
 * @return {void}
 */
export function addToQueue(ref) {
  if (!Queues.hasOwnProperty(ref.options.queue)) {
    Queues[ref.options.queue] = { maxVisible: DefaultMaxVisible, queue: [] };
  }

  Queues[ref.options.queue].queue.push(ref);
}

/**
 * @param {Noty} ref
 * @return {void}
 */
export function removeFromQueue(ref) {
  if (Queues.hasOwnProperty(ref.options.queue)) {
    const queue = [];
    Object.keys(Queues[ref.options.queue].queue).forEach((i) => {
      if (Queues[ref.options.queue].queue[i].id !== ref.id) {
        queue.push(Queues[ref.options.queue].queue[i]);
      }
    });
    Queues[ref.options.queue].queue = queue;
  }
}

/**
 * @param {string} queueName
 * @return {void}
 */
export function queueRender(queueName = "global") {
  if (Queues.hasOwnProperty(queueName)) {
    const noty = Queues[queueName].queue.shift();

    if (noty) noty.show();
  }
}

/**
 * @return {void}
 */
export function queueRenderAll() {
  Object.keys(Queues).forEach((queueName) => {
    queueRender(queueName);
  });
}
