import { Obj, obj1, StrIndexObj } from "./index"

// 类似 lodash，将所有 key 的数组作为第二个参数，默认值作为第三个参数

namespace F1 {
    declare function getProperty<T, K1 extends keyof T>(
        param: T,
        [k1]: [K1]
    ): T[K1]

    const test7 = getProperty(obj1, ["a1"]) // ok

    declare function getProperty<
        T,
        K1 extends keyof T,
        K2 extends keyof Extract<T[K1], StrIndexObj>,
        D
    >(
        param: T,
        [k1, k2]: [K1, K2],
        defaultValue: D
    ): Extract<T[K1], StrIndexObj>[K2] | D

    const test8 = getProperty(obj1, ["a1", "b2"], undefined) // ok

    declare function getProperty<
        T,
        K1 extends keyof T,
        K2 extends keyof Extract<T[K1], StrIndexObj>,
        K3 extends keyof Extract<Extract<T[K1], StrIndexObj>[K2], StrIndexObj>,
        D
    >(
        param: T,
        [k1, k2, k3]: [K1, K2, K3],
        defaultValue: D
    ): Extract<Extract<T[K1], StrIndexObj>[K2], StrIndexObj>[K3] | D

    const test9 = getProperty(obj1, ["a1", "b2", "c2"], undefined) // 可以正确使用，但无法参数提示
}

// 不将所有 key 作为数组

declare function getProperty<T, K1 extends keyof T>(param: T, k1: K1): T[K1]

const test10 = getProperty(obj1, "a1") // ok

declare function getProperty<
    T,
    K1 extends keyof T,
    K2 extends keyof Extract<T[K1], StrIndexObj>,
    D
>(
    param: T,
    k1: K1,
    k2: K2,
    defaultValue: D
): Extract<T[K1], StrIndexObj>[K2] | D

const test11 = getProperty(obj1, "a1", "b2", "fault") // ok

declare function getProperty<
    T,
    K1 extends keyof T,
    K2 extends keyof Extract<T[K1], StrIndexObj>,
    K3 extends keyof Extract<Extract<T[K1], StrIndexObj>[K2], StrIndexObj>,
    D
>(
    param: T,
    k1: K1,
    k2: K2,
    k3: K3,
    defaultValue: D
): Extract<Extract<T[K1], StrIndexObj>[K2], StrIndexObj>[K3] | D

const test12 = getProperty(obj1, "a1", "b2", "c2", "fault") // 可以正确使用，但需要先输入 defaultValue 才能提示第3个 key
