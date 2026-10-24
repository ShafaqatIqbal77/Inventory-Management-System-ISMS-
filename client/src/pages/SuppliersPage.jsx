import { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Modal, Spinner, Table } from 'react-bootstrap';
import { FiEdit, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { addSupplier, getSuppliers, updateSupplier } from '../services/api';

const emptyForm = {
  id: '',
  name: '',
  phone: '',
  address: '',
};

export default function SuppliersPage() {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const data = await getSuppliers();
      setSuppliers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const validateForm = () => {
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required.';
    if (!form.phone.trim()) nextErrors.phone = 'Phone is required.';
    if (!form.address.trim()) nextErrors.address = 'Address is required.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const openAddModal = () => {
    setEditingSupplier(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setForm({
      id: supplier.id,
      name: supplier.name,
      phone: supplier.phone,
      address: supplier.address,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, form);
      } else {
        await addSupplier(form);
      }
      setShowModal(false);
      await loadSuppliers();
    } catch (error) {
      setErrors({ form: error.message || 'Unable to save supplier.' });
    }
  };

  return (
    <div>
      <div className="page-header mb-4">
        <div>
          <p className="eyebrow">Partners</p>
          <h3 className="mb-0">Suppliers</h3>
        </div>
        <Button variant="primary" onClick={openAddModal}>
          <FiPlus className="me-2" />
          Add Supplier
        </Button>
      </div>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="centered-box"><Spinner animation="border" /></div>
          ) : suppliers.length === 0 ? (
            <div className="empty-state">No suppliers added yet.</div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td>{supplier.name}</td>
                      <td>{supplier.phone}</td>
                      <td>{supplier.address}</td>
                      <td className="text-end">
                        <Button variant="outline-primary" size="sm" className="me-2" onClick={() => openEditModal(supplier)}>
                          <FiEdit />
                        </Button>
                        {user?.role === 'admin' && (
                          <Button variant="outline-danger" size="sm" className="d-none">
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
          <Modal.Title>{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</Modal.Title>
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
              <Form.Label>Phone</Form.Label>
              <Form.Control
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                isInvalid={!!errors.phone}
              />
              <Form.Control.Feedback type="invalid">{errors.phone}</Form.Control.Feedback>
            </Form.Group>
            <Form.Group>
              <Form.Label>Address</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
                isInvalid={!!errors.address}
              />
              <Form.Control.Feedback type="invalid">{errors.address}</Form.Control.Feedback>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingSupplier ? 'Save Changes' : 'Add Supplier'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
