import type { Config } from './lib/configType';

export const config = {
  sl: [
    {
      // find the site IDs here: https://transport.integration.sl.se/v1/sites
      siteId: '9325', // Sundbyberg's Centrum
      displayName: 'Pendeltåg',
      walkingTime: 11,
      filterDepartures: [
        {
          // here you can use glob patterns like * or ?.
          // for example: 43* to match line 43 and 43X
          designation: '43*',

          // Direction filter, enter either 1 or 2 here.
          // To find out if you need 1 or 2, you can only try out the different values
          // since there's no standard definition which direction is which value.
          direction: 1,
        },
      ],
    },
    {
      siteId: '9325', // Sundbyberg's Centrum
      displayName: 'Tunnelbana',
      walkingTime: 11,
      filterDepartures: [
        {
          designation: '10',
          direction: 2, // to Kungsträdgården
        },
      ],
    },
    {
      siteId: '3680', // Bällsta Bro
      displayName: 'Tvärbana',
      walkingTime: 4,
      filterDepartures: [
        {
          designation: '30',
          direction: 2, // to Sickla
        },
        {
          designation: '30',
          direction: 1, // to Solna
        },
      ],
    },
  ],
  smhi: [
    {
      displayName: 'Sundbyberg',
      longitude: 17.95943,
      latitude: 59.36038,
    },
  ],
} satisfies Config;
