const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchWithTenant(endpoint: string, options: any = {}) {
  let tenantId = process.env.NEXT_PUBLIC_RESTAURANT_ID || "16ae97cd-c992-4103-9e58-f7c0671cc29d";
  
  // If in browser, try to get ID from URL
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const idFromUrl = params.get('restaurantId');
    if (idFromUrl) tenantId = idFromUrl;
  }
  
  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'x-tenant-id': tenantId,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'API request failed');
  }

  return res.json();
}

export const ordersApi = {
  create: (data: any) => fetchWithTenant('/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getAll: () => fetchWithTenant('/orders'),
  updateStatus: (id: string, status: string, paymentMethod?: string) => fetchWithTenant(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, paymentMethod }),
  }),
};

export const tablesApi = {
  getAll: () => fetchWithTenant('/tables'),
  updateStatus: (id: string, status: string) => fetchWithTenant(`/tables/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
};

export const productsApi = {
  getAll: (restaurantId?: string) => {
    const query = restaurantId ? `?restaurantId=${restaurantId}` : '';
    return fetchWithTenant(`/products${query}`);
  },
  getCategories: (restaurantId?: string) => {
    const query = restaurantId ? `?restaurantId=${restaurantId}` : '';
    return fetchWithTenant(`/products/categories${query}`);
  },
};
