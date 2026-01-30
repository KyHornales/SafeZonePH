import { API_BASE_URL } from '../config/api.config';

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('safezoneph_token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    if (response.ok) {
      const data = await response.json();
      return { data };
    }

    const errorText = await response.text();
    let errorMessage = 'An error occurred';

    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.detail || errorJson.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }

    return { error: errorMessage };
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('safezoneph_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('safezoneph_token');
  }

  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
    barangay?: string;
    city?: string;
  }): Promise<ApiResponse<{ access_token: string; token_type: string; user: any }>> {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });

    return this.handleResponse(response);
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse<{ access_token: string; token_type: string; user: any }>> {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(credentials),
    });

    return this.handleResponse(response);
  }

  async getCurrentUser(): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async getTasks(): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async createTask(taskData: {
    title: string;
    description: string;
    category: string;
    priority: string;
    points: number;
    due_date?: string;
    assigned_to?: string;
    location?: string;
  }): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(taskData),
    });

    return this.handleResponse(response);
  }

  async updateTask(taskId: string, updates: {
    status?: string;
    title?: string;
    description?: string;
    category?: string;
    priority?: string;
    points?: number;
    due_date?: string;
    assigned_to?: string;
    location?: string;
  }): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });

    return this.handleResponse(response);
  }

  async getPointsHistory(): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${API_BASE_URL}/api/points/history`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  // Help Requests
  async getHelpRequests(): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${API_BASE_URL}/api/help-requests`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async createHelpRequest(requestData: {
    type: string;
    title: string;
    description: string;
    location: string;
    urgency: string;
    responders_needed?: number;
  }): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/help-requests`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(requestData),
    });

    return this.handleResponse(response);
  }

  async respondToHelpRequest(requestId: number): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/help-requests/${requestId}/respond`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  // Global Alerts
  async getGlobalAlerts(): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${API_BASE_URL}/api/global-alerts`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async createGlobalAlert(alertData: {
    type: string;
    priority: string;
    title: string;
    message: string;
    affected_areas: string[];
    expires_in?: string;
  }): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/global-alerts`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(alertData),
    });

    return this.handleResponse(response);
  }

  async acknowledgeAlert(alertId: number): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/global-alerts/${alertId}/acknowledge`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async toggleAlertStatus(alertId: number): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/global-alerts/${alertId}/toggle`, {
      method: 'PATCH',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  // Community Tasks
  async getCommunityTasks(): Promise<ApiResponse<any[]>> {
    const response = await fetch(`${API_BASE_URL}/api/community-tasks`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async createCommunityTask(taskData: {
    title: string;
    description: string;
    location: string;
    urgency: string;
    points?: number;
  }): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/community-tasks`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(taskData),
    });

    return this.handleResponse(response);
  }

  async volunteerForTask(taskId: number): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/api/community-tasks/${taskId}/volunteer`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }
}

export const apiService = new ApiService();
export default apiService;