import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export enum LocationType {
  STORE = 'STORE',
  OFFICE = 'OFFICE',
}

@Schema({ timestamps: true })
export class Location extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: LocationType })
  type: LocationType;

  @Prop({ type: Types.ObjectId, ref: 'Location', default: null })
  parentId: Types.ObjectId | null;

  @Prop({ type: [Types.ObjectId], default: [], index: true })
  path: Types.ObjectId[];
}

export const LocationSchema = SchemaFactory.createForClass(Location);
