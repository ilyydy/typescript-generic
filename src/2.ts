import { Obj, obj1, StrIndexObj } from "./index"

declare function getProperty<T, K1 extends keyof T>(param: T, k1: K1): T[K1]

const test3 = getProperty(obj1, "a1") // ok

namespace F1 {
    declare function getProperty<T, K1 extends keyof T, K2 extends keyof T[K1]>(
        param: T,
        k1: K1,
        k2: K2
    ): T[K1][K2]

    const test4 = getProperty(obj1, "a1", "b2") // error, 类型“"b2"”的参数不能赋给类型“never”的参数
}

type A1 = Obj["a1"]
type KeyofA1_1 = keyof A1 // 不能对 "init" 使用 keyof，所以 KeyofA1_1 为 never
type KeyofA1_2 = keyof Extract<A1, StrIndexObj> // "b1" | "b2"

declare function getProperty<
    T,
    K1 extends keyof T,
    K2 extends keyof Extract<T[K1], StrIndexObj>
>(param: T, k1: K1, k2: K2): Extract<T[K1], StrIndexObj>[K2]

const test5 = getProperty(obj1, "a1", "b2") // ok

declare function getProperty<
    T,
    K1 extends keyof T,
    K2 extends keyof Extract<T[K1], StrIndexObj>,
    K3 extends keyof Extract<Extract<T[K1], StrIndexObj>[K2], StrIndexObj>
>(
    param: T,
    k1: K1,
    k2: K2,
    k3: K3
): Extract<Extract<T[K1], StrIndexObj>[K2], StrIndexObj>[K3]

const test6 = getProperty(obj1, "a1", "b2", "c2") // ok
