import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  
  const ethiopianCities = [
    "Addis Ababa",
    "Adama",
    "Arba Minch",
    "Asella",
    "Assosa",
    "Axum",
    "Bahir Dar",
    "Bale Robe",
    "Bedele",
    "Bishoftu",
    "Butajira",
    "Chiro",
    "Debre Birhan",
    "Debre Markos",
    "Debre Tabor",
    "Dessie",
    "Dire Dawa",
    "Dilla",
    "Finote Selam",
    "Gambela",
    "Goba",
    "Gondar",
    "Harar",
    "Hawassa",
    "Hosaena",
    "Jijiga",
    "Jimma",
    "Kombolcha",
    "Mek'ele",
    "Metu",
    "Mojo",
    "Nekemte",
    "Shashemene",
    "Sodo",
    "Weldiya",
    "Wolaita Sodo",
    "Wolkite",
    "Zeway"
  ];
  
  const CitySelect = ({ value, onChange, disabled }: { 
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
  }) => {
    return (
      <Select
        value={value}
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full border-neutral-200 dark:border-neutral-800">
          <SelectValue placeholder="Select a city" />
        </SelectTrigger>
        <SelectContent>
          {ethiopianCities.map((city) => (
            <SelectItem key={city} value={city}>
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  };
  
  export { CitySelect, ethiopianCities };