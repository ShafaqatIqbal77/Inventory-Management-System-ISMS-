const SESSION_KEY = 'ipms_session';
const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const readSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
};

const writeSession = (session) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

const request = async (endpoint, options = {}) => {
  const session = readSession();
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (session?.token) {
    headers.set('Authorization', `Bearer ${session.token}`);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body,
    });

    const text = await response.text();
    let payload = null;

    if (text) {
      try {
        payload = JSON.parse(text);
      } catch (error) {
        payload = text;
      }
    }

    if (!response.ok) {
      const message = payload && typeof payload === 'object' && payload.message
        ? payload.message
        : 'Request failed.';

      if (response.status === 401) {
        clearSession();
        if (!window.location.pathname.endsWith('/login') && !window.location.pathname.endsWith('/register')) {
          window.location.href = '/login';
        }
      }

      const error = new Error(message);
      error.status = response.status;
      throw error;
    }

    return payload;
  } catch (error) {
    if (error instanceof TypeError) {
      const networkError = new Error('Unable to reach the server. Please check that the backend is running.');
      networkError.status = 503;
      throw networkError;
    }

    throw error;
  }
};

export const getMe = async () => {
  const session = readSession();
  if (!session?.token) {
    throw new Error('Not authenticated.');
  }

  try {
    return await request('/auth/me');
  } catch (error) {
    if (error.status === 404 && session.user) {
      return session.user;
    }
    throw error;
  }
};

export const getProducts = async () => {
  const data = await request('/products');
  return Array.isArray(data) ? [...data].sort((a, b) => a.name.localeCompare(b.name)) : [];
};

export const addProduct = async (product) => {
  return request('/products', {
    method: 'POST',
    body: {
      name: product.name,
      category: product.category,
      price: Number(product.price),
      quantity: Number(product.quantity),
      lowStockLimit: Number(product.lowStockLimit ?? 5),
    },
  });
};

export const updateProduct = async (id, product) => {
  return request(`/products/${id}`, {
    method: 'PUT',
    body: {
      name: product.name,
      category: product.category,
      price: Number(product.price),
      quantity: Number(product.quantity),
      lowStockLimit: Number(product.lowStockLimit ?? 5),
    },
  });
};

export const deleteProduct = async (id) => {
  await request(`/products/${id}`, { method: 'DELETE' });
  return true;
};

export const getSuppliers = async () => {
  const data = await request('/suppliers');
  return Array.isArray(data) ? [...data].sort((a, b) => a.name.localeCompare(b.name)) : [];
};

export const addSupplier = async (supplier) => {
  return request('/suppliers', {
    method: 'POST',
    body: {
      name: supplier.name,
      phone: supplier.phone,
      address: supplier.address,
    },
  });
};

export const updateSupplier = async (id, supplier) => {
  return request(`/suppliers/${id}`, {
    method: 'PUT',
    body: {
      name: supplier.name,
      phone: supplier.phone,
      address: supplier.address,
    },
  });
};

export const getCustomers = async () => {
  const data = await request('/customers');
  return Array.isArray(data) ? [...data].sort((a, b) => a.name.localeCompare(b.name)) : [];
};

export const addCustomer = async (customer) => {
  return request('/customers', {
    method: 'POST',
    body: {
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
    },
  });
};

export const updateCustomer = async (id, customer) => {
  return request(`/customers/${id}`, {
    method: 'PUT',
    body: {
      name: customer.name,
      phone: customer.phone,
      address: customer.address,
    },
  });
};

export const registerUser = async ({ name, email, password }) => {
  return request('/auth/register', {
    method: 'POST',
    body: {
      name,
      email,
      password,
    },
  });
};

export const loginUser = async ({ email, password }) => {
  return request('/auth/login', {
    method: 'POST',
    body: {
      email,
      password,
    },
  });
};

export const createStockEntry = async ({ supplierId, productId, quantity, date }) => {
  return request('/stock/in', {
    method: 'POST',
    body: {
      supplier: supplierId,
      product: productId,
      quantity,
      date,
    },
  });
};

export const createInvoice = async ({ customerId, discountPercent = 0, taxPercent = 0, items }) => {
  return request('/invoices', {
    method: 'POST',
    body: {
      customerId,
      discountPercent,
      taxPercent,
      items,
    },
  });
};

export const getInvoices = async () => {
  const data = await request('/invoices');
  return Array.isArray(data) ? [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];
};

export const getDashboardStats = async () => {
  return request('/dashboard/stats');
};

export { clearSession, readSession, writeSession };
