import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Form, Modal, Spinner, Table } from 'react-bootstrap';
import { FiEdit, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import {
  addProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../services/api';
import { formatCurrency } from '../utils/helpers';

const emptyForm = {
  id: '',
  name: '',
  category: '',
  price: '',
  quantity: '',
};

export default function ProductsPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword),
    );
  }, [search, products]);

  const validateForm = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required.';
    if (!form.category.trim()) nextErrors.category = 'Category is required.';
    if (!form.price || Number(form.price) <= 0) nextErrors.price = 'Price must be greater than zero.';
    if (form.quantity === '' || Number(form.quantity) < 0) nextErrors.quantity = 'Quantity cannot be negative.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, form);
      } else {
        await addProduct(form);
      }
      setShowModal(false);
      await loadProducts();
    } catch (error) {
      setErrors({ form: error.message || 'Unable to save product.' });
    }
  };

  const handleDelete = async (productId) => {
    if (user?.role !== 'admin') return;
    try {
      await deleteProduct(productId);
      await loadProducts();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="page-header mb-4">
        <div>
          <p className="eyebrow">Catalog</p>
          <h3 className="mb-0">Products</h3>
        </div>
        <Button variant="primary" onClick={openAddModal}>
          <FiPlus className="me-2" />
          Add Product
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <Form.Control
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name or category"
            className="mb-3"
          />

          {loading ? (
            <div className="centered-box"><Spinner animation="border" /></div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">No products match your search.</div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th className="text-end">Price</th>
                    <th className="text-end">Quantity</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td className="text-end">{formatCurrency(product.price)}</td>
                      <td className="text-end">
                        <span className={product.quantity <= 5 ? 'text-danger fw-semibold' : ''}>
                          {product.quantity}
                        </span>
                      </td>
                      <td className="text-end">
                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => openEditModal(product)}>
                          <FiEdit />
                        </Button>
                        {user?.role === 'admin' && (
                          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(product.id)}>
                            <FiTrash2 />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? 'Edit Product' : 'Add Product'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit} noValidate>
          <Modal.Body>
            {errors.form && <Alert variant="danger">{errors.form}</Alert>}
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Category</Form.Label>
              <Form.Control
                value={form.category}
                onChange={(event) => setForm({ ...form, category: event.target.value })}
                isInvalid={!!errors.category}
              />
              <Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback>
            </Form.Group>

            <div className="row g-3">
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Price</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) => setForm({ ...form, price: event.target.value })}
                    isInvalid={!!errors.price}
                  />
                  <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group>
                  <Form.Label>Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={form.quantity}
                    onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                    isInvalid={!!errors.quantity}
                  />
                  <Form.Control.Feedback type="invalid">{errors.quantity}</Form.Control.Feedback>
                </Form.Group>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingProduct ? 'Save Changes' : 'Add Product'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
