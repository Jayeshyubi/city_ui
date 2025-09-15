import { City } from '../types';

export const INDIAN_CITIES: Omit<City, 'id'>[] = [
  { name: 'Mumbai', position: { x: 300, y: 400 } },
  { name: 'Delhi', position: { x: 500, y: 200 } },
  { name: 'Bangalore', position: { x: 400, y: 600 } },
  { name: 'Hyderabad', position: { x: 450, y: 550 } },
  { name: 'Ahmedabad', position: { x: 200, y: 350 } },
  { name: 'Chennai', position: { x: 550, y: 700 } },
  { name: 'Kolkata', position: { x: 700, y: 300 } },
  { name: 'Pune', position: { x: 350, y: 450 } },
  { name: 'Jaipur', position: { x: 300, y: 250 } },
  { name: 'Lucknow', position: { x: 450, y: 250 } }
];
