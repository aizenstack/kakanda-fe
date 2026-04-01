import { icons } from 'lucide-react';

const Icon = ({ name, color, size = 18, className = '', ...props }) => {
    const pascalName = name
        .split('-')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join('');

    const LucideIcon = icons[pascalName] || icons[name];

    if (!LucideIcon) {
        console.warn(`Icon "${name}" (Pascal: "${pascalName}") not found in lucide-react`);
        return null;
    }

    return (
        <LucideIcon
            color={color}
            size={size}
            className={className}
            strokeWidth={2}
            {...props}
        />
    );
};

export default Icon;
