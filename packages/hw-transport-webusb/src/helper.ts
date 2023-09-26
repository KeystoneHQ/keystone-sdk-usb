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
    return null;
  }
}
