/* eslint-disable @typescript-eslint/no-unsafe-function-type */
export  type OnlyProperties<T> = Pick<T, { [K in keyof T]: T[K] extends Function ? never : K  }[keyof T]>;

export type Writable<T> = {
    -readonly [P in keyof T]: T[P];
};

/** 2025-04-04T18:00:00.000Z */
export type ISODateString = string

/** Extraer solo las propiedades mutables de un tipo */
export type OnlyMutableProperties<T> = Pick<T, { [K in keyof T]: T[K] extends Function ? never : K  }[keyof T]>;

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type OmitBy<T, K extends keyof T> = Omit<T, K>;

export type PartialWithout<T, K extends keyof T> = Partial<T> & Pick<T, K>;
export type OmitWithout<T, K extends keyof T> = Omit<T, keyof T> & Pick<T, K>;

export type SnakeToCamel<S extends string> = 
    S extends `${infer T}_${infer U}` 
        ? `${T}${Capitalize<SnakeToCamel<U>>}` 
        : S;

export type ConvertKeysToCamel<T> = {
    [K in keyof T as SnakeToCamel<Extract<K, string>>]: T[K];
};
