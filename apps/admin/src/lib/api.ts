const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchWithTenant(endpoint: string, options: any = {}) {
  let tenantId = process.env.NEXT_PUBLIC_RESTAURANT_ID || "16ae97cd-c992-4103-9e58-f7c0671cc29d";
  
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
    const error = await res.json().catch(() => ({ message: 'API request failed' }));
    throw new Error(error.message || 'API request failed');
  }

  return res.json();
}

export const tablesApi = {
  getAll: () => fetchWithTenant('/tables'),
  create: (data: any) => fetchWithTenant('/tables', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchWithTenant(`/tables/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchWithTenant(`/tables/${id}`, {
    method: 'DELETE',
  }),
};

export const categoriesApi = {
  getAll: () => fetchWithTenant('/products/categories'),
  create: (data: any) => fetchWithTenant('/products/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchWithTenant(`/products/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchWithTenant(`/products/categories/${id}`, {
    method: 'DELETE',
  }),
};

export const productsApi = {
  getAll: () => fetchWithTenant('/products'),
  create: (data: any) => fetchWithTenant('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id: string, data: any) => fetchWithTenant(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  delete: (id: string) => fetchWithTenant(`/products/${id}`, {
    method: 'DELETE',
  }),
  bulkDelete: (ids: string[]) => fetchWithTenant('/products/bulk-delete', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  }),
};
export const ordersApi = {
  getAll: () => fetchWithTenant('/orders'),
  updateStatus: (id: string, status: string) => fetchWithTenant(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
};

export const analyticsApi = {
  getSummary: () => fetchWithTenant('/analytics/summary'),
  getSalesTrend: () => fetchWithTenant('/analytics/sales-trend'),
  getCategorySplit: () => fetchWithTenant('/analytics/category-split'),
  getRecentItems: () => fetchWithTenant('/analytics/recent-items'),
};
