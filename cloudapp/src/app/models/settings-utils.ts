import { FormArray, FormGroup } from '@angular/forms';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

  /** Validate appropriate combination of fields for CSV import profile */
  export const validateFields = (fields: FormArray): string[] | null => {
    let errorArray = [];

    /* Address type required */
    if (fields.value.some(f=>f['fieldName'].startsWith('contact_info.address'))
      && !fields.value.some(f=>f['fieldName']=='contact_info.address[].address_type.0.value'))
      errorArray.push({code:_('Settings.Validation.AddressTypeRequired')});

    /* Email type required */
    if (fields.value.some(f=>f['fieldName'].startsWith('contact_info.email'))
      && !fields.value.some(f=>f['fieldName']=='contact_info.email[].email_type.0.value'))  
      errorArray.push({code:_('Settings.Validation.EmailTypeRequired')});

    /* Note type required */
    if (fields.value.some(f=>f['fieldName'].startsWith('user_note'))
      && !fields.value.some(f=>f['fieldName']=='user_note[].note_type.value'))  
      errorArray.push({code:_('Settings.Validation.NoteTypeRequired')});

    return errorArray.length>0 ? errorArray : null;
  }

  /** Validate entire form */
  export const validateForm = (form: FormGroup) : string[] | null => {
    let errorArray = [];
    let profiles = form.get('profiles') as FormArray;

    /* All fields must have a fieldName and either a default or a header */
    profiles.controls.forEach( p => {
      let fields = p.get('fields');
      if ( fields.value.some(f=>!f['fieldName']))
        errorArray.push({code:_('Settings.Validation.FieldNameRequired'), params:{profile:p.get('name').value}})
      if ( fields.value.some(f=>!f['header'] && !f['default']))
        errorArray.push({code:_('Settings.Validation.HeaderRequired'), params:{profile:p.get('name').value}})
    })

    /* If Update/Delete, must have primary ID field */
    profiles.controls.forEach( p => {
      if (['UPDATE', 'DELETE'].includes(p.get('profileType').value)) {
        const fields = p.get('fields');
        if ( !fields.value.some(f=>f['fieldName']=='primary_id'))
          errorArray.push({code:_('Settings.Validation.PrimaryIdRequired'), params:{profile:p.get('name').value}})
      }
    })

    return errorArray.length>0 ? errorArray : null;
  }