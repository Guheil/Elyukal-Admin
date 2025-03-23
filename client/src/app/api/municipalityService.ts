// src/app/api/municipalityService.ts
import axios from 'axios';

export interface Municipality {
  id: number;
  name: string;
}

export const fetchMunicipalities = async (): Promise<Municipality[]> => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/fetch_municipalities`);
    return response.data;
  } catch (error) {
    console.error('Error fetching municipalities:', error);
    return [];
  }
};