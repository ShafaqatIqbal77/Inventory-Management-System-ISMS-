import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { createInvoice, getCustomers, getProducts } from '../services/api';
import { formatCurrency } from '../utils/helpers';

const emptyRow = { productId: '', quantity: 1 };

export default function SalesNewPage() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [customerId, setCustomerId] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [taxPercent, setTaxPercent] = useState(7);
  const [rows, setRows] = useState([emptyRow]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [customerData, productData] = await Promise.all([getCustomers(), getProducts()]);
        setCustomers(customerData);
        setProducts(productData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addRow = () => setRows((current) => [...current, { ...emptyRow }]);

  const removeRow = (index) => {
    setRows((current) => (current.length > 1 ? current.filter((_, idx) => idx !== index) : current));
  };

  const updateRow = (index, field, value) => {
    setRows((current) =>
      current.map((row, idx) =>
        idx === index ? { ...row, [field]: field === 'quantity' ? Number(value) : value } : row,
      ),
    );
  };

  const totals = useMemo(() => {
    const subtotal = rows.reduce((sum, row) => {
      const product = products.find((item) => item.id === row.productId);
      if (!product) return sum;
      return sum + product.price * Number(row.quantity || 0);
    }, 0);

    const discount = subtotal * (Number(discountPercent) / 100);
    const taxable = subtotal - discount;
    const tax = taxable * (Number(taxPercent) / 100);
    return {
      subtotal,
      discount,
      tax,
      total: taxable + tax,
    };
  }, [discountPercent, rows, products, taxPercent]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess('');
    const nextErrors = {};

    if (!customerId) nextErrors.customerId = 'Customer is required.';
    if (rows.some((row) => !row.productId)) nextErrors.items = 'Each row must select a product.';
    if (rows.some((row) => !Number(row.quantity) || Number(row.quantity) <= 0)) nextErrors.items = 'Each product quantity must be greater than zero.';

    rows.forEach((row, index) => {
      const selectedProduct = products.find((product) => product.id === row.productId);
      if (selectedProduct && Number(row.quantity) > Number(selectedProduct.quantity)) {
        nextErrors[`row-${index}`] = `Only ${selectedProduct.quantity} units available for ${selectedProduct.name}.`;
      }
    });

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    try {
      const invoiceItems = rows.map((row) => {
        const product = products.find((item) => item.id === row.productId);
        return {
          productId: row.productId,
          quantity: Number(row.quantity),
          price: Number(product.price),
        };
      });

      await createInvoice({
        customerId,
        discountPercent: Number(discountPercent),
        taxPercent: Number(taxPercent),
        items: invoiceItems,
      });

      setSuccess('Invoice created successfully.');
      setCustomerId('');
      setDiscountPercent(0);
      setTaxPercent(7);
      setRows([emptyRow]);
      setErrors({});
    } catch (error) {
      setErrors({ submit: error.message || 'Invoice creation failed.' });
    }
  };

  if (loading) {
    return (
      <div className="centered-box">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header mb-4">
        <div>
          <p className="eyebrow">Sales</p>
          <h3 className="mb-0">New Invoice</h3>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          {success && <Alert variant="success">{success}</Alert>}
          {errors.submit && <Alert variant="danger">{errors.submit}</Alert>}

          <Form onSubmit={handleSubmit} noValidate>
            <Row className="g-3 mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Customer</Form.Label>
                  <Form.Select
                    value={customerId}
                    onChange={(event) => setCustomerId(event.target.value)}
                    isInvalid={!!errors.customerId}
                  >
                    <option value="">Select customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.customerId}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Discount %</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent}
                    onChange={(event) => setDiscountPercent(event.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Tax %</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="100"
                    value={taxPercent}
                    onChange={(event) => setTaxPercent(event.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            {rows.map((row, index) => {
              const product = products.find((item) => item.id === row.productId);
              return (
                <Row key={`${index}-${row.productId}`} className="g-3 align-items-end mb-3">
                  <Col md={5}>
                    <Form.Group>
                      <Form.Label>Product</Form.Label>
                      <Form.Select
                        value={row.productId}
                        onChange={(event) => updateRow(index, 'productId', event.target.value)}
                        isInvalid={!!errors.items && !row.productId}
                      >
                        <option value="">Select product</option>
                        {products.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.quantity} in stock)
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Qty</Form.Label>
                      <Form.Control
                        type="number"
                        min="1"
                        value={row.quantity}
                        onChange={(event) => updateRow(index, 'quantity', event.target.value)}
                        isInvalid={!!errors[`row-${index}`]}
                      />
                      {errors[`row-${index}`] && (
                        <div className="invalid-feedback d-block">{errors[`row-${index}`]}</div>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <div className="fw-semibold">
                      {product ? formatCurrency(product.price * Number(row.quantity || 0)) : '—'}
                    </div>
                  </Col>
                  <Col md={2} className="text-end">
                    <Button variant="outline-danger" onClick={() => removeRow(index)}>
                      <FiTrash2 />
                    </Button>
                  </Col>
                </Row>
              );
            })}

            <div className="d-flex justify-content-between align-items-center mb-3">
              <Button variant="outline-primary" onClick={addRow}>
                <FiPlus className="me-2" />
                Add Product Row
              </Button>
            </div>

            <Card className="bg-light border-0">
              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <strong>{formatCurrency(totals.subtotal)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Discount</span>
                  <strong>-{formatCurrency(totals.discount)}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax</span>
                  <strong>{formatCurrency(totals.tax)}</strong>
                </div>
                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Total</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </Card.Body>
            </Card>

            <div className="mt-4 text-end">
              <Button type="submit" variant="success">Create Invoice</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
