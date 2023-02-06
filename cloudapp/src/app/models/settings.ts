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
  DELETE = "DELETE",
  ENRICH = "ENRICH",
}

export interface Field {
  header: string,
  default: string,
  fieldName: string
}

export const validateProfiles = (profiles: Profile[]) => {
  if (!Array.isArray(profiles)) return false;
  profiles.forEach(profile => {
    if (!profile.name || !profile.accountType || !(profile.profileType in ProfileType)) return false;
    if (!Array.isArray(profile.fields)) return false;
  })
  return true;
}