import React from 'react';
import MasterAutocomplete from './MasterAutocomplete';

export default function SelectBranchComponent({ multiple, single, ...props }) {
    const isMultiple = multiple !== undefined ? true : (single !== undefined ? false : false);
    return (
        <MasterAutocomplete 
            type="branch" 
            multiple={isMultiple} 
            placeholder={isMultiple ? "Pilih beberapa cabang..." : "Pilih cabang..."}
            {...props} 
        />
    );
}
