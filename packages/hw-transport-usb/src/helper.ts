export const safeJSONStringify = (obj: any): string => {
  try {
    return JSON.stringify(obj);
  } catch (err) {
    return '';
  }
};

export const safeJSONparse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (err) {
    return str;
  }
};

export const setUint16 = (array: Uint8Array, offset: number, value: number) => {
  array[offset] = (value >> 8) & 0xFF;
  array[offset + 1] = value & 0xFF;
};

export const isEmpty = (value: any) => {
  if (Array.isArray(value)) {
    return value.length === 0;
  }
  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }
  return !value;
};

export const generateRequestID = () => {
  return Math.floor(Math.random() * 65535);
};

export const isUint8Array = (data: any): data is Uint8Array => data instanceof Uint8Array;

export const isString = (data: any): data is string => typeof data === 'string';
