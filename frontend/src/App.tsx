import { useMemo, useState } from 'react';
import { KpiCard } from './components/KpiCard';
import { initialCustomers, initialOrders, services } from './data/mockData';
import type { Order, PaymentType, ServiceType, WorkflowStatus } from './types';

const workflowColumns: WorkflowStatus[] = ['Pending', 'Washing', 'Drying', 'Ready', 'Picked up'];

export default function App() {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomers[0].id);
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>(['Wash']);
  const [weightKg, setWeightKg] = useState(4);
  const [paymentMethod, setPaymentMethod] = useState<PaymentType>('Cash');

  const totalAmount = useMemo(() => {
    const basePrice = selectedServices.reduce((sum, currentService) => {
      const match = services.find((item) => item.name === currentService);
      return sum + (match?.pricePerKg ?? 0);
    }, 0);

    return Number((basePrice * weightKg).toFixed(2));
  }, [selectedServices, weightKg]);

  const dashboard = useMemo(() => {
    const todaySales = orders.reduce((sum, order) => sum + order.amount, 0);
    const monthlySales = todaySales * 24;

    return {
      todaySales,
      monthlySales,
      topService: 'Wash + Dry',
      pendingPickup: orders.filter((o) => o.status === 'Ready').length,
    };
  }, [orders]);

  const toggleService = (service: ServiceType) => {
    setSelectedServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service],
    );
  };

  const createOrder = () => {
    if (!selectedServices.length) return;

    const customer = initialCustomers.find((item) => item.id === selectedCustomerId);
    if (!customer) return;

    const nextOrder: Order = {
      id: `L-${1000 + orders.length + 1}`,
      customerId: customer.id,
      customerName: customer.name,
      services: selectedServices,
      weightKg,
      amount: totalAmount,
      paymentMethod,
      status: 'Pending',
      createdAt: new Date().toLocaleString(),
    };

    setOrders((current) => [nextOrder, ...current]);
  };

  const moveOrder = (orderId: string) => {
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== orderId) return order;
        const index = workflowColumns.indexOf(order.status);
        if (index === workflowColumns.length - 1) return order;

        return { ...order, status: workflowColumns[index + 1] };
      }),
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[380px,1fr]">
        <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-800">Laundry POS</h1>
          <p className="text-sm text-slate-500">New order, instant pricing, and payment capture.</p>

          <div>
            <label className="text-sm font-medium text-slate-700">Customer</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={selectedCustomerId}
              onChange={(event) => setSelectedCustomerId(event.target.value)}
            >
              {initialCustomers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} ({customer.phone})
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700">Services</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {services.map((service) => (
                <button
                  key={service.name}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    selectedServices.includes(service.name)
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-300'
                  }`}
                  onClick={() => toggleService(service.name)}
                >
                  {service.name}
                  <br />${service.pricePerKg}/kg
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium text-slate-700">
              Weight (kg)
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={weightKg}
                onChange={(event) => setWeightKg(Number(event.target.value))}
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Payment
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value as PaymentType)}
              >
                <option>Cash</option>
                <option>Card</option>
                <option>Online</option>
              </select>
            </label>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Auto-calculated price</p>
            <p className="text-2xl font-semibold text-slate-900">${totalAmount}</p>
          </div>

          <button
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
            onClick={createOrder}
          >
            Create Order + Print Receipt
          </button>
        </section>

        <section className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Daily Sales" value={`$${dashboard.todaySales.toFixed(2)}`} />
            <KpiCard label="Monthly Sales (est.)" value={`$${dashboard.monthlySales.toFixed(2)}`} />
            <KpiCard label="Top Service" value={dashboard.topService} />
            <KpiCard label="Ready for Pickup" value={dashboard.pendingPickup.toString()} />
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">Laundry Workflow</h2>
            <div className="mt-4 grid gap-4 lg:grid-cols-5">
              {workflowColumns.map((column) => (
                <div key={column} className="rounded-xl bg-slate-50 p-3">
                  <h3 className="font-medium text-slate-700">{column}</h3>
                  <div className="mt-3 space-y-2">
                    {orders
                      .filter((order) => order.status === column)
                      .map((order) => (
                        <article key={order.id} className="rounded-lg bg-white p-3 shadow-sm">
                          <p className="font-medium text-slate-800">{order.id}</p>
                          <p className="text-sm text-slate-500">{order.customerName}</p>
                          <p className="text-sm text-slate-500">{order.services.join(' + ')}</p>
                          <p className="text-sm font-medium text-slate-700">${order.amount.toFixed(2)}</p>
                          <button
                            className="mt-2 rounded-md bg-slate-800 px-2 py-1 text-xs text-white"
                            onClick={() => moveOrder(order.id)}
                          >
                            Move to Next Stage
                          </button>
                        </article>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">Customers & Loyalty</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Orders</th>
                    <th>Loyalty Points</th>
                  </tr>
                </thead>
                <tbody>
                  {initialCustomers.map((customer) => (
                    <tr key={customer.id} className="border-t border-slate-200 text-slate-700">
                      <td className="py-2">{customer.name}</td>
                      <td>{customer.phone}</td>
                      <td>{customer.ordersCount}</td>
                      <td>{customer.loyaltyPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
