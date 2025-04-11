export const locationOptions = [
  { value: 'manchester', label: 'Manchester' },
  { value: 'hartford', label: 'Hartford' },
  { value: 'newHaven', label: 'New Haven' },
  { value: 'stamford', label: 'Stamford' },
  { value: 'bridgeport', label: 'Bridgeport' }
];

export const seasonOptions = [
  { value: 'spring', label: 'Spring' },
  { value: 'summer', label: 'Summer' },
  { value: 'fall', label: 'Fall' },
  { value: 'winter', label: 'Winter' }
];

export const monthOptions = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: new Date(0, i).toLocaleString('default', { month: 'long' })
}));

export const bedroomOptions = [
  { value: 'studio', label: 'Studio' },
  { value: '1br', label: '1 Bedroom' },
  { value: '2br', label: '2 Bedrooms' },
  { value: '3br+', label: '3+ Bedrooms' }
];

export const numberOfBedroomsOptions = [
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5+', label: '5+' }
];

export const propertySizeOptions = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' }
];