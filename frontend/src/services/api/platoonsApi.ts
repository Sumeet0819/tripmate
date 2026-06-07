import apiClient from '../apiClient';

export interface PlatoonUser {
  id: string;
  name: string;
  avatar_url: string;
  is_verified?: boolean;
}

export interface PlatoonTrip {
  id: string;
  title: string;
  location: string;
  image_url: string;
  price?: number;
  duration?: number;
  slots_total?: number;
  slots_left?: number;
  category?: string;
}

export interface Platoon {
  id: string;
  trip_id: string;
  leader_id: string;
  members: string[];
  pending_requests: string[];
  status: 'planning' | 'confirmed' | 'active' | 'completed';
  created_at: string;
  trip?: PlatoonTrip;
  leader?: PlatoonUser;
}

export interface PlatoonMessage {
  id: string;
  text: string;
  created_at: string;
  sender: PlatoonUser;
}

export const platoonsApi = {
  /**
   * Fetch all platoons where the authenticated user is a member.
   */
  getMyPlatoons: async () => {
    const response = await apiClient.get('/platoons/my');
    return response.data;
  },

  /**
   * Fetch a single platoon by ID.
   * @param {string} id - The platoon UUID
   */
  getPlatoonById: async (id: string) => {
    const response = await apiClient.get(`/platoons/${id}`);
    return response.data;
  },

  /**
   * Create a new platoon for a trip.
   * @param {string} trip_id - The trip UUID
   */
  createPlatoon: async (trip_id: string) => {
    const response = await apiClient.post('/platoons', { trip_id });
    return response.data;
  },

  /**
   * Request to join a platoon.
   * @param {string} id - The platoon UUID
   */
  joinPlatoon: async (id: string) => {
    const response = await apiClient.post(`/platoons/${id}/join`);
    return response.data;
  },

  /**
   * Approve or reject a join request (Leader only).
   * @param {string} id - The platoon UUID
   * @param {string} userId - The UUID of the user to approve/reject
   * @param {'approve' | 'reject'} action - The action to perform
   */
  approveRequest: async (id: string, userId: string, action: 'approve' | 'reject') => {
    const response = await apiClient.post(`/platoons/${id}/approve`, { userId, action });
    return response.data;
  },

  /**
   * Fetch chat messages for a platoon.
   * @param {string} id - The platoon UUID
   * @param {number} limit - Number of messages to fetch
   * @param {number} offset - Offset for pagination
   */
  getMessages: async (id: string, limit = 50, offset = 0) => {
    const response = await apiClient.get(`/platoons/${id}/messages`, {
      params: { limit, offset },
    });
    return response.data;
  },
};
