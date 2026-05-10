export type EventType =
  | 'WORKSHOP'
  | 'TALK'
  | 'SPORTS_TOURNAMENT'
  | 'VOLUNTEER'
  | 'OTHER';

export type EventStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'ONGOING'
  | 'COMPLETED'
  | 'CANCELLED';

export type RegistrationStatus =
  | 'REGISTERED'
  | 'CANCELLED'
  | 'ATTENDED'
  | 'NO_SHOW';

export interface EventSummary {
  id: number;
  eventCode: string;
  title: string;
  eventType: EventType;
  startDateTime: string;
  location: string;
  availableSlots: number;
  status: EventStatus;
}

export interface EventDetail extends EventSummary {
  description: string;
  endDateTime: string;
  maxCapacity: number;
  organizerName: string;
  createdAt: string;
  dynamicData: Record<string, unknown> | null;
  tags: string[] | null;
}

export interface RegistrationResponse {
  eventId: number;
  studentId: number;
  registrationStatus: RegistrationStatus;
  registrationDate: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  eventType: EventType;
  startDateTime: string;
  endDateTime: string;
  location: string;
  maxCapacity: number;
  tags?: string[];
  dynamicData?: Record<string, unknown>;
}
