import { ZodObject, ZodRawShape } from "@deboxsoft/zod";
import { getContext, hasContext, setContext } from "svelte";
import { Writable, writable } from "svelte/store";

export interface FormContext {
  schema: ZodObject<ZodRawShape>;
  fields: Writable<Record<string, any>>;
  submitted: Writable<boolean>;
  submit: (cb: (input: Record<any, any>) => void) => void;
  isValid: Writable<boolean>;
  fieldsErrors: Writable<Record<string, string[]>>;
  validateField: (args?: any) => (value?: unknown) => void;
}

export interface FormOptions {
  schema?: ZodObject<ZodRawShape>;
  fields?: Writable<Record<string, any>>;
  fieldsErrors?: Writable<Record<string, any>>;
  submittedEnable?: boolean;
  values?: any;
  isValid?: Writable<boolean>;
  validateField?: (args?: any) => (value?: unknown) => void;
}

const key = Symbol("form");
const createFieldsErrorStore = (isValid) => {
  const { set, subscribe, update } = writable({});
  return {
    subscribe,
    set: (v) => {
      // set valid or invalid
      if (Object.keys(v).length === 0) {
        isValid.set(true);
      } else {
        isValid.set(false);
      }
      set(v);
    },
    update: (cb) => {
      update((v) => {
        const _errors = cb(v);
        if (Object.keys(v).length === 0) {
          isValid.set(true);
        } else {
          isValid.set(false);
        }
        return _errors;
      });
    }
  };
};

export const createFormContext = ({
  schema,
  values = {},
  validateField,
  isValid = writable(false),
  fieldsErrors = undefined,
  submittedEnable = false
}: FormOptions): FormContext => {
  const fields = writable(values);
  const submitted = writable(submittedEnable);
  let $fields = {};
  fieldsErrors = fieldsErrors || createFieldsErrorStore(isValid);
  submitted.subscribe((_submitted) => {
    submittedEnable = _submitted;
  });
  fields.subscribe((_fields) => {
    $fields = _fields;
  });

  function validateFieldDefault(fieldName) {
    return (value) => {
      if (value) {
        $fields[fieldName] = value;
      }
      if (schema) {
        const _fieldSchema = schema.shape[fieldName];
        if (_fieldSchema) {
          const parsed = _fieldSchema.safeParse($fields[fieldName]);
          // @ts-ignore
          const { error } = parsed;
          fieldsErrors.update(($fieldsErrors) => {
            if (error) {
              const _errors = error.errors;
              if (Array.isArray(_errors)) {
                $fieldsErrors[fieldName] = _errors.map((_) => ({
                  path: _.path,
                  message: _.message
                }));
              } else {
                $fieldsErrors[fieldName] = error.errors[0].message;
              }
            } else if ($fieldsErrors[fieldName]) {
              delete $fieldsErrors[fieldName];
            }
            return $fieldsErrors;
          });
        }
      }
    };
  }

  const context = {
    schema,
    fields,
    fieldsErrors,
    submitted,
    isValid,
    validateField: validateField || validateFieldDefault,
    submit(cb: (_input) => void) {
      let input;
      if (schema) {
        input = schema.parse($fields);
      } else {
        input = $fields;
      }
      cb(input);
    }
  };
  setContext(key, context);
  return context;
};

export const getFormContext = () => getContext<FormContext>(key);

export const hasFormContext = () => hasContext(key);
