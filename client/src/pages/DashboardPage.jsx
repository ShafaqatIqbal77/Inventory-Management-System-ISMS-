import { useEffect, useState } from 'react';
import { Alert, Card, Col, Row, Spinner, Table } from 'react-bootstrap';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FiAlertTriangle, FiBox, FiDollarSign, FiPackage } from 'react-icons/fi';
import { getDashboardStats } from '../services/api';
import { formatCurrency } from '../utils/helpers';

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      try {
        const data = await getDashboardStats();
        setSummary(data);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  if (loading) {
    return (
      <div className="centered-box">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!summary) {
    return <Alert variant="danger">Unable to load dashboard data.</Alert>;
  }

  return (
    <div>
      <div className="page-header mb-4">
        <div>
          <p className="eyebrow">Overview</p>
          <h3 className="mb-0">Dashboard</h3>
        </div>
      </div>

      <Row className="g-3 mb-4">
        <Col xs={12} md={4}>
          <Card className="summary-card border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="summary-label">Total sales</span>
                <div className="summary-icon success">
                  <FiDollarSign />
                </div>
              </div>
              <h3 className="mb-0">{formatCurrency(summary.totalSales)}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card className="summary-card border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="summary-label">Products</span>
                <div className="summary-icon primary">
                  <FiPackage />
                </div>
              </div>
              <h3 className="mb-0">{summary.productCount}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={4}>
          <Card className="summary-card border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="summary-label">Low stock</span>
                <div className="summary-icon warning">
                  <FiAlertTriangle />
                </div>
              </div>
              <h3 className="mb-0">{summary.lowStockCount}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="g-3">
        <Col xs={12} lg={8}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0">Sales trend</h5>
              </div>
              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <BarChart data={summary.salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Bar dataKey="sales" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={4}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0">Low stock items</h5>
                <FiBox />
              </div>
              {summary.lowStockItems.length === 0 ? (
                <p className="text-muted mb-0">No low stock products.</p>
              ) : (
                <ul className="list-unstyled mb-0 low-stock-list">
                  {summary.lowStockItems.map((product) => (
                    <li key={product.id} className="d-flex justify-content-between">
                      <span>{product.name}</span>
                      <strong>{product.quantity}</strong>
                    </li>
                  ))}
                </ul>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm mt-4">
        <Card.Header className="bg-white">Recent invoices</Card.Header>
        <Table responsive hover className="mb-0">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Customer</th>
              <th>Date</th>
              <th className="text-end">Total</th>
            </tr>
          </thead>
          <tbody>
            {summary.recentInvoices.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center text-muted py-3">
                  No invoices yet.
                </td>
              </tr>
            ) : (
              summary.recentInvoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.id}</td>
                  <td>{invoice.customerName}</td>
                  <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                  <td className="text-end">{formatCurrency(invoice.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
