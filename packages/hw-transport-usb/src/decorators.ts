export function logMethod(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const params = args.map(a => JSON.stringify(a)).join();
    const result = await originalMethod.apply(this, args);
    return result;
  };

  return descriptor;
}
