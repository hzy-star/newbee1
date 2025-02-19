export interface saveKv {
    k:  string | undefined,
    v: string | undefined,
    status: string | undefined,
    group: string | undefined,
    kvdesc: string | undefined
}

export interface delKv {
    k:  string | undefined,
}