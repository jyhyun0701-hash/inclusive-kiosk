import type { Certificate } from '../types/kiosk';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export async function fetchAllCertificates(): Promise<Certificate[]> {
  const res = await fetch(`${BASE_URL}/api/certificates`);
  if (!res.ok) throw new Error(`증명서 조회 실패: ${res.status}`);
  return res.json();
}

export async function fetchCertificatesByCategory(category: string): Promise<Certificate[]> {
  const params = new URLSearchParams({ category });
  const res = await fetch(`${BASE_URL}/api/certificates?${params}`);
  if (!res.ok) throw new Error(`카테고리 조회 실패: ${res.status}`);
  return res.json();
}
