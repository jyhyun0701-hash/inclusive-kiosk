import axios from 'axios';
import type { Certificate } from '../types/certificate';

const BASE_URL = 'http://localhost:8080/api';

export const fetchCertificates = async (): Promise<Certificate[]> => {
  const { data } = await axios.get<Certificate[]>(`${BASE_URL}/certificates`);
  return data;
};

export const fetchByCategory = async (category: string): Promise<Certificate[]> => {
  const { data } = await axios.get<Certificate[]>(
    `${BASE_URL}/certificates/category/${category}`
  );
  return data;
};
