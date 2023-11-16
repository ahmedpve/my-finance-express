export const filterObjKeys = (obj: Record<string, any>, allowedKeys: string[]) => {
  const filteredObj: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    if (allowedKeys.includes(key)) {
      filteredObj[key] = obj[key];
    }
  });
  return filteredObj;
};
