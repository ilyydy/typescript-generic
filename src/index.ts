function f(param: string): string[]
function f(param: number): number

// 具体实现
function f(param: any) {
    if (typeof param === "string") {
        return [param]
    } else if (typeof param === "number") {
        return param
    }
}

const test1 = f("a") // string[]
const test2 = f(1)  // number

export type Obj = {
    a1: {
            b1: boolean
            b2: {
                c1: string
                c2: [1, 2] | undefined
            } | null
        } | "init"
    a2: number
}

export const obj1: Obj = {
    a1: {
        b1: false,
        b2: {
            c1: "hello",
            c2: [1, 2],
        },
    },
    a2: 1,
}


export const obj2: Obj = {
    a1: {
        b1: false,
        b2: null,
    },
    a2: 1,
}

export type StrIndexObj = { [index: string]: any }
