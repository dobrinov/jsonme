export type Person = {name?: string; image?: string}
export type Post = {title?: string; date?: Date; body?: string}
export type Location = {city?: string; state?: string; country?: string}
export type Resume = Person & {summary?: string; location?: Location}
