export type Config = {
  sl: {
    siteId: string;
    displayName: string;
    filterDepartures: {
      designation: string;
      direction: 1 | 2;
    }[];
    walkingTime?: number;
  }[];
  smhi: {
    displayName: string;
    latitude: number;
    longitude: number;
  }[];
};
