export interface IHistory {
    role: IHRole,
    parts: Part[]
}

export enum IHRole {
    user = 'user',
    model = 'model'
}

interface Part {
    type: TypePartEnum
    text: string
}

export enum TypePartEnum {
    text = 'text',
    image = 'image'
}
