import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { hash, hashSync } from 'bcryptjs';
import { Types } from 'mongoose';

export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER = 'MANAGER',
}

@Schema({ timestamps: true })
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

  constructor(user: Partial<User>) {
    Object.assign(this, user);
  }

  hashPassword() {
    this.password = hashSync(this.password);
  }

  toDto() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      locationId: this.locationId,
    };
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.toDto = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    locationId: this.locationId,
  };
};

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hash(this.password, 10);
  next();
});
