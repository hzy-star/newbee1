export interface queryListKv {
    kvgroup: string | undefined, // 查询的kvgroup
    k:  string | undefined, // 查询的key
    status: string | undefined, // 查询的状态
}

export interface saveKv {
    id?: number | undefined, // 新增时id为undefined
    k:  string | undefined,
    v: string | undefined,
    kvdesc: string | undefined
    kvgroup: string | undefined,
    status: string | undefined,
}

export interface delKv {
    id:  number | undefined,
}