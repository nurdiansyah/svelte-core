import { derived, get } from "svelte/store";
/**
 * @external Store
 * @see [Svelte stores](https://svelte.dev/docs#Store_contract)
 */

/**
 * Create a store similar to [Svelte's `derived`](https://svelte.dev/docs#derived), but which
 * has its own `set` and `update` methods and can send values back to the origin stores.
 * [Read more...](https://github.com/PixievoltNo1/svelte-writable-derived#default-export-writablederived)
 *
 * @param {Store|Store[]} origins One or more stores to derive from. Same as
 * [`derived`](https://svelte.dev/docs#derived)'s 1st parameter.
 * @param {!Function} derive The callback to determine the derived value. Same as
 * [`derived`](https://svelte.dev/docs#derived)'s 2nd parameter.
 * @param {!Function|{withOld: !Function}} reflect Called when the
 * derived store gets a new value via its `set` or `update` methods, and determines new values for
 * the origin stores. [Read more...](https://github.com/PixievoltNo1/svelte-writable-derived#new-parameter-reflect)
 * @param [initial] The new store's initial value. Same as
 * [`derived`](https://svelte.dev/docs#derived)'s 3rd parameter.
 *
 * @returns {Store} A writable store.
 */
export function writableDerived(origins, derive, reflect, initial?) {
  let childDerivedSetter,
    originValues,
    allowDerive = true;
  const reflectOldValues = "withOld" in reflect;
  const wrappedDerive = (got, set) => {
    childDerivedSetter = set;
    if (reflectOldValues) {
      originValues = got;
    }
    if (allowDerive) {
      const returned = derive(got, set);
      if (derive.length < 2) {
        set(returned);
      } else {
        return returned;
      }
    }
  };
  const childDerived = derived(origins, wrappedDerive, initial);

  const singleOrigin = !Array.isArray(origins);
  const sendUpstream = (setWith) => {
    allowDerive = false;
    if (singleOrigin) {
      origins.set(setWith);
    } else {
      setWith.forEach((value, i) => {
        origins[i].set(value);
      });
    }
    allowDerive = true;
  };
  if (reflectOldValues) {
    reflect = reflect.withOld;
  }
  const reflectIsAsync = reflect.length >= (reflectOldValues ? 3 : 2);
  let cleanup = null;
  function doReflect(reflecting) {
    let returned;
    if (cleanup) {
      cleanup();
      cleanup = null;
    }

    if (reflectOldValues) {
      returned = reflect(reflecting, originValues, sendUpstream);
    } else {
      returned = reflect(reflecting, sendUpstream);
    }
    if (reflectIsAsync) {
      if (typeof returned == "function") {
        cleanup = returned;
      }
    } else {
      sendUpstream(returned);
    }
  }

  let tryingSet = false;
  function update(fn) {
    let isUpdated, mutatedBySubscriptions, oldValue, newValue;
    if (tryingSet) {
      newValue = fn(get(childDerived));
      childDerivedSetter(newValue);
      return;
    }
    const unsubscribe = childDerived.subscribe((value) => {
      if (!tryingSet) {
        oldValue = value;
      } else if (!isUpdated) {
        isUpdated = true;
      } else {
        mutatedBySubscriptions = true;
      }
    });
    newValue = fn(oldValue);
    tryingSet = true;
    childDerivedSetter(newValue);
    unsubscribe();
    tryingSet = false;
    if (mutatedBySubscriptions) {
      newValue = get(childDerived);
    }
    if (isUpdated) {
      doReflect(newValue);
    }
  }
  return {
    subscribe: childDerived.subscribe,
    set(value) {
      update(() => value);
    },
    update
  };
}

/**
 * Create a store for a property value in an object contained in another store.
 * [Read more...](https://github.com/PixievoltNo1/svelte-writable-derived#named-export-propertystore)
 *
 * @param {Store} origin The store containing the object to get/set from.
 * @param {string|number|symbol|Array<string|number|symbol>} propName The property to get/set, or a path of
 * properties in nested objects.
 *
 * @returns {Store} A writable store.
 */
export function propertyStore(origin, propName) {
  if (!Array.isArray(propName)) {
    return writableDerived(origin, (object) => object[propName], {
      withOld(reflecting, object) {
        object[propName] = reflecting;
        return object;
      }
    });
  } else {
    const props = propName.concat();
    return writableDerived(
      origin,
      (value) => {
        for (let i = 0; i < props.length; ++i) {
          value = value[props[i]];
        }
        return value;
      },
      {
        withOld(reflecting, object) {
          let target = object;
          for (let i = 0; i < props.length - 1; ++i) {
            target = target[props[i]];
          }
          target[props[props.length - 1]] = reflecting;
          return object;
        }
      }
    );
  }
}
