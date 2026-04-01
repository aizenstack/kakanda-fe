import React from 'react';
import MasterAutocomplete from './MasterAutocomplete';

export default function SelectWarehouseComponent({ multiple, single, ...props }) {
    const isMultiple = multiple !== undefined ? true : (single !== undefined ? false : false);
    return (
        <MasterAutocomplete 
            type="warehouse" 
            multiple={isMultiple} 
            placeholder={isMultiple ? "Pilih beberapa gudang..." : "Pilih gudang..."}
            {...props} 
        />
    );
}
