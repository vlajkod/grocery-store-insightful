import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { hash, hashSync } from 'bcryptjs';
import { Types } from 'mongoose';

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
}

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ index: true })
  id: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: UserRole })
  role: UserRole;

  @Prop({ type: Types.ObjectId, ref: 'Location', required: true, index: true })
  locationId: string;

  constructor(
    user: Pick<
      User & { _id: Types.ObjectId },
      'email' | 'name' | 'role' | 'locationId' | '_id'
    >,
  ) {
    this.email = user.email;
    this.name = user.name;
    this.role = user.role;
    this.locationId = user.locationId.toString();
    this.id = user._id.toString();
  }

  hashPassword() {
    this.password = hashSync(this.password);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hash(this.password, 10);
  next();
});
