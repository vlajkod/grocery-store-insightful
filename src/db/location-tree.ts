import { LocationType } from '../modules/location/location.schema';

export type LocationTree = {
  name: string;
  type: LocationType;
  children: LocationTree[];
};

export const locations: LocationTree = {
  name: 'Srbija',
  type: LocationType.OFFICE,
  children: [
    {
      name: 'Vojvodina',
      type: LocationType.OFFICE,
      children: [
        {
          name: 'Severno Backi',
          type: LocationType.OFFICE,
          children: [
            {
              name: 'Subotica',
              type: LocationType.OFFICE,
              children: [
                { name: 'Radnja 1', type: LocationType.STORE, children: [] },
              ],
            },
          ],
        },
        {
          name: 'Juzno Backi',
          type: LocationType.OFFICE,
          children: [
            {
              name: 'Novi Sad',
              type: LocationType.OFFICE,
              children: [
                {
                  name: 'Detelinara',
                  type: LocationType.OFFICE,
                  children: [
                    {
                      name: 'Radnja 2',
                      type: LocationType.STORE,
                      children: [],
                    },
                    {
                      name: 'Radnja 3',
                      type: LocationType.STORE,
                      children: [],
                    },
                  ],
                },
                {
                  name: 'Liman',
                  type: LocationType.OFFICE,
                  children: [
                    {
                      name: 'Radnja 4',
                      type: LocationType.STORE,
                      children: [],
                    },
                    {
                      name: 'Radnja 5',
                      type: LocationType.STORE,
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'Grad Beograd',
      type: LocationType.OFFICE,
      children: [
        {
          name: 'Novi Beograd',
          type: LocationType.OFFICE,
          children: [
            {
              name: 'Bezanija',
              type: LocationType.STORE,
              children: [
                { name: 'Radnja 6', type: LocationType.STORE, children: [] },
              ],
            },
          ],
        },
        {
          name: 'Vracar',
          type: LocationType.OFFICE,
          children: [
            {
              name: 'Neimar',
              type: LocationType.OFFICE,
              children: [
                { name: 'Radnja 7', type: LocationType.STORE, children: [] },
              ],
            },
            {
              name: 'Crveni Krst',
              type: LocationType.OFFICE,
              children: [
                { name: 'Radnja 8', type: LocationType.STORE, children: [] },
                { name: 'Radnja 9', type: LocationType.STORE, children: [] },
              ],
            },
          ],
        },
      ],
    },
  ],
};
