export enum EventType {
  FLIGHT = 'FLIGHT',
  TRAIN = 'TRAIN',
  BUS = 'BUS',
  HOTEL = 'HOTEL',
  SIGHTSEEING = 'SIGHTSEEING',
  FOOD = 'FOOD',
  SHOPPING = 'SHOPPING',
  WALKING = 'WALKING'
}

export interface DetailedInfo {
  title: string;
  content: string; // Can be a code, ticket number, or markdown text
  imageUrl?: string;
}

export interface ItineraryItem {
  id: string;
  time: string;
  endTime?: string;
  title: string;
  locationName: string;
  locationUrl?: string; // Google Maps URL
  type: EventType;
  description: string;
  cost?: number; // In JPY
  details?: DetailedInfo[]; // For the modal (e.g., flight ticket, booking code)
}

export interface DayItinerary {
  dayId: number;
  dateStr: string; // e.g., "2024-04-01"
  displayDate: string; // e.g., "4月1日 (一)"
  region: string; // e.g., "高松 Takamatsu"
  events: ItineraryItem[];
}

export interface WeatherData {
  temp: string;
  condition: string;
  location: string;
  icon?: string;
}