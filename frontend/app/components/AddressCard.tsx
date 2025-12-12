"use client";

interface AddressCardProps {
  address: {
    id: string;
    street: string;
    city: string;
    zipCode: string;
    isDefault: boolean;
  };
  onSelect?: () => void;
  selected?: boolean;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
}

export default function AddressCard({ 
  address, 
  onSelect, 
  selected = false,
  showActions = false,
  onEdit,
  onDelete,
  onSetDefault 
}: AddressCardProps) {
  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        selected ? 'border-blue-500 border-2 bg-blue-50' : 'hover:border-gray-300'
      } ${onSelect ? 'hover:shadow-md' : ''}`}
      onClick={onSelect}
    >
      {address.isDefault && (
        <span className="inline-block bg-blue-500 text-white px-2 py-1 rounded text-xs mb-2">
          Default
        </span>
      )}
      
      <div className="font-medium mb-1">{address.street}</div>
      <div className="text-gray-600">
        {address.city}, {address.zipCode}
      </div>
      
      {showActions && (
        <div className="mt-3 pt-3 border-t flex justify-between">
          <div className="space-x-3">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.();
              }}
              className="text-blue-500 hover:text-blue-700 text-sm"
            >
              Edit
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.();
              }}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Delete
            </button>
          </div>
          
          {!address.isDefault && onSetDefault && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSetDefault();
              }}
              className="text-green-600 hover:text-green-800 text-sm"
            >
              Set as Default
            </button>
          )}
        </div>
      )}
    </div>
  );
}