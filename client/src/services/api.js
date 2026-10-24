const STORAGE_KEYS = {
  users: 'ipms_users',
  products: 'ipms_products',
  suppliers: 'ipms_suppliers',
  customers: 'ipms_customers',
  invoices: 'ipms_invoices',
  stockEntries: 'ipms_stock_entries',
};

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

const readStore = (key) => {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : [];
};

const writeStore = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

const seedData = {
  users: [
    { id: 'u-admin', name: 'System Admin', email: 'admin@ipms.com', password: 'admin123', role: 'admin' },
    { id: 'u-manager', name: 'Store Manager', email: 'manager@ipms.com', password: 'manager123', role: 'manager' },
    { id: 'u-sales', name: 'Sales Agent', email: 'salesman@ipms.com', password: 'sales123', role: 'salesman' },
  ],
  products: [
    { id: 'p-1', name: 'Laptop Pro 14', category: 'Electronics', price: 1200, quantity: 18 },
    { id: 'p-2', name: 'Office Chair', category: 'Furniture', price: 180, quantity: 9 },
    { id: 'p-3', name: 'Wireless Mouse', category: 'Electronics', price: 35, quantity: 42 },
    { id: 'p-4', name: 'Desk Lamp', category: 'Office', price: 55, quantity: 16 },
    { id: 'p-5', name: 'Notebook Pro', category: 'Stationery', price: 12, quantity: 60 },
    { id: 'p-6', name: 'Monitor 27"', category: 'Electronics', price: 310, quantity: 7 },
    { id: 'p-7', name: 'Printer Ink', category: 'Supplies', price: 48, quantity: 22 },
    { id: 'p-8', name: 'Executive Desk', category: 'Furniture', price: 420, quantity: 5 },
    { id: 'p-9', name: 'USB-C Hub', category: 'Electronics', price: 70, quantity: 31 },
    { id: 'p-10', name: 'Whiteboard Marker', category: 'Office', price: 8, quantity: 75 },
  ],
  suppliers: [
    { id: 's-1', name: 'Global Tech Supply', phone: '+1 202-555-0141', address: '210 Harbor Avenue, New York' },
    { id: 's-2', name: 'Northwood Office Mart', phone: '+1 202-555-0119', address: '18 Maple Street, Chicago' },
    { id: 's-3', name: 'Prime Furnishings', phone: '+1 202-555-0148', address: '74 Cedar Lane, Austin' },
  ],
  customers: [
    { id: 'c-1', name: 'Alpha Solutions', phone: '+1 202-555-0102', address: '100 Market Rd, Seattle' },
    { id: 'c-2', name: 'Harbor Retail', phone: '+1 202-555-0140', address: '55 River Way, Miami' },
    { id: 'c-3', name: 'Summit Clinics', phone: '+1 202-555-0133', address: '20 Hill Crest, Denver' },
    { id: 'c-4', name: 'Northside Stores', phone: '+1 202-555-0180', address: '88 South Ave, Atlanta' },
  ],
  invoices: [
    {
      id: 'inv-1001',
      customerId: 'c-1',
      customerName: 'Alpha Solutions',
      createdAt: '2026-10-02T11:20:00.000Z',
      items: [
        { productId: 'p-3', name: 'Wireless Mouse', quantity: 2, price: 35 },
        { productId: 'p-5', name: 'Notebook Pro', quantity: 8, price: 12 },
      ],
      subtotal: 232,
      discountPercent: 5,
      taxPercent: 7,
      total: 239.68,
    },
    {
      id: 'inv-1002',
      customerId: 'c-2',
      customerName: 'Harbor Retail',
      createdAt: '2026-10-12T14:00:00.000Z',
      items: [
        { productId: 'p-1', name: 'Laptop Pro 14', quantity: 1, price: 1200 },
        { productId: 'p-9', name: 'USB-C Hub', quantity: 3, price: 70 },
      ],
      subtotal: 1410,
      discountPercent: 0,
      taxPercent: 7,
      total: 1506.7,
    },
    {
      id: 'inv-1003',
      customerId: 'c-3',
      customerName: 'Summit Clinics',
      createdAt: '2026-10-18T09:45:00.000Z',
      items: [
        { productId: 'p-4', name: 'Desk Lamp', quantity: 4, price: 55 },
      ],
      subtotal: 220,
      discountPercent: 10,
      taxPercent: 5,
      total: 220.5,
    },
  ],
};

const ensureSeedData = () => {
  Object.entries(seedData).forEach(([key, value]) => {
    const storageKey = STORAGE_KEYS[key];
    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(storageKey, JSON.stringify(value));
    }
  });
};

export const getProducts = async () => {
  await delay();
  ensureSeedData();
  return [...readStore(STORAGE_KEYS.products)].sort((a, b) => a.name.localeCompare(b.name));
};

export const addProduct = async (product) => {
  await delay();
  ensureSeedData();
  const products = readStore(STORAGE_KEYS.products);
  const newItem = {
    id: `p-${Date.now()}`,
    name: product.name,
    category: product.category,
    price: Number(product.price),
    quantity: Number(product.quantity),
  };
  const updated = [...products, newItem];
  writeStore(STORAGE_KEYS.products, updated);
  return newItem;
};

export const updateProduct = async (id, product) => {
  await delay();
  const products = readStore(STORAGE_KEYS.products);
  const updated = products.map((item) =>
    item.id === id
      ? {
          ...item,
          name: product.name,
          category: product.category,
          price: Number(product.price),
          quantity: Number(product.quantity),
        }
      : item,
  );
  writeStore(STORAGE_KEYS.products, updated);
  return updated.find((item) => item.id === id);
};

export const deleteProduct = async (id) => {
  await delay();
  const products = readStore(STORAGE_KEYS.products).filter((item) => item.id !== id);
  writeStore(STORAGE_KEYS.products, products);
  return true;
};

export const getSuppliers = async () => {
  await delay();
  ensureSeedData();
  return [...readStore(STORAGE_KEYS.suppliers)].sort((a, b) => a.name.localeCompare(b.name));
};

export const addSupplier = async (supplier) => {
  await delay();
  const suppliers = readStore(STORAGE_KEYS.suppliers);
  const newSupplier = {
    id: `s-${Date.now()}`,
    name: supplier.name,
    phone: supplier.phone,
    address: supplier.address,
  };
  suppliers.push(newSupplier);
  writeStore(STORAGE_KEYS.suppliers, suppliers);
  return newSupplier;
};

export const updateSupplier = async (id, supplier) => {
  await delay();
  const suppliers = readStore(STORAGE_KEYS.suppliers).map((item) =>
    item.id === id
      ? {
          ...item,
          name: supplier.name,
          phone: supplier.phone,
          address: supplier.address,
        }
      : item,
  );
  writeStore(STORAGE_KEYS.suppliers, suppliers);
  return suppliers.find((item) => item.id === id);
};

export const getCustomers = async () => {
  await delay();
  ensureSeedData();
  return [...readStore(STORAGE_KEYS.customers)].sort((a, b) => a.name.localeCompare(b.name));
};

export const addCustomer = async (customer) => {
  await delay();
  const customers = readStore(STORAGE_KEYS.customers);
  const newCustomer = {
    id: `c-${Date.now()}`,
    name: customer.name,
    phone: customer.phone,
    address: customer.address,
  };
  customers.push(newCustomer);
  writeStore(STORAGE_KEYS.customers, customers);
  return newCustomer;
};

export const updateCustomer = async (id, customer) => {
  await delay();
  const customers = readStore(STORAGE_KEYS.customers).map((item) =>
    item.id === id
      ? {
          ...item,
          name: customer.name,
          phone: customer.phone,
          address: customer.address,
        }
      : item,
  );
  writeStore(STORAGE_KEYS.customers, customers);
  return customers.find((item) => item.id === id);
};

export const registerUser = async ({ name, email, password, role = 'salesman' }) => {
  await delay();
  ensureSeedData();
  const users = readStore(STORAGE_KEYS.users);
  const lowerEmail = String(email).trim().toLowerCase();

  if (users.some((user) => user.email.toLowerCase() === lowerEmail)) {
    throw new Error('A user with this email already exists.');
  }

  const user = {
    id: `user-${Date.now()}`,
    name: name.trim(),
    email: lowerEmail,
    password,
    role,
  };

  users.push(user);
  writeStore(STORAGE_KEYS.users, users);

  const { password: _password, ...safeUser } = user;
  return safeUser;
};

export const loginUser = async ({ email, password }) => {
  await delay();
  ensureSeedData();
  const users = readStore(STORAGE_KEYS.users);
  const user = users.find(
    (item) => item.email.toLowerCase() === String(email).trim().toLowerCase() && item.password === password,
  );

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  const { password: _password, ...safeUser } = user;
  return safeUser;
};

export const createStockEntry = async ({ supplierId, productId, quantity, date }) => {
  await delay();
  const products = readStore(STORAGE_KEYS.products);
  const product = products.find((item) => item.id === productId);
  const supplier = readStore(STORAGE_KEYS.suppliers).find((item) => item.id === supplierId);

  if (!product) {
    throw new Error('Please select a valid product.');
  }
  if (!supplier) {
    throw new Error('Please select a supplier.');
  }

  const parsedQuantity = Number(quantity);
  if (!parsedQuantity || parsedQuantity <= 0) {
    throw new Error('Quantity must be greater than zero.');
  }

  product.quantity = Number(product.quantity) + parsedQuantity;

  const stockEntries = readStore(STORAGE_KEYS.stockEntries);
  const newEntry = {
    id: `stock-${Date.now()}`,
    supplierId,
    supplierName: supplier.name,
    productId,
    productName: product.name,
    quantity: parsedQuantity,
    date: date || new Date().toISOString(),
  };

  stockEntries.push(newEntry);
  writeStore(STORAGE_KEYS.products, products);
  writeStore(STORAGE_KEYS.stockEntries, stockEntries);
  return newEntry;
};

export const createInvoice = async ({ customerId, discountPercent = 0, taxPercent = 0, items }) => {
  await delay();
  const customers = readStore(STORAGE_KEYS.customers);
  const customer = customers.find((item) => item.id === customerId);

  if (!customer) {
    throw new Error('Please select a customer.');
  }

  if (!items || items.length === 0) {
    throw new Error('Add at least one product.');
  }

  const products = readStore(STORAGE_KEYS.products);
  const validatedItems = items.map((entry) => {
    const product = products.find((item) => item.id === entry.productId);
    if (!product) {
      throw new Error('One of the products is invalid.');
    }
    const quantity = Number(entry.quantity);
    if (!quantity || quantity <= 0) {
      throw new Error(`Quantity for ${product.name} must be greater than zero.`);
    }
    if (product.quantity < quantity) {
      throw new Error(`Only ${product.quantity} units left for ${product.name}.`);
    }

    return {
      productId: product.id,
      name: product.name,
      quantity,
      price: Number(entry.price),
    };
  });

  const subtotal = validatedItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const discountAmount = subtotal * (Number(discountPercent) / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * (Number(taxPercent) / 100);
  const total = taxableAmount + taxAmount;

  const invoice = {
    id: `inv-${Date.now()}`,
    customerId,
    customerName: customer.name,
    createdAt: new Date().toISOString(),
    items: validatedItems,
    subtotal: Number(subtotal.toFixed(2)),
    discountPercent: Number(discountPercent),
    taxPercent: Number(taxPercent),
    total: Number(total.toFixed(2)),
  };

  const updatedProducts = products.map((product) => {
    const matchingItem = validatedItems.find((entry) => entry.productId === product.id);
    if (!matchingItem) {
      return product;
    }
    return {
      ...product,
      quantity: Number(product.quantity) - Number(matchingItem.quantity),
    };
  });

  const invoices = readStore(STORAGE_KEYS.invoices);
  invoices.unshift(invoice);

  writeStore(STORAGE_KEYS.products, updatedProducts);
  writeStore(STORAGE_KEYS.invoices, invoices);
  return invoice;
};

export const getInvoices = async () => {
  await delay();
  ensureSeedData();
  return [...readStore(STORAGE_KEYS.invoices)].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );
};

export const getDashboardStats = async () => {
  await delay();
  const products = await getProducts();
  const invoices = await getInvoices();

  const totalSales = invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);
  const lowStockItems = products.filter((product) => Number(product.quantity) <= 5);

  const salesTrend = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const monthLabel = date.toLocaleString('default', { month: 'short' });
    const monthValue = invoices
      .filter((invoice) => {
        const invoiceDate = new Date(invoice.createdAt);
        return (
          invoiceDate.getMonth() === date.getMonth() &&
          invoiceDate.getFullYear() === date.getFullYear()
        );
      })
      .reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);

    return { label: monthLabel, sales: monthValue };
  });

  return {
    totalSales,
    productCount: products.length,
    lowStockCount: lowStockItems.length,
    lowStockItems,
    salesTrend,
    recentInvoices: invoices.slice(0, 5),
  };
};
