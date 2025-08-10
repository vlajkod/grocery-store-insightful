import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Location } from './location.schema';

@Injectable()
export class DescendantLocationCheckerService {
  constructor(@InjectModel(Location.name) private readonly locationModel: Model<Location>) {}

  async execute(rootLocationId: string, targetLocationId: string): Promise<boolean> {
    const location = await this.locationModel
      .find({
        all: [new Types.ObjectId(rootLocationId), new Types.ObjectId(targetLocationId)],
      })
      .lean();
    return !!location;
  }
}
