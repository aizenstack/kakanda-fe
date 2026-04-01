import React from 'react';
import MasterAutocomplete from './MasterAutocomplete';

export default function SelectCompanyComponent({ multiple, single, ...props }) {
    const isMultiple = multiple !== undefined ? true : (single !== undefined ? false : false);
    return (
        <MasterAutocomplete 
            type="company" 
            multiple={isMultiple} 
            placeholder={isMultiple ? "Pilih beberapa perusahaan..." : "Pilih perusahaan..."}
            {...props} 
        />
    );
}
