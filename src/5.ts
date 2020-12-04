const p1: { a: undefined | null | { b: 1 } } = {
    a: {
        b: 1,
    },
}

console.log(p1.a?.b)

const p2: { a: undefined | null | { b: 1 } } = {
    a: null,
}

console.log(p2.a?.b)
