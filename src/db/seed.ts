import * as bcrypt from 'bcryptjs';
import { connect, connection } from 'mongoose';
import {
  LocationSchema,
  LocationType,
} from '../modules/location/location.schema';
import { UserRole, UserSchema } from '../modules/user/user.schema';

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://root:example@localhost:27017/grocery-store?authSource=admin';

async function seed() {
  await connect(MONGO_URI);
  const LocationModel = connection.model('Location', LocationSchema);
  const UserModel = connection.model('User', UserSchema);

  await LocationModel.deleteMany({});
  await UserModel.deleteMany({});

  // Create hierarchy of locations
  const srbija = await LocationModel.create({
    name: 'Srbija',
    type: LocationType.OFFICE,
    parent: null,
  });

  // Create Vojvodina nodes
  const vojvodina = await LocationModel.create({
    name: 'Vojvodina',
    type: LocationType.OFFICE,
    parent: srbija._id,
  });

  const severnoBacki = await LocationModel.create({
    name: 'Severno Backi',
    type: LocationType.OFFICE,
    parent: vojvodina._id,
  });

  const subotica = await LocationModel.create({
    name: 'Subotica',
    type: LocationType.OFFICE,
    parent: severnoBacki._id,
  });

  const radnja1 = await LocationModel.create({
    name: 'Radnja 1',
    type: LocationType.STORE,
    parent: subotica._id,
  });

  const juznoBacki = await LocationModel.create({
    name: 'Juzno Backi',
    type: LocationType.OFFICE,
    parent: vojvodina._id,
  });

  const noviSad = await LocationModel.create({
    name: 'Novi Sad',
    type: LocationType.OFFICE,
    parent: juznoBacki._id,
  });

  const detelinara = await LocationModel.create({
    name: 'Detelinara',
    type: LocationType.OFFICE,
    parent: noviSad._id,
  });

  const radnja2 = await LocationModel.create({
    name: 'Radnja 2',
    type: LocationType.STORE,
    parent: detelinara._id,
  });

  const radnja3 = await LocationModel.create({
    name: 'Radnja 3',
    type: LocationType.STORE,
    parent: detelinara._id,
  });

  const liman = await LocationModel.create({
    name: 'Liman',
    type: LocationType.OFFICE,
    parent: noviSad._id,
  });

  const radnja4 = await LocationModel.create({
    name: 'Radnja 4',
    type: LocationType.STORE,
    parent: liman._id,
  });

  const radnja5 = await LocationModel.create({
    name: 'Radnja 5',
    type: LocationType.STORE,
    parent: liman._id,
  });

  const gradBeograd = await LocationModel.create({
    name: 'Grad Beograd',
    type: LocationType.OFFICE,
    parent: srbija._id,
  });

  const noviBeograd = await LocationModel.create({
    name: 'Novi Beograd',
    type: LocationType.OFFICE,
    parent: gradBeograd._id,
  });

  const bezanija = await LocationModel.create({
    name: 'Bezanija',
    type: LocationType.STORE,
    parent: noviBeograd._id,
  });

  const radnja6 = await LocationModel.create({
    name: 'Radnja 6',
    type: LocationType.STORE,
    parent: bezanija._id,
  });

  const vracar = await LocationModel.create({
    name: 'Vracar',
    type: LocationType.OFFICE,
    parent: gradBeograd._id,
  });

  const neimar = await LocationModel.create({
    name: 'Neimar',
    type: LocationType.OFFICE,
    parent: vracar._id,
  });

  const crveniKrst = await LocationModel.create({
    name: 'Crveni Krst',
    type: LocationType.OFFICE,
    parent: vracar._id,
  });

  const radnja7 = await LocationModel.create({
    name: 'Radnja 7',
    type: LocationType.STORE,
    parent: neimar._id,
  });

  const radnja8 = await LocationModel.create({
    name: 'Radnja 8',
    type: LocationType.STORE,
    parent: crveniKrst._id,
  });

  const radnja9 = await LocationModel.create({
    name: 'Radnja 9',
    type: LocationType.STORE,
    parent: crveniKrst._id,
  });

  await UserModel.create([
    {
      name: 'Manager Vojvodina',
      email: 'm.vojvodina@gsi.rs',
      password: bcrypt.hashSync('pass1'),
      role: UserRole.MANAGER,
      location: vojvodina._id,
    },
    {
      name: 'Manager Novi Beograd',
      email: 'm.nb@gsi.rs',
      password: bcrypt.hashSync('pass2'),
      role: UserRole.MANAGER,
      location: noviBeograd._id,
    },
    {
      name: 'Manager Bezanija',
      email: 'm.bezanija@gsi.rs',
      password: bcrypt.hashSync('pass3'),
      role: UserRole.MANAGER,
      location: bezanija._id,
    },
    {
      name: 'Manager Radnja 1',
      email: 'm.r1@gsi.rs',
      password: bcrypt.hashSync('pass4'),
      role: UserRole.MANAGER,
      location: radnja1._id,
    },
    {
      name: 'Employee Radnja 2',
      email: 'e.r2@gsi.rs',
      password: bcrypt.hashSync('pass5'),
      role: UserRole.EMPLOYEE,
      location: radnja2._id,
    },
    {
      name: 'Employee Radnja 3',
      email: 'e.r3@gsi.rs',
      password: bcrypt.hashSync('pass6'),
      role: UserRole.EMPLOYEE,
      location: radnja3._id,
    },
    {
      name: 'Employee Radnja 4',
      email: 'e.r4@gsi.rs',
      password: bcrypt.hashSync('pass7'),
      role: UserRole.EMPLOYEE,
      location: radnja4._id,
    },
    {
      name: 'Employee Radnja 5',
      email: 'e.r5@gsi.rs',
      password: bcrypt.hashSync('pass8'),
      role: UserRole.EMPLOYEE,
      location: radnja5._id,
    },
    {
      name: 'Employee Radnja 6',
      email: 'e.r6@gsi.rs',
      password: bcrypt.hashSync('pass9'),
      role: UserRole.EMPLOYEE,
      location: radnja6._id,
    },
  ]);

  console.log('✅ Seed complete!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
