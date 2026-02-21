import { useMemo, useState } from 'react';
import { KpiCard } from './components/KpiCard';
import { initialCustomers, initialOrders, services } from './data/mockData';
import type { Customer, Order, PaymentType, ServiceType, WorkflowStatus } from './types';

type CurrencyCode = 'PHP' | 'AUD' | 'USD';

const workflowColumns: WorkflowStatus[] = ['Pending', 'Washing', 'Drying', 'Ready', 'Picked up'];
const conversionRate: Record<CurrencyCode, number> = {
  PHP: 1,
  AUD: 0.028,
  USD: 0.018,
};
const currencySymbol: Record<CurrencyCode, string> = {
  PHP: '₱',
  AUD: 'A$',
  USD: '$',
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('staffLoggedIn') === 'true');
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin');
  const [loginError, setLoginError] = useState('');

  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomers[0].id);
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>(['Wash']);
  const [weightKg, setWeightKg] = useState(4);
  const [paymentMethod, setPaymentMethod] = useState<PaymentType>('Cash');
  const [currency, setCurrency] = useState<CurrencyCode>('PHP');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [smsLogs, setSmsLogs] = useState<string[]>([]);

  const totalAmount = useMemo(() => {
    const basePrice = selectedServices.reduce((sum, currentService) => {
      const match = services.find((item) => item.name === currentService);
      return sum + (match?.pricePerKg ?? 0);
    }, 0);

    const phpAmount = basePrice * weightKg;
    return Number((phpAmount * conversionRate[currency]).toFixed(2));
  }, [selectedServices, weightKg, currency]);

  const formatAmount = (amount: number) => `${currencySymbol[currency]}${amount.toFixed(2)}`;

  const dashboard = useMemo(() => {
    const totalPhpSales = orders.reduce((sum, order) => sum + order.amount, 0);
    const todaySales = totalPhpSales * conversionRate[currency];
    const monthlySales = todaySales * 24;

    return {
      todaySales,
      monthlySales,
      topService: 'Wash + Dry',
      readyForPickup: orders.filter((o) => o.status === 'Ready').length,
      pickedUp: orders.filter((o) => o.status === 'Picked up').length,
    };
  }, [orders, currency]);

  const login = () => {
    if (loginUsername === 'admin' && loginPassword === 'admin') {
      setIsLoggedIn(true);
      localStorage.setItem('staffLoggedIn', 'true');
      setLoginError('');
      return;
    }

    setLoginError('Invalid staff account. Use admin / admin.');
  };

  const addCustomer = () => {
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) return;

    const nextCustomer: Customer = {
      id: `c${customers.length + 1}`,
      name: newCustomerName.trim(),
      phone: newCustomerPhone.trim(),
      loyaltyPoints: 0,
      ordersCount: 0,
    };

    setCustomers((current) => [...current, nextCustomer]);
    setSelectedCustomerId(nextCustomer.id);
    setNewCustomerName('');
    setNewCustomerPhone('');
  };

  const toggleService = (service: ServiceType) => {
    setSelectedServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service],
    );
  };

  const createOrder = () => {
    if (!selectedServices.length) return;

    const customer = customers.find((item) => item.id === selectedCustomerId);
    if (!customer) return;

    const phpBasePrice = selectedServices.reduce((sum, currentService) => {
      const match = services.find((item) => item.name === currentService);
      return sum + (match?.pricePerKg ?? 0);
    }, 0);

    const nextOrder: Order = {
      id: `L-${1000 + orders.length + 1}`,
      customerId: customer.id,
      customerName: customer.name,
      services: selectedServices,
      weightKg,
      amount: Number((phpBasePrice * weightKg).toFixed(2)),
      paymentMethod,
      status: 'Pending',
      createdAt: new Date().toLocaleString(),
    };

    setOrders((current) => [nextOrder, ...current]);
    setCustomers((current) =>
      current.map((item) =>
        item.id === customer.id
          ? { ...item, ordersCount: item.ordersCount + 1, loyaltyPoints: item.loyaltyPoints + 1 }
          : item,
      ),
    );
  };

  const getNextStatus = (order: Order): WorkflowStatus | 'Completed' => {
    if (order.status === 'Pending') {
      if (order.services.includes('Wash')) return 'Washing';
      if (order.services.includes('Dry')) return 'Drying';
      return 'Ready';
    }

    if (order.status === 'Washing') {
      if (order.services.includes('Dry')) return 'Drying';
      return 'Ready';
    }

    if (order.status === 'Drying') return 'Ready';
    if (order.status === 'Ready') return 'Picked up';
    return 'Completed';
  };

  const moveOrder = (orderId: string) => {
    setOrders((current) => {
      const match = current.find((order) => order.id === orderId);
      if (!match) return current;

      const nextStatus = getNextStatus(match);

      if (nextStatus === 'Completed') {
        return current.filter((order) => order.id !== orderId);
      }

      if (nextStatus === 'Ready') {
        const smsMessage = `SMS to ${match.customerName} (${customers.find((c) => c.id === match.customerId)?.phone ?? 'N/A'}): Your laundry order ${match.id} is READY for pickup.`;
        setSmsLogs((logs) => [smsMessage, ...logs]);
      }

      return current.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order));
    });
  };

  const getActionLabel = (status: WorkflowStatus) => {
    if (status === 'Ready') return 'Hand-over to Customer';
    if (status === 'Picked up') return 'Completed';
    return 'Move to Next Stage';
  };

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-800">Staff Login</h1>
          <p className="mt-1 text-sm text-slate-500">Use default account admin / admin</p>

          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              login();
            }}
          >
            <label className="block text-sm font-medium text-slate-700">
              Username
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={loginUsername}
                onChange={(event) => setLoginUsername(event.target.value)}
              />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
              />
            </label>

            {loginError ? <p className="text-sm text-rose-600">{loginError}</p> : null}

            <button
              type="submit"
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[380px,1fr]">
        <section className="space-y-4 rounded-2xl bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-800">Laundry POS</h1>
          <p className="text-sm text-slate-500">New order, instant pricing, and payment capture.</p>

          <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3">
            <label className="text-sm font-medium text-slate-700">
              Customer name
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={newCustomerName}
                onChange={(event) => setNewCustomerName(event.target.value)}
                placeholder="Juan Dela Cruz"
              />
            </label>

            <label className="text-sm font-medium text-slate-700">
              Cellphone number
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={newCustomerPhone}
                onChange={(event) => setNewCustomerPhone(event.target.value)}
                placeholder="09xx xxx xxxx"
              />
            </label>

            <button
              type="button"
              className="col-span-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              onClick={addCustomer}
            >
              Add New Customer
            </button>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700">Customer</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={selectedCustomerId}
              onChange={(event) => setSelectedCustomerId(event.target.value)}
            >
              {customers.map((customer) => (
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
                  type="button"
                  key={service.name}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    selectedServices.includes(service.name)
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-300'
                  }`}
                  onClick={() => toggleService(service.name)}
                >
                  {service.name}
                  <br />₱{service.pricePerKg}/kg
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

          <label className="block text-sm font-medium text-slate-700">
            Currency
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={currency}
              onChange={(event) => setCurrency(event.target.value as CurrencyCode)}
            >
              <option value="PHP">PHP</option>
              <option value="AUD">AUD</option>
              <option value="USD">USD</option>
            </select>
          </label>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Auto-calculated price</p>
            <p className="text-2xl font-semibold text-slate-900">{formatAmount(totalAmount)}</p>
          </div>

          <button
            type="button"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
            onClick={createOrder}
          >
            Create Order + Print Receipt
          </button>
        </section>

        <section className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <KpiCard label="Daily Sales" value={formatAmount(dashboard.todaySales)} />
            <KpiCard label="Monthly Sales (est.)" value={formatAmount(dashboard.monthlySales)} />
            <KpiCard label="Top Service" value={dashboard.topService} />
            <KpiCard label="Ready for Pickup" value={dashboard.readyForPickup.toString()} />
            <KpiCard label="Picked up" value={dashboard.pickedUp.toString()} />
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
                          <p className="text-sm font-medium text-slate-700">
                            {formatAmount(order.amount * conversionRate[currency])}
                          </p>
                          <button
                            type="button"
                            className="mt-2 rounded-md bg-slate-800 px-2 py-1 text-xs text-white"
                            onClick={() => moveOrder(order.id)}
                          >
                            {getActionLabel(order.status)}
                          </button>
                        </article>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">SMS Notifications (Auto on Ready)</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {smsLogs.length ? (
                smsLogs.map((log, index) => (
                  <li key={`${log}-${index}`} className="rounded-lg bg-slate-50 p-2">
                    {log}
                  </li>
                ))
              ) : (
                <li className="text-slate-500">No SMS sent yet.</li>
              )}
            </ul>
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
                  {customers.map((customer) => (
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
