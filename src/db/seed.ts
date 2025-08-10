import { connect, connection, Model, Types } from 'mongoose';
import { LocationSchema } from '../modules/location/location.schema';
import { UserRole, UserSchema } from '../modules/user/user.schema';
import { locations, LocationTree } from './location-tree';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://root:example@localhost:27017/grocery-store?authSource=admin';

async function addLocation(
  location: LocationTree,
  locationModel: Model<Location>,
  parentId: Types.ObjectId | null = null,
  parentPath: Types.ObjectId[] = [],
) {
  const { name, type, children } = location;
  const path = [...parentPath];
  const createdLocation = await locationModel.create({
    name,
    type,
    parentId,
    path,
  });

  await locationModel.findByIdAndUpdate(createdLocation._id, {
    $set: { path: [...path, createdLocation._id] },
  });

  const createdChildren = await Promise.all(
    children.map(
      (child: LocationTree): Promise<{ location: Location; children: any[] }> =>
        addLocation(child, locationModel, createdLocation._id, [...path, createdLocation._id]),
    ),
  );

  return { location: createdLocation, children: createdChildren };
}

async function seed() {
  await connect(MONGO_URI);
  const LocationModel = connection.model('Location', LocationSchema);
  const UserModel = connection.model('User', UserSchema);

  await LocationModel.deleteMany({});
  await UserModel.deleteMany({});

  const root = await addLocation(locations, LocationModel as unknown as Model<Location>);

  await UserModel.create([
    {
      name: 'Manager Serbia',
      email: 'manager.serbia@example.rs',
      password: 'Pass123!',
      role: UserRole.MANAGER,
      locationId: root.location._id,
    },
  ]);

  console.log('✅ Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
