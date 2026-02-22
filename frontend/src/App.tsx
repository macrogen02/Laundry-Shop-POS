import { useEffect, useMemo, useState } from 'react';
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
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem('staffLoggedIn') === 'true'
  );

  const [route, setRoute] = useState(() => window.location.pathname || '/login');

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

  useEffect(() => {
    const onPopState = () => setRoute(window.location.pathname || '/login');
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (!isLoggedIn && route !== '/login') {
      window.history.replaceState({}, '', '/login');
      setRoute('/login');
    }
    if (isLoggedIn && route === '/login') {
      window.history.replaceState({}, '', '/pos');
      setRoute('/pos');
    }
  }, [isLoggedIn, route]);

  const totalAmount = useMemo(() => {
    const basePrice = selectedServices.reduce((sum, s) => {
      const match = services.find((item) => item.name === s);
      return sum + (match?.pricePerKg ?? 0);
    }, 0);

    const phpAmount = basePrice * weightKg;
    return Number((phpAmount * conversionRate[currency]).toFixed(2));
  }, [selectedServices, weightKg, currency]);

  const formatAmount = (amount: number) =>
    `${currencySymbol[currency]}${amount.toFixed(2)}`;

  const login = () => {
    if (loginUsername === 'admin' && loginPassword === 'admin') {
      setIsLoggedIn(true);
      localStorage.setItem('staffLoggedIn', 'true');
      window.history.pushState({}, '', '/pos');
      setRoute('/pos');
      setLoginError('');
    } else {
      setLoginError('Invalid staff account. Use admin / admin.');
    }
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

    setCustomers((c) => [...c, nextCustomer]);
    setSelectedCustomerId(nextCustomer.id);
    setNewCustomerName('');
    setNewCustomerPhone('');
  };

  const toggleService = (service: ServiceType) => {
    setSelectedServices((current) =>
      current.includes(service)
        ? current.filter((s) => s !== service)
        : [...current, service]
    );
  };

  const getNextStatus = (order: Order): WorkflowStatus | 'Completed' => {
    if (order.status === 'Pending') return 'Washing';
    if (order.status === 'Washing') return 'Drying';
    if (order.status === 'Drying') return 'Ready';
    if (order.status === 'Ready') return 'Picked up';
    return 'Completed';
  };

  const moveOrder = (orderId: string) => {
    setOrders((current) => {
      const match = current.find((o) => o.id === orderId);
      if (!match) return current;

      const next = getNextStatus(match);

      if (next === 'Completed') {
        return current.filter((o) => o.id !== orderId);
      }

      if (next === 'Ready') {
        const sms = `SMS to ${match.customerName}: Order ${match.id} READY for pickup`;
        setSmsLogs((logs) => [sms, ...logs]);
      }

      return current.map((o) =>
        o.id === orderId ? { ...o, status: next } : o
      );
    });
  };

  const createOrder = () => {
    const customer = customers.find((c) => c.id === selectedCustomerId);
    if (!customer) return;

    const phpBasePrice = selectedServices.reduce((sum, s) => {
      const match = services.find((item) => item.name === s);
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

    setOrders((o) => [nextOrder, ...o]);

    setCustomers((list) =>
      list.map((c) =>
        c.id === customer.id
          ? { ...c, ordersCount: c.ordersCount + 1, loyaltyPoints: c.loyaltyPoints + 1 }
          : c
      )
    );
  };

  if (!isLoggedIn) {
    return <div className="p-6">Login screen here...</div>;
  }

  return <div className="p-6">Laundry POS UI here...</div>;
}
