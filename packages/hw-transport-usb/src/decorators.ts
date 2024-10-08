
const isDev = process.env.KEYSTONE_USB_ENV === 'development';

export function logMethod(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<any>) {
  const originalMethod = descriptor.value;

  descriptor.value = async function (...args: any[]) {
    const params = args.map(a => JSON.stringify(a)).join();
    const result = await originalMethod.apply(this, args);
    if (isDev) {
      console.log(`[${new Date().toISOString()}] Call: ${propertyName}(${params}) => ${JSON.stringify(result)}`);
    }
    return result;
  };

  return descriptor;
}