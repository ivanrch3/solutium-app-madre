import { Customer } from '../types';

const STORAGE_KEY = 'solutium_crm_customers';

export const crmService = {
  // Get all customers for a specific project
  getCustomers: (_projectId: string): Customer[] => {
    const allCustomers = crmService.getAllCustomers();
    // In a real DB, we would filter by projectId. 
    // For now, we assume all customers belong to the current user's context or filter if we add projectId to Customer.
    // Let's add projectId to Customer implicitly for now or just return all for the demo.
    return allCustomers;
  },

  getAllCustomers: (): Customer[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  // Create a new customer
  createCustomer: (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Customer => {
    const customers = crmService.getAllCustomers();
    
    const newCustomer: Customer = {
      id: crypto.randomUUID(),
      ...customerData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastActivity: new Date().toISOString().split('T')[0]
    };

    const updatedCustomers = [...customers, newCustomer];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCustomers));
    
    // Dispatch event for real-time updates across tabs/windows
    window.dispatchEvent(new Event('crm-update'));
    
    return newCustomer;
  },

  // Update an existing customer
  updateCustomer: (id: string, updates: Partial<Customer>): Customer | null => {
    const customers = crmService.getAllCustomers();
    const index = customers.findIndex(c => c.id === id);
    
    if (index === -1) return null;

    const updatedCustomer = {
      ...customers[index],
      ...updates,
      updatedAt: Date.now(),
      // If status changed, update last activity
      lastActivity: updates.status ? new Date().toISOString().split('T')[0] : customers[index].lastActivity
    };

    customers[index] = updatedCustomer;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    window.dispatchEvent(new Event('crm-update'));

    return updatedCustomer;
  },

  // Delete a customer
  deleteCustomer: (id: string): boolean => {
    const customers = crmService.getAllCustomers();
    const filtered = customers.filter(c => c.id !== id);
    
    if (filtered.length === customers.length) return false;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new Event('crm-update'));
    return true;
  },

  // Satellite App Helper: Update app-specific data
  updateAppData: (customerId: string, appId: string, data: any): Customer | null => {
    const customers = crmService.getAllCustomers();
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer) return null;

    const currentAppData = customer.appData || {};
    const updatedAppData = {
      ...currentAppData,
      [appId]: { ...(currentAppData[appId] || {}), ...data }
    };

    return crmService.updateCustomer(customerId, { appData: updatedAppData });
  }
};
