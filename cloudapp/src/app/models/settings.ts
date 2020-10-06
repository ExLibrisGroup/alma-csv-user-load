export interface Settings {
  profiles: Profile[]
}

export interface Profile {
  name: string,
  accountType: string,
  profileType: ProfileType,
  fields: Field[];  
}

export enum ProfileType {
  ADD = "ADD",
  UPDATE = "UPDATE",
  DELETE = "DELETE"
}

export interface Field {
  header: string,
  default: string,
  fieldName: string
}