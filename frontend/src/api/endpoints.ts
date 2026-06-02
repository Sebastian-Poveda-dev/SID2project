export const AUTH = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
} as const;

export const EVENTS = {
  LIST: '/events',
  MY_EVENTS: '/events/my-events',
  DETAIL: (id: number) => `/events/${id}`,
  CREATE: '/events',
  UPDATE: (id: number) => `/events/${id}`,
  DELETE: (id: number) => `/events/${id}`,
  PUBLISH: (id: number) => `/events/${id}/publish`,
} as const;

export const REGISTRATIONS = {
  REGISTER: '/registrations',
  CANCEL: (eventId: number) => `/registrations/${eventId}`,
  MY_REGISTRATIONS: '/registrations/my-registrations',
  BY_EVENT: (eventId: number) => `/registrations/event/${eventId}`,
  EXPORT_CSV: (eventId: number) => `/registrations/event/${eventId}/export/csv`,
} as const;

export const ORGANIZERS = {
  LIST: '/organizers',
  DETAIL: (id: number) => `/organizers/${id}`,
  ACTIVATE: '/organizers/activate',
} as const;

export const STATISTICS = {
  BY_EVENT: (eventId: number) => `/statistics/events/${eventId}`,
  POPULAR_EVENTS: '/statistics/popular-events',
  OCCUPANCY: '/statistics/occupancy',
  SUMMARY: '/statistics/summary',
  BY_TYPE: '/statistics/by-type',
  ORGANIZERS: '/statistics/organizers',
} as const;
