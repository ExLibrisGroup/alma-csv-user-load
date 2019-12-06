export interface Settings {
  userType: string,
  fields: Field[];
}

export interface Field {
  header: string,
  default: string,
  fieldName: string
}