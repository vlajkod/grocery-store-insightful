import { faker } from '@faker-js/faker/.';
import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import { DescendantLocationsFinderService } from '../../../src/modules/location/descendant-locations-finder.service';
import { Location } from '../../../src/modules/location/location.schema';
import { mockLocationModel } from '../utils';

describe('DescendantLocationsFinderService', () => {
  let descendantLocationsFinderService: DescendantLocationsFinderService;
  let locationModel: Model<Location>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        DescendantLocationsFinderService,
        {
          provide: getModelToken(Location.name),
          useValue: mockLocationModel,
        },
      ],
    }).compile();

    descendantLocationsFinderService = moduleRef.get(DescendantLocationsFinderService);

    locationModel = moduleRef.get<Model<Location>>(getModelToken(Location.name));
  });

  type LocationIds = { _id: Types.ObjectId };

  describe('execute', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      jest.resetAllMocks();
    });
    it('should return the location by id and map from the ObjectId to string', async () => {
      const locationId = faker.database.mongodbObjectId();

      const locations: LocationIds[] = [];
      for (let i = 0; i < 4; i++) {
        locations.push({ _id: new Types.ObjectId(faker.database.mongodbObjectId()) });
      }

      const mockLean = jest.fn((): any => locations);
      const mockSelect = jest.fn(() => ({ lean: mockLean }));
      const mockFind = jest.fn((): any => ({ select: mockSelect }));
      jest.spyOn(locationModel, 'find').mockImplementationOnce(mockFind);

      const data = await descendantLocationsFinderService.execute(locationId);
      const expected = locations.map((item: LocationIds) => item._id.toString());
      expect(data).toEqual(expected);
      expect(mockFind).toHaveBeenCalledWith({ path: new Types.ObjectId(locationId) });
      expect(mockSelect).toHaveBeenCalledWith('id');
      expect(mockLean).toHaveBeenCalled();
    });
  });
});
