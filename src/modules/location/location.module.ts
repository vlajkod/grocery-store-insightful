import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DescendantLocationsFinderService } from './descendant-locations-finder.service';
import { Location, LocationSchema } from './location.schema';

const LocationMongooseModule = MongooseModule.forFeature([{ name: Location.name, schema: LocationSchema }]);
@Module({
  imports: [LocationMongooseModule],
  exports: [LocationMongooseModule, DescendantLocationsFinderService],
  providers: [DescendantLocationsFinderService],
})
export class LocationModule {}
