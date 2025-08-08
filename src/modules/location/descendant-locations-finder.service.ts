import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Location } from '../location/location.schema';

@Injectable()
export class DescendantLocationsFinderService {
  constructor(
    @InjectModel(Location.name) private readonly locationModel: Model<Location>,
  ) {}

  async execute(locationId: string) {
    const locations = await this.locationModel
      .find({ path: new Types.ObjectId(locationId) })
      .select('id')
      .lean();
    return locations.map((loc) => String(loc._id));
  }
}
