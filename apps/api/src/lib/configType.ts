export type TransportMode = 'BUS' | 'SHIP' | 'METRO' | 'TRAM' | 'TRAIN';
export type Config = {
  sl: {
    siteId: string;
    displayName: string;
    filterDepartures: {
      designation: string;
      // important to specify the transportMode because e.g. line 10 can be the metro but also a Waxholms-boat
      transportMode: TransportMode;
      direction: 1 | 2;
    }[];
    walkingTime?: number;
    onlyDeviations?: boolean;
  }[];
  smhi: {
    displayName: string;
    latitude: number;
    longitude: number;
  }[];
};
