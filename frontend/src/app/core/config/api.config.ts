import { environment } from '../../../environments/environment';

export const API_CONFIG = {
  baseUrl: environment.apiUrl,
  endpoints: {
    auth: {
      login: '/auth/login',
      register: '/auth/register',
      refresh: '/auth/refresh',
      logout: '/auth/logout',
    },
    staff: {
      base: '/staff',
      search: '/staff/search',
    },
    products: {
      base: '/products',
      lowStock: '/products/low-stock',
      dashboardStats: '/products/dashboard-stats',
    },
    sales: {
      base: '/sales',
      dailyReport: '/sales/daily-report',
      monthlyReport: '/sales/monthly-report',
    },
    dashboard: {
      stats: '/dashboard/stats',
    },
  },
} as const;
