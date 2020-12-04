import _ from "lodash"

import { Obj } from "./index"


function f1(param: Obj) {
    if (
        param.a1 !== "init" &&
        param.a1.b2 !== null &&
        param.a1.b2.c2 !== undefined
    ) {
        const v1 = param.a1.b2.c2[0]
        return v1 // 返回值类型是 1, 但必须层层判断类型
    }
}

function f2(param: Obj) {
    const v2 = _.get(param, ["a1", "b2", "c2", "0"]) // 路径不能提示，返回值类型是 any
    return v2
}
