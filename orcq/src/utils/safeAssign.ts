const safeAssign = <T extends { [x in string | number]: any }>(
  obj1: T,
  obj2?: { [xx in string | number]: any }
) => {
  if (!obj2) return obj1;

  let ret: any = {};
  for (const [key, value] of Object.entries(obj2)) {
    if (value !== undefined || value !== null) {
      ret[key] = obj2[key];
    }
  }
  return Object.assign({}, obj1, ret);
};

export default safeAssign;
