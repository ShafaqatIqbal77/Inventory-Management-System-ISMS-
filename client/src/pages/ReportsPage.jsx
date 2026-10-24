import { useEffect, useMemo, useState } from 'react';
import { Card, Nav, Spinner, Table } from 'react-bootstrap';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getInvoices } from '../services/api';
import { formatCurrency } from '../utils/helpers';

const periods = ['daily', 'monthly', 'yearly'];

export default function ReportsPage() {
  const [activePeriod, setActivePeriod] = useState('daily');
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInvoices = async () => {
      setLoading(true);
      try {
        const data = await getInvoices();
        setInvoices(data);
      } finally {
        setLoading(false);
      }
    };

    loadInvoices();
  }, []);

  const filteredInvoices = useMemo(() => {
    const now = new Date();

    return invoices.filter((invoice) => {
      const date = new Date(invoice.createdAt);

      if (activePeriod === 'daily') {
        return (
          date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth() &&
          date.getDate() === now.getDate()
        );
      }
      if (activePeriod === 'monthly') {
        return (
          date.getFullYear() === now.getFullYear() &&
          date.getMonth() === now.getMonth()
        );
      }
      return date.getFullYear() === now.getFullYear();
    });
  }, [activePeriod, invoices]);

  const chartData = useMemo(() => {
    const items = {};
    filteredInvoices.forEach((invoice) => {
      const date = new Date(invoice.createdAt);
      const label =
        activePeriod === 'daily'
          ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : activePeriod === 'monthly'
            ? date.toLocaleDateString([], { day: 'numeric' })
            : date.toLocaleDateString([], { month: 'short' });
      items[label] = (items[label] || 0) + Number(invoice.total || 0);
    });

    return Object.entries(items).map(([label, sales]) => ({ label, sales }));
  }, [activePeriod, filteredInvoices]);

  const totalSales = filteredInvoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);

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
          <p className="eyebrow">Analytics</p>
          <h3 className="mb-0">Reports</h3>
        </div>
      </div>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Nav variant="tabs" activeKey={activePeriod} onSelect={(eventKey) => setActivePeriod(eventKey)}>
            {periods.map((period) => (
              <Nav.Item key={period}>
                <Nav.Link eventKey={period}>{period.charAt(0).toUpperCase() + period.slice(1)}</Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Sales Summary</h5>
            <strong>{formatCurrency(totalSales)}</strong>
          </div>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="sales" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="table-responsive">
            <Table hover className="align-middle mb-0">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th className="text-end">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-3">
                      No sales data available for this period.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>{invoice.id}</td>
                      <td>{invoice.customerName}</td>
                      <td>{new Date(invoice.createdAt).toLocaleString()}</td>
                      <td className="text-end">{formatCurrency(invoice.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
