import React from "react";

type BusinessSelectProps = {
    businesses: { id: number; name: string }[];
    selectedBusiness?: number;
    onBusinessChange: (businessId: number) => void;
};

const BusinessSelect: React.FC<BusinessSelectProps> = ({ businesses, selectedBusiness, onBusinessChange }) => {
    return (
        <div className="mb-4">
            <label className="block text-sm font-medium">Select Business</label>
            <select
                className="mt-1 block w-full p-2 border rounded"
                value={selectedBusiness || ""}
                onChange={(e) => onBusinessChange(parseInt(e.target.value, 10))}
            >
                <option value="">Select a business</option>
                {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                        {business.name}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default BusinessSelect;
