import React, { useState, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { masterService } from '../services/masterService';

const MasterDropdown = ({ type, value, onChange, placeholder, className }) => {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                let res;
                switch (type) {
                    case 'category':
                        res = await masterService.getCategories();
                        break;
                    case 'brand':
                        res = await masterService.getBrands();
                        break;
                    case 'supplier':
                        res = await masterService.getSuppliers();
                        break;
                    default:
                        res = { data: { data: [] } };
                }

                const data = res.data.data || [];
                const mapped = data.map(item => ({
                    label: item.name,
                    value: item.id
                }));
                setOptions(mapped);
            } catch (err) {
                console.error(`Failed to fetch ${type}:`, err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [type]);

    return (
        <Dropdown
            value={value}
            options={options}
            onChange={(e) => onChange(e.value)}
            placeholder={loading ? "Memuat..." : placeholder}
            className={className}
            loading={loading}
            filter
            showClear
            resetFilterOnHide
        />
    );
};

export default MasterDropdown;
