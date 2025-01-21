// @+types/features/tenant.ts

interface Business {
  id: number;
  ownerId: number;
  name: string;
  address: string;
  contactNumber: string;
  registrationNumber: string;
  isActive: boolean;
  locations: Location[];
}

// components/features/dashboard/inventory/Locations.tsx
export function Locations() {
  const { currentBusiness } = useTenant();
  const { can } = usePermissions();

  const locationColumns = [
    { key: "name", label: "Name" },
    { key: "address", label: "Address" },
    { key: "contactNumber", label: "Contact" },
    // ... other columns
  ];

  return (
    <DataTable
      data={currentBusiness.locations}
      columns={locationColumns}
      actions={
        can("manage_locations") ? ["create", "edit", "delete"] : ["view"]
      }
    />
  );
}
