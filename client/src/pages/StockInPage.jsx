import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { createStockEntry, getProducts, getSuppliers } from '../services/api';

const today = new Date().toISOString().split('T')[0];

export default function StockInPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    supplierId: '',
    productId: '',
    quantity: '',
    date: today,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [supplierData, productData] = await Promise.all([getSuppliers(), getProducts()]);
        setSuppliers(supplierData);
        setProducts(productData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const validate = () => {
    const nextErrors = {};
    if (!form.supplierId) nextErrors.supplierId = 'Supplier is required.';
    if (!form.productId) nextErrors.productId = 'Product is required.';
    if (!form.quantity || Number(form.quantity) <= 0) nextErrors.quantity = 'Quantity must be greater than zero.';
    if (!form.date) nextErrors.date = 'Date is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccess('');
    if (!validate()) return;

    try {
      await createStockEntry(form);
      setSuccess('Stock has been updated successfully.');
      setForm({ ...form, productId: '', quantity: '', date: today });
    } catch (error) {
      setErrors({ submit: error.message || 'Unable to save stock entry.' });
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
          <p className="eyebrow">Inventory</p>
          <h3 className="mb-0">Stock In</h3>
        </div>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          {success && <Alert variant="success">{success}</Alert>}
          {errors.submit && <Alert variant="danger">{errors.submit}</Alert>}

          <Form onSubmit={handleSubmit} noValidate>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Supplier</Form.Label>
                  <Form.Select
                    value={form.supplierId}
                    onChange={(event) => setForm({ ...form, supplierId: event.target.value })}
                    isInvalid={!!errors.supplierId}
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.supplierId}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Product</Form.Label>
                  <Form.Select
                    value={form.productId}
                    onChange={(event) => setForm({ ...form, productId: event.target.value })}
                    isInvalid={!!errors.productId}
                  >
                    <option value="">Select product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">{errors.productId}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                    isInvalid={!!errors.quantity}
                  />
                  <Form.Control.Feedback type="invalid">{errors.quantity}</Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label>Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={form.date}
                    onChange={(event) => setForm({ ...form, date: event.target.value })}
                    isInvalid={!!errors.date}
                  />
                  <Form.Control.Feedback type="invalid">{errors.date}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <div className="mt-4 text-end">
              <Button type="submit" variant="primary">Save Stock Entry</Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}
