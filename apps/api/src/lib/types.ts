// Shared types between backend and frontend
export type DepartureStatus = 'DELAYED' | 'ON_TIME' | 'CANCELLED';

export type Departure = {
    journeyId: number;
    mins: number;
    status: DepartureStatus;
    dim: boolean;
    designation: string;
    destination: string;
};

export type Deviation = {
    text: string;
    lineDesignation: string;
    level: number;
};

export type SlResultObj = {
    displayName: string;
    error?: boolean;
    departures?: Departure[];
    deviations?: Deviation[];
};

// Re-export config types that might be useful for frontend
export type { Config } from './configType'; 