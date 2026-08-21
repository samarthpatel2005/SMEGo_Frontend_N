'use client';

import React, { useState, useEffect, useCallback, useMemo, FormEvent } from 'react';
// Assuming services and types are at the project root, outside the app directory
import { clientService } from '@/services/clientService'; 
import { Client, Pagination, ClientQueryParams } from '@/types/client';
import { debounce } from 'lodash';

// Enhanced loading spinner component
const Spinner = () => (
  <div className="flex justify-center items-center py-20">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-slate-200 rounded-full animate-pulse"></div>
      <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  </div>
);

// Enhanced error message component
const ErrorMessage = ({ message }: { message: string }) => (
  <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-r-xl shadow-md animate-fade-in mb-6">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="font-semibold">Error occurred</p>
        <p className="mt-1 text-sm opacity-90">{message}</p>
      </div>
    </div>
  </div>
);

// Enhanced no clients found component
const NoClientsFound = () => (
  <div className="text-center py-20 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 shadow-sm">
    <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
      <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    </div>
    <h3 className="text-2xl font-semibold text-slate-700 mb-2">No Clients Found</h3>
    <p className="text-slate-500 max-w-sm mx-auto">Try adjusting your search or filter criteria to find what you're looking for.</p>
  </div>
);

// Enhanced modal for creating a new client
const CreateClientModal = ({ onClose, onClientCreated }: { onClose: () => void; onClientCreated: () => void; }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        companyName: '',
        clientType: 'individual' as 'individual' | 'business',
        status: 'active' as 'active' | 'inactive' | 'lead',
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
        tags: '',
        notes: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        if (!formData.name || !formData.email || !formData.phone) {
            setError('Name, Email, and Phone are required.');
            setIsSubmitting(false);
            return;
        }

        try {
            const clientData = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
                address: {
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    zip: formData.zip,
                    country: formData.country,
                }
            };
            await clientService.createClient(clientData);
            onClientCreated();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create client.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto transform animate-scale-in">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Add New Client</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {error && <ErrorMessage message={error} />}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700">Full Name *</label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400" 
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Email Address *</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange} 
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400" 
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">Phone *</label>
                            <input 
                                type="tel" 
                                id="phone" 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleChange} 
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400" 
                                required 
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="companyName" className="block text-sm font-semibold text-gray-700">Company Name</label>
                            <input 
                                type="text" 
                                id="companyName" 
                                name="companyName" 
                                value={formData.companyName} 
                                onChange={handleChange} 
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400" 
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="clientType" className="block text-sm font-semibold text-gray-700">Client Type</label>
                            <select 
                                id="clientType" 
                                name="clientType" 
                                value={formData.clientType} 
                                onChange={handleChange} 
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                            >
                                <option value="individual">Individual</option>
                                <option value="business">Business</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="status" className="block text-sm font-semibold text-gray-700">Status</label>
                            <select 
                                id="status" 
                                name="status" 
                                value={formData.status} 
                                onChange={handleChange} 
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="lead">Lead</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Address Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="street" className="block text-sm font-medium text-gray-700">Street</label>
                                <input 
                                    type="text" 
                                    id="street" 
                                    name="street" 
                                    value={formData.street} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                                <input 
                                    type="text" 
                                    id="city" 
                                    name="city" 
                                    value={formData.city} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700">State</label>
                                <input 
                                    type="text" 
                                    id="state" 
                                    name="state" 
                                    value={formData.state} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="zip" className="block text-sm font-medium text-gray-700">ZIP Code</label>
                                <input 
                                    type="text" 
                                    id="zip" 
                                    name="zip" 
                                    value={formData.zip} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                />
                            </div>
                            <div className="md:col-span-2 space-y-2">
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                                <input 
                                    type="text" 
                                    id="country" 
                                    name="country" 
                                    value={formData.country} 
                                    onChange={handleChange} 
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <label htmlFor="tags" className="block text-sm font-semibold text-gray-700">Tags (comma-separated)</label>
                        <input 
                            type="text" 
                            id="tags" 
                            name="tags" 
                            value={formData.tags} 
                            onChange={handleChange} 
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400" 
                            placeholder="e.g., premium, tech, enterprise"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label htmlFor="notes" className="block text-sm font-semibold text-gray-700">Notes</label>
                        <textarea 
                            id="notes" 
                            name="notes" 
                            value={formData.notes} 
                            onChange={handleChange} 
                            rows={4} 
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400 resize-none"
                            placeholder="Additional notes about the client..."
                        ></textarea>
                    </div>
                    
                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all transform hover:scale-105 shadow-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting} 
                            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </span>
                            ) : 'Save Client'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [queryParams, setQueryParams] = useState<ClientQueryParams>({
    page: 1,
    limit: 10,
    search: '',
    status: undefined,
    clientType: undefined,
  });
  const [searchTerm, setSearchTerm] = useState('');

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const fetchClients = useCallback(async (params: ClientQueryParams) => {
    setLoading(true);
    setError(null);
    try {
      const filteredParams = Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null && v !== ''));
      const response = await clientService.getClients(filteredParams);
      setClients(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An unexpected error occurred while fetching clients.');
    } finally {
      setLoading(false);
    }
  }, []);

  const debouncedSearch = useMemo(() => debounce((term: string) => {
    setQueryParams(prev => ({ ...prev, search: term, page: 1 }));
  }, 500), []);

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => debouncedSearch.cancel();
  }, [searchTerm, debouncedSearch]);

  useEffect(() => {
    fetchClients(queryParams);
  }, [queryParams, fetchClients]);

  const handleClientCreated = () => {
    setCreateModalOpen(false);
    fetchClients(queryParams);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && (!pagination || newPage <= pagination.pages)) {
      setQueryParams(prev => ({ ...prev, page: newPage }));
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQueryParams(prev => ({
      ...prev,
      [name]: value === 'all' ? undefined : value,
      page: 1,
    }));
  };
  
  const openEditModal = (client: Client) => {
    setSelectedClient(client);
    setEditModalOpen(true);
  };

  const openDeleteModal = (client: Client) => {
    setSelectedClient(client);
    setDeleteModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'lead':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent mb-2">
                Clients Management
              </h1>
              <p className="text-slate-600 text-lg">Manage your client relationships and grow your business</p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all transform hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Client
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white/80"
              />
            </div>
            
            <div className="relative">
              <select 
                name="status" 
                onChange={handleFilterChange} 
                className="w-full px-4 py-4 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white/80 appearance-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="lead">Lead</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <select 
                name="clientType" 
                onChange={handleFilterChange} 
                className="w-full px-4 py-4 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white/50 backdrop-blur-sm hover:bg-white/80 appearance-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="business">Business</option>
                <option value="individual">Individual</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <Spinner />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : clients.length === 0 ? (
          <NoClientsFound />
        ) : (
          <>
            {/* Clients Table */}
            <div className="bg-white/90 backdrop-blur-sm shadow-2xl rounded-2xl overflow-hidden border border-white/20">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                    <tr>
                      <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Client Details
                      </th>
                      <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Contact Info
                      </th>
                      <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-8 py-6 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-8 py-6 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-8 py-6 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-100">
                    {clients.map((client, index) => (
                      <tr 
                        key={client._id} 
                        className="hover:bg-blue-50/50 transition-all duration-200 group"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                <span className="text-lg font-semibold text-blue-600">
                                  {client.name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {client.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {client._id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-900">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                              </svg>
                              {client.email}
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              {client.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center">
                            {client.companyName ? (
                              <>
                                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span className="text-sm font-medium text-gray-900">{client.companyName}</span>
                              </>
                            ) : (
                              <span className="text-sm text-gray-400 italic">No company</span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(client.status)} transition-all hover:scale-105`}>
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              client.status === 'active' ? 'bg-emerald-400' : 
                              client.status === 'inactive' ? 'bg-red-400' : 'bg-amber-400'
                            }`}></div>
                            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center">
                            {client.clientType === 'business' ? (
                              <>
                                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span className="text-sm font-medium text-blue-600">Business</span>
                              </>
                            ) : (
                              <>
                                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-sm font-medium text-green-600">Individual</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end space-x-3">
                            <button
                              onClick={() => openEditModal(client)}
                              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-all transform hover:scale-110"
                              title="Edit Client"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openDeleteModal(client)}
                              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all transform hover:scale-110"
                              title="Delete Client"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Enhanced Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">
                      Showing <span className="text-blue-600 font-semibold">{((pagination.page - 1) * 10) + 1}</span> to{' '}
                      <span className="text-blue-600 font-semibold">{Math.min(pagination.page * 10, pagination.total)}</span> of{' '}
                      <span className="text-blue-600 font-semibold">{pagination.total}</span> clients
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={!pagination.hasPrev}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      First
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={!pagination.hasPrev}
                      className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Previous
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(pagination.pages - 4, pagination.page - 2)) + i;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                              pageNum === pagination.page
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-110'
                                : 'text-gray-500 bg-white border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={!pagination.hasNext}
                      className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
                    >
                      Next
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handlePageChange(pagination.pages)}
                      disabled={!pagination.hasNext}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Last
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {/* Modals */}
        {isCreateModalOpen && (
          <CreateClientModal 
            onClose={() => setCreateModalOpen(false)} 
            onClientCreated={handleClientCreated} 
          />
        )}
        
        {/* TODO: Add Edit and Delete Modals */}
      </div>
      
      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
        
        tbody tr {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}