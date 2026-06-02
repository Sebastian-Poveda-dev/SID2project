import type { EventType } from './event';

export interface EventStatistics {
  eventId: number;
  totalRegistered: number;
  totalCancelled: number;
  totalAttended: number;
  occupancyPercentage: number;
  lastUpdated: string;
}

export interface StatisticsSummary {
  totalEvents: number;
  eventsByStatus: Record<string, number>;
  totalRegistrations: number;
  totalCancellations: number;
  totalAttendances: number;
  globalAttendanceRate: number;
  globalCancellationRate: number;
  avgOccupancyPercentage: number;
  topEventType: string;
}

export interface EventTypeStatistics {
  eventType: EventType;
  totalEvents: number;
  totalRegistered: number;
  totalCancelled: number;
  totalAttended: number;
  attendanceRate: number;
  cancellationRate: number;
}

export type OrganizerType = 'FACULTY_MEMBER' | 'INSTRUCTOR' | 'STUDENT_LEADER' | 'WELLNESS_STAFF';

export interface OrganizerPerformance {
  organizerId: number;
  displayName: string;
  organizerType: OrganizerType;
  totalEvents: number;
  totalRegistered: number;
  avgOccupancyPercentage: number;
  avgAttendanceRate: number;
}
