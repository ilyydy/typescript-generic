import { Obj, obj1, obj2, StrIndexObj } from "./index"

type test0 = keyof StrIndexObj // string | number
type GetKey<T> = T extends StrIndexObj ? Extract<keyof T, string> : never
type test1 = GetKey<Obj> // "a1" | "a2"
type test2 = GetKey<string> // never

// type GetValue<T, KList extends string[]> = ?
// 思路： 递归使用 GetValue，每次消耗 KList 第一个元素，直到为空

export type Head<T extends any[]> = T extends [] ? never : T[0]
type test3 = Head<["1", 2]> // "1"
type test4 = Head<string[]> // string

export type Tail<T extends any[]> = ((...t: T) => any) extends (
    _: any,
    ...tail: infer TT
) => any
    ? TT
    : []
type test5 = Tail<["1", 2]> // [2]
type test6 = Tail<string[]> // string[]

export type Length<T extends any[]> = T["length"]
type test7 = Length<[1, 2]> // 2
type test8 = Length<string[]> // number

export type Last<T extends any[]> = T[Length<Tail<T>>]
type test9 = Last<["1", 2]>
type test10 = Last<string[]> // string

type GetValue<T extends StrIndexObj, KList extends string[]> = {
    0: T
    1: GetValue<Extract<T, StrIndexObj>[Head<KList>], Tail<KList>>
}[KList extends [] ? 0 : 1]

type test11 = GetValue<Obj, ["a1"]> // ok
type test12 = GetValue<Obj, ["a1", "b2"]> // ok
type test13 = GetValue<Obj, ["a1", "b2", "c2"]> // ok

namespace F2 {
    declare function getProperty<T, K1 extends GetKey<T>>(
        param: T,
        k1: K1
    ): GetValue<T, [K1]>

    const t1 = getProperty(obj1, "a1") // ok

    declare function getProperty<
        T,
        K1 extends GetKey<T>,
        K2 extends GetKey<GetValue<T, [K1]>>,
        D
    >(param: T, k1: K1, k2: K2, defaultValue: D): GetValue<T, [K1, K2]> | D

    const t2 = getProperty(obj1, "a1", "b2", "fault") // ok

    declare function getProperty<
        T,
        K1 extends GetKey<T>,
        K2 extends GetKey<GetValue<T, [K1]>>,
        K3 extends GetKey<GetValue<T, [K1, K2]>>,
        D
    >(
        param: T,
        k1: K1,
        k2: K2,
        k3: K3,
        defaultValue: D
    ): GetValue<T, [K1, K2, K3]> | D

    const t3 = getProperty(obj1, "a1", "b2", "c2", "fault") // ok
}

function getProperty<T, K1 extends GetKey<T>>(
    param: T,
    k1: K1
): GetValue<T, [K1]>

function getProperty<
    T,
    K1 extends GetKey<T>,
    K2 extends GetKey<GetValue<T, [K1]>>,
    D
>(param: T, k1: K1, k2: K2, defaultValue: D): GetValue<T, [K1, K2]> | D

function getProperty<
    T,
    K1 extends GetKey<T>,
    K2 extends GetKey<GetValue<T, [K1]>>,
    K3 extends GetKey<GetValue<T, [K1, K2]>>,
    D
>(
    param: T,
    k1: K1,
    k2: K2,
    k3: K3,
    defaultValue: D
): GetValue<T, [K1, K2, K3]> | D

function getProperty(obj: StrIndexObj, ...params: string[]) {
    let defaultValue
    if (params.length > 1) {
        defaultValue = params.pop()
    }

    let v = obj
    try {
        for (const i of params) {
            v = v[i]
        }
        return v
    } catch (error) {
        return defaultValue
    }
}

console.log("c2 in obj1: ", getProperty(obj1, "a1", "b2", "c2", "fault"))
console.log("c2 in obj2: ", getProperty(obj2, "a1", "b2", "c2", "fault"))
