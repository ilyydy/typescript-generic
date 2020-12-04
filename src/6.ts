type Animal = {
    age: number
}

type Cat = Animal & {
    meow: () => void
}

const animal: Animal = { age: 1 }
const cat: Cat = { age: 2, meow: () => console.log("meow") }

// Cat 是 Animal 的子类型
const expectAnimal: Animal = cat // OK
const expectCat: Cat = animal // Error

type AnimalList = Animal[]
type CatList = Cat[]

const animalList: AnimalList = [animal]
const catList: CatList = [cat]

// CatList 是 AnimalList 的子类型，数组是型变
const expectAnimalList: AnimalList = catList
const expectCatList: CatList = animalList // Error

type Compare<T> = (left: T, right: T) => number
type CompareAnimal = Compare<Animal>
type CompareCat = Compare<Cat>

const compareAnimal: CompareAnimal = (left: Animal, right: Animal) =>
    left.age - right.age
const compareCat: CompareCat = (left: Cat, right: Cat) => left.age - right.age

// CompareAnimal 是 CompareCat 的子类型，函数类型的参数是逆变
const expectCompareAnimal: CompareAnimal = compareCat // error
const expectCompareCat: CompareCat = compareAnimal

// 容易得出函数类型的返回值是协变

// 最开始函数类型的参数是双变
/*
[why-are-function-parameters-bivariant](https://github.com/Microsoft/TypeScript/wiki/FAQ#why-are-function-parameters-bivariant)
In summary, in the TypeScript type system,
the question of whether a more-specific-type-accepting function should be assignable to a function accepting a less-specific type
provides a prerequisite answer to whether an array of that more specific type should be assignable to an array of a less specific type. 
*/

type Dog = Animal & {
    bark: () => void
}
const dog: Dog = { age: 3, bark: () => console.log("bark") }

expectAnimalList.push(dog)
catList.forEach(e => e.meow()) // runtime error, TypeError: e.meow is not a function. 类型不安全

// 从类型安全上讲，`Animal[]` 与 `Cat[]` 应该没有父子类型关系，即数组类型是不变。更准确地说： **可写**数组 **不变** 是安全的，**不可写**（只读）数组 **协变** 是安全的。typescript 为了便利性，允许数组类型是协变

// [typescript 2.6](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-6.html)
// Under --strictFunctionTypes function type parameter positions are checked contravariantly instead of bivariantly.
// The stricter checking applies to all function types, except those originating in method or constructor declarations.
// Methods are excluded specifically to ensure generic classes and interfaces (such as Array<T>) continue to mostly relate covariantly.\

// https://github.com/microsoft/TypeScript/pull/18654

namespace F1 {
    interface Comparer<T> {
        compare(a: T, b: T): number
    }

    declare let animalComparer: Comparer<Animal>
    declare let dogComparer: Comparer<Dog>

    animalComparer = dogComparer // Ok,T is bivariant in Comparer<T> because it is used only in method parameter positions.
    dogComparer = animalComparer // Ok
}

namespace F2 {
    interface Comparer<T> {
        compare: (a: T, b: T) => number
    }

    declare let animalComparer: Comparer<Animal>
    declare let dogComparer: Comparer<Dog>

    animalComparer = dogComparer // Error, T is contravariant in Comparer<T> because it is used only in function type parameter positions.
    dogComparer = animalComparer // Ok
}


// The following example demonstrates how multiple candidates for the same type variable in co-variant positions causes a union type to be inferred:

type Foo<T> = T extends { a:　() => infer U; b: () => infer U } ? U : never
type T10 = Foo<{ a: () => string; b: () => string }> // string
type T11 = Foo<{ a: () => string; b: () => number }> // string | number

// Likewise, multiple candidates for the same type variable in contra-variant positions causes an intersection type to be inferred:

type Bar<T> = T extends { a: (x: infer U) => void; b: (x: infer U) => void }
    ? U
    : never
type T20 = Bar<{ a: (x: string) => void; b: (x: string) => void }> // string
type T21 = Bar<{ a: (x: string) => void; b: (x: number) => void }> // never
