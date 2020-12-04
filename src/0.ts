import A from "axios"
import { MongoClient } from "mongodb"

/*
用于函数
*/

// identity 函数： 这个函数会返回任何传入它的值

namespace First {
    // 1. 参数使用 any, 返回值丢失传入参数的类型
    function identity(arg: any) {
        return arg
    }
    const r1 = identity("test") // any
}

namespace Second {
    // 2. 使用函数签名的类型重载
    // 编译器根据调用函数时实际传入的参数类型，依次和函数定义进行匹配，直到匹配到第一条合适的
    // 但每种需要的类型都必须写出来

    function identity(arg: string): string

    function identity(arg: number): number

    function identity(arg: any) {
        return arg
    }

    const r2 = identity("test") // string
    const r3 = identity(1) // number
    const r4 = identity([1]) // error, No overload matches this call.
}

namespace Third {
    // 3.使用泛型
    function identity<T>(arg: T) {
        return arg
    }

    // 显式地指明类型参数 T 的类型
    const output1 = identity<string>("myString") // type of output will be 'string'

    // 更好的做法：利用了类型推论，编译器会根据传入的参数自动地帮助我们确定 T 的类型
    const output2 = identity("myString") // type of output will be 'myString'
}

namespace Forth {
    // 也可以直接构造函数类型
    type IdentityFunc = <T>(arg: T) => T

    const identity: IdentityFunc = (arg: any) => {
        return arg
    }

    // 显式地指明类型参数 T 的类型
    const output3 = identity<string>("myString") // type of output will be 'string'

    // 更好的做法：利用了类型推论，编译器会根据传入的参数自动地帮助我们确定 T 的类型
    const output4 = identity("myString") // type of output will be 'myString'
}

// 常用场景：
// 1.通过 axios 从服务端获取数据
async function f1() {
    // 默认为 any
    const t1 = await A.get("http://someUrl") // AxiosResponse<any>
    const data1 = t1.data // any

    const t2 = await A.get<string>("http://someUrl") // AxiosResponse<string>
    const data2 = t2.data // string

    type Template<T> = { code: number; data: T; success: boolean }
    const t3 = await A.get<Template<string>>("http://someUrl") // AxiosResponse<Template<string>>
    const data3 = t3.data // Template<string>
}

// 2. 通过数据库 client 从数据库获取数据
async function f2() {
    const client = new MongoClient("someUri")
    const db = client.db("someDb")

    const c1 = db.collection("c1") // Collection<any>
    const data1 = await c1.find({}).toArray() // any[]
    const data2 = await c1.find<{ id: string; name: string }>({}).toArray() // { id: string; name: string }[]

    const c2 = db.collection<{ id: string; name: string }>("c2") // Collection<{ id: string; name: string }>
    const data3 = await c2.find({}).toArray() // { id: string; name: string }[]，而且能对 query 进行提示
}

/*
用于类
*/

class Queue1<T> {
    private data: T[] = []

    push(item: T) {
        this.data.push(item)
    }

    shift() {
        return this.data.shift()
    }
}

const queue = new Queue1<number>()
queue.push(0)
queue.push("1") // Error：不能推入一个 `string`，只有 number 类型被允许

const last = new Queue1().shift() // 默认值为 unknown

// unknown: TypeScript 3.0 引进, 与 any 相对
// no operations are permitted on an unknown without first asserting or narrowing to a more specific type

// 类的静态成员不能使用泛型类型
class Queue2<T> {
    private data: T[] = []

    push(item: T) {
        this.data.push(item)
    }

    shift() {
        return this.data.shift()
    }

    static a: T[] = [] // error
    static f(p: T) { } // error
}

// 以固定机场为例
type StationaryV1 = {
    version: "v1"
    plc: "closed"
    a: string
    d: { e: string }
}
type StationaryV2 = {
    version: "v2"
    plc: "closed"
    b: number
    d: { f: number }
}
type Stationary = StationaryV1 | StationaryV2

namespace S1 {
    // 不使用泛型
    abstract class Controller {
        status: Stationary | undefined

        onData(s: Stationary) {
            this.status = s
        }

        getPropertyD() {
            if (!this.status) return undefined
            return this.status.d // ok
        }

        abstract work(): void
    }

    class ControllerV1 extends Controller {
        work() {
            const t = this.status // StationaryV1 | StationaryV2 | undefined, 需要区分 StationaryV1、StationaryV2
        }
    }

    const c = new ControllerV1()
    const d = c.getPropertyD()  // { e: string; } | { f: number; } | undefined
}

namespace S2 {
    // 使用泛型
    abstract class Controller<T> {
        status: T | undefined

        onData(s: T) {
            this.status = s
        }

        abstract work(): void

        getPropertyD() {
            if (!this.status) return undefined
            return this.status.d // 待解决的问题: error, 类型“T”上不存在属性“d”
        }
    }

    class ControllerV1 extends Controller<StationaryV1> {
        work() {
            const t = this.status // StationaryV1 | undefined, ok
        }
    }
}

/*
用于类型
*/

type Obj<One, Second> = { [index: string]: [One, Second] }
type T1 = Obj<string, number> // { [index: string]: [string, number] }
type T2 = Obj<string[], number[]> // { [index: string]: [string[], number[]] }

interface Producer<T> {
    shift: () => T | undefined
}

function consumeFirst<T>(arg: Producer<T>) {
    const last = arg.shift()
    // do something with last
    // ...
    return last
}

const item1 = consumeFirst([1]) // number | undefined
const item2 = consumeFirst<number>(new Queue1()) // number | undefined
const item3 = consumeFirst(new Queue1<number>()) // number | undefined
const item4 = consumeFirst(new Queue1()) // undefined

/*
拓展
*/

// 同时使用多个泛型
function tuple<Ele, K>(arg1: Ele[], arg2: K): [Ele[], K] {
    return [arg1, arg2]
}
const output3 = tuple(["test"], 1) // [string[], number]

// 给定默认值
type O<One = string, Second = number> = { [index: string]: [One, Second] }
type T3 = O // { [index: string]: [string, number] }

/*
泛型约束
*/

namespace F1 {
    // 一个对外的函数，期望传入 { [index: string]: any } 这样一个对象
    function identityObj(arg: { [index: string]: any }) {
        return arg
    }
    const r1 = identityObj({ a: 1 }) // { [index: string]: any }，无法获得更精确的类型
    const r2 = identityObj(1)   // error, 类型“1”的参数不能赋给类型“{ [index: string]: any; }”的参数
}

namespace F2 {
    // 对参数进行约束
    function identityObj<T extends { [index: string]: any }>(arg: T) {
        return arg
    }
    const r1 = identityObj({ a: 1 }) // { a: number }
    const r2 = identityObj(1)   // error, 类型“1”的参数不能赋给类型“{ [index: string]: any; }”的参数
}

// 类型参数相互约束
function getProperty<T, K extends keyof T>(obj: T, key: K) {
    return obj[key]
}

const x = { a: 1, b: 2, c: 3, d: 4 }
getProperty(x, "a") // okay
getProperty(x, "m") // error: Argument of type 'm' isn't assignable to 'a' | 'b' | 'c' | 'd'.


namespace S3 {
    abstract class Controller<T extends Stationary> {
        status: T | undefined

        onData(s: T) {
            this.status = s
        }

        abstract work(): void

        getPropertyD() {
            if (!this.status) return undefined
            return this.status.d
        }

        getPropertyDV2() {
            if (!this.status) return undefined
            return this.status.d as T["d"]  // 使用泛型定义返回值的类型
        }
    }

    class ControllerV1 extends Controller<StationaryV1> {
        work() {
            const t = this.status // StationaryV1 | undefined, ok
        }
    }

    const v1 = new ControllerV1()
    const d1 = v1.getPropertyD()  // { e: string; } | { f: number; } | undefined
    const d2 = v1.getPropertyDV2()  // { e: string; } | undefined
}




/*
extends 条件类型
*/

// T extends U ? X : Y

type TypeName<T> =
    T extends string ? "string" :
    T extends number ? "number" :
    T extends boolean ? "boolean" :
    T extends undefined ? "undefined" :
    T extends Function ? "function" :
    "other"

type test1 = TypeName<string>  // "string"
type test2 = TypeName<"a">  // "string"
type test3 = TypeName<true>  // "boolean"
type test4 = TypeName<() => void>  // "function"
type test5 = TypeName<string[]>  // "other"
type test6 = TypeName<string | (() => void)>  // "string" | "function"



/*
infer 条件推断
*/

type StrIndexObjInfer<O> =
    O extends { [index: string]: infer A }
    ? A             // If true
    : never         // If false

type test9  = StrIndexObjInfer<{ a: string }> // string
type test10  = StrIndexObjInfer<string>        // never

type FunctionInfer<F> =
    F extends (...args: infer A) => infer R
    ? [A, R]        // If true
    : never         // If false

const fn01  = (a: number, b: any) => true
type test11 = FunctionInfer<typeof fn01> // [[a: number, b: any], boolean]

type ArrayInfer<T> =
    T extends (infer U)[]
    ? U
    : never

const array = [0, 'data', 1, 'data']
type test12 = ArrayInfer<typeof array> // string | number


/*
官方预设的一些工具类型
*/

// 所有属性变为可选
// type Partial<T> = {
//     [P in keyof T]?: T[P]
// }
type P1 = Partial<{ a: string }> // { a?: string | undefined }

// 可用于 client 中 filter 类型的参数
type Book = { name: string, price: number, pages: number }
function getBooks(params: Partial<Book>) {}


// 所有属性变为必选
// type Required<T> = {
//     [P in keyof T]?: T[P]
// }
type R1 = Required<{ a?: string }> // { a: string }


// 所有属性变为只读
// type Readonly<T> = {
//     readonly [P in keyof T]: T[P]
// }
type R2 = Readonly<{ a: string }> // { readonly a: string }

// 可用于输出一个只读对象
function getReadonlyObj<T extends {[index: string]: any}>(params: T) {
    // do something to params
    // ...
    return params as Readonly<T>
}
const readonlyObj1 = getReadonlyObj({ a: 1, b: { c: "yes" } })
readonlyObj1.a = 2  // error, Cannot assign to 'a' because it is a read-only property.
readonlyObj1.b.c = "no" // 对深层次属性无效

const readonlyObj2 = getReadonlyObj([1, [2, 3]])
readonlyObj2[0] = 3 // error, 类型“readonly (number | number[])[]”中的索引签名仅允许读取


// 提取 T 中部分的属性
// type Pick<T, K extends keyof T> = {
//     [P in K]: T[P]
// }
type P2 = Pick<{ a: string, b: number, c: null }, "a" | "b"> // { a: string; b: number }


// 去掉 T 中部分的属性
// type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>
type O1 = Omit<{ a: string, b: number, c: null }, "a" | "b"> // { c: null }


// 获取 T 中不属于 U 的类型
// type Exclude<T, U> = T extends U ? never : T
type E1 = Exclude<"a" | "b" | "c" | "d", "a" | "c" | "f">;  // "b" | "d"


// 获取 T、U 公有的类型
// type Extract<T, U> = T extends U ? T : never
type E2 = Extract<"a" | "b" | "c" | "d", "a" | "c" | "f">;  // "a" | "c"


// 去掉 null, undefined
// type NonNullable<T> = T extends null | undefined ? never : T
type N1 = NonNullable<string | number | undefined>;  // string | number


// 获取函数参数类型
// type Parameters<T extends (...args: any) => any> = T extends (...args: infer P) => any ? P : never
type P3 = Parameters<(a: string, b?: number) => void> // [a: string, b?: number | undefined]

function identity(arg: string): string
function identity(arg: number): number
function identity(arg: any) {
    return arg
}
type P4 = Parameters<typeof identity> // [arg: number]，对签名重载的函数取最后一条


// 获取函数返回值类型
// type ReturnType<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R : any
type R3 = ReturnType<() => string> // string

type ReturnTypeV2<T extends (...args: any) => any> = T extends (...args: any) => infer R ? R extends Promise<infer S> ? S : R : any
type R4 = ReturnTypeV2<() => Promise<string>> // string
