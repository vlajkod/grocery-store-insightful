import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export enum LocationType {
  STORE = 'STORE',
  OFFICE = 'OFFICE',
}

@Schema({ timestamps: true })
export class Location {
  @Prop({ index: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: LocationType })
  type: LocationType;

  @Prop({ type: Types.ObjectId, ref: 'Location', default: null })
  parentId: string | null;

  @Prop({ type: [Types.ObjectId], default: [], index: true })
  path: string[];
}

export const LocationSchema = SchemaFactory.createForClass(Location);
