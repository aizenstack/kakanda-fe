import React, { useState, useEffect } from 'react';
import { AutoComplete } from 'primereact/autocomplete';
import { masterService } from '../services/masterService';

export default function MasterAutocomplete({ 
    type = 'branch', // 'branch', 'warehouse', 'company'
    multiple = false, 
    value, 
    onChange, 
    placeholder,
    className,
    style,
    dropdown = true,
    labelField = 'name',
    ...props 
}) {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let res;
                switch (type) {
                    case 'branch':
                        res = await masterService.getBranches();
                        break;
                    case 'warehouse':
                        res = await masterService.getWarehouses();
                        break;
                    case 'company':
                        res = await masterService.getCompanies();
                        break;
                    default:
                        res = { data: { data: [] } };
                }
                setItems(res.data.data || []);
            } catch (err) {
                console.error(`Failed to fetch ${type} data`, err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [type]);

    const search = (event) => {
        const query = (event.query || "").toLowerCase();
        const filtered = items.filter(item => {
            const label = item[labelField] || "";
            return label.toLowerCase().includes(query);
        });
        setFilteredItems(filtered);
    };

    return (
        <span className="p-fluid">
            <AutoComplete
                value={value}
                suggestions={filteredItems}
                completeMethod={search}
                field={labelField}
                multiple={multiple}
                dropdown={dropdown}
                placeholder={placeholder || `Pilih ${type}...`}
                onChange={onChange}
                className={className}
                style={style}
                loading={loading}
                loadingIcon="pi pi-spin pi-spinner"
                {...props}
            />
        </span>
    );
}
