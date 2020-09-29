import React from 'react'

import { ChakraMultipleCreate } from 'chakra-ui-autocomplete'


// import { CreateablePicker, Item } from "./CreateablePicker";

export interface Item {
  label: string;
  value: string;
}


const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "mango", label: "Mango" },
  { value: "kiwi", label: "Kiwi" }
];

export default function App() {
  const [pickerItems, setPickerItems] = React.useState(fruits);
  const [selectedItems, setSelectedItems] = React.useState<Item[]>([]);

  const handleCreateItem = (item: Item) => {
    setPickerItems((curr) => [...curr, item]);
    setSelectedItems((curr) => [...curr, item]);
  };

  const handleSelectedItemsChange = (selectedItems?: Item[]) => {
    if (selectedItems) {
      setSelectedItems(selectedItems);
    }
  };

  return (
    <div className="h-screen bg-gray-100 pt-10">
      <div className="max-w-md w-full mx-auto">
        <ChakraMultipleCreate
          placeholder="Type name of fruit"
          onCreateItem={handleCreateItem}
          items={pickerItems}
          selectedItems={selectedItems}
          onSelectedItemsChange={(changes) =>
            handleSelectedItemsChange(changes.selectedItems)
          }
        />
      </div>
    </div>
  );
}