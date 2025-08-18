export function jsonDateTransform(doc: any, ret: any) {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  if (ret.createdAt) {
    ret.createdAt = new Date(ret.createdAt).toLocaleDateString('zh-CN', options);
  }
  if (ret.updatedAt) {
    ret.updatedAt = new Date(ret.updatedAt).toLocaleDateString('zh-CN', options);
  }

  return ret;
}