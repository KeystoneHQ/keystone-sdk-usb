type Nullable<T> = T | null | undefined;

type ProcessBuffers = <T>(buffers: Buffer[]) => T;