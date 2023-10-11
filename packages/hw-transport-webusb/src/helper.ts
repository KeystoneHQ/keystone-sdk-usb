export const safeJSONStringify = (obj: any) => {
  try {
    return JSON.stringify(obj);
  } catch (err) {
    return '';
  }
}

export const safeJSONparse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (err) {
    return str;
  }
}

export const setUint16 = (array: Uint8Array, offset: number, value: number) => {
  array[offset] = (value >> 8) & 0xFF;
  array[offset + 1] = value & 0xFF;
}