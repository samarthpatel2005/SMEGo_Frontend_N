// services/clientService.ts
import axiosInstance from '../lib/axios';
import { Client, GetClientsResponse, ClientQueryParams } from '../types/client';

/**
 * A service object encapsulating all API calls related to clients.
 */
export const clientService = {
  /**
   * Fetches a paginated and filtered list of clients from the API.
   * @param {ClientQueryParams} params - The query parameters for pagination, filtering, and sorting.
   * @returns {Promise<GetClientsResponse>} A promise that resolves to the API response
   * containing the list of clients and pagination details.
   */
  getClients: async (params: ClientQueryParams): Promise<GetClientsResponse> => {
    const { data } = await axiosInstance.get('/clients', { params });
    return data;
  },

  /**
   * Fetches a single client by their unique ID.
   * @param {string} id - The ID of the client to retrieve.
   * @returns {Promise<Client>} A promise that resolves to the requested client object.
   */
  getClientById: async (id: string): Promise<Client> => {
    const { data } = await axiosInstance.get(`/clients/${id}`);
    return data.data;
  },

  /**
   * Creates a new client record.
   * @param {Partial<Client>} clientData - The data for the new client.
   * @returns {Promise<Client>} A promise that resolves to the newly created client object.
   */
  createClient: async (clientData: Partial<Client>): Promise<Client> => {
    const { data } = await axiosInstance.post('/clients', clientData);
    return data.data;
  },

  /**
   * Updates an existing client's information.
   * @param {string} id - The ID of the client to update.
   * @param {Partial<Client>} clientData - An object containing the fields to update.
   * @returns {Promise<Client>} A promise that resolves to the updated client object.
   */
  updateClient: async (id: string, clientData: Partial<Client>): Promise<Client> => {
    const { data } = await axiosInstance.put(`/clients/${id}`, clientData);
    return data.data;
  },

  /**
   * Soft-deletes a client, marking them as inactive without permanently removing them.
   * @param {string} id - The ID of the client to delete.
   * @returns {Promise<void>} A promise that resolves when the operation is complete.
   */
  deleteClient: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/clients/${id}`);
  },

  /**
   * Restores a soft-deleted client.
   * @param {string} id - The ID of the client to restore.
   * @returns {Promise<Client>} A promise that resolves to the restored client object.
   */
  restoreClient: async (id: string): Promise<Client> => {
    const { data } = await axiosInstance.post(`/clients/restore/${id}`);
    return data.data;
  },

  /**
   * Fetches a list of all active clients, typically for use in dropdowns or selection inputs.
   * @returns {Promise<Client[]>} A promise that resolves to an array of active clients.
   */
  getActiveClients: async (): Promise<Client[]> => {
    const { data } = await axiosInstance.get('/clients/active');
    return data.data;
  },

  /**
   * Searches for clients based on a given search term.
   * @param {string} searchTerm - The search term to query against client fields.
   * @returns {Promise<Client[]>} A promise that resolves to an array of clients matching the search term.
   */
  searchClients: async (searchTerm: string): Promise<Client[]> => {
    const { data } = await axiosInstance.get('/clients/search', {
      params: { q: searchTerm },
    });
    return data.data;
  },

  /**
   * Triggers a recalculation of a client's statistics (e.g., total revenue).
   * @param {string} id - The ID of the client whose stats need updating.
   * @returns {Promise<any>} A promise that resolves to the updated statistics object.
   */
  updateClientStats: async (id: string): Promise<any> => {
    const { data } = await axiosInstance.post(`/clients/stats/${id}`);
    return data.data;
  },

  /**
   * Fetches aggregate statistics for all clients within the organization.
   * @returns {Promise<any>} A promise that resolves to an object containing client statistics.
   */
  getClientStats: async (): Promise<any> => {
    const { data } = await axiosInstance.get('/clients/stats');
    return data.data;
  },
};
