// import { userInfo } from 'os';
import { AppDataSource } from '../dataSource';
import { User } from '../entities/User';

const userRepository = AppDataSource.getRepository(User);

async function addUser(email: string, passwordHash: string): Promise<User> {
  // Create the new user object
  let newUser = new User();
  newUser.email = email;
  newUser.passwordHash = passwordHash;

  // Then save it to the database
  // NOTES: We reassign to `newUser` so we can access
  // NOTES: the fields the database autogenerates (the id & default columns)
  newUser = await userRepository.save(newUser);

  return newUser;
}

async function getUserByEmail(email: string): Promise<User | null> {
  return await userRepository.findOne({ where: { email } });
}

async function getUserById(userId: string): Promise<User | null> {
  const user = await userRepository.findOne({ where: { userId } });
  return user;
}

async function getUsersByViews(minViews: number): Promise<User[]> {
  const users = await userRepository
    .createQueryBuilder('user')
    .where('profileViews >= :minViews', { minViews }) // NOTES: the parameter `:minViews` must match the key name `minViews`
    .select(['user.email', 'user.profileViews', 'user.joinedOn', 'user.userId'])
    .getMany();

  return users;
}

async function incrementProfileViews(userData: User): Promise<User> {
  const updatedUser = userData;
  updatedUser.profileViews += 1;
  await userRepository
  .createQueryBuilder()
  .update(User)
  .set({ profileViews: updatedUser.profileViews })
  .where({ userId: updatedUser.userId })
  .execute();
  return updatedUser;
  }

  async function resetAllUnverifiedProfileViews(): Promise<void> {
    await userRepository
    .createQueryBuilder()
    .update(User)
    .set({ profileViews: 0 })
    .where('unverified <> true')
    .execute();
    }

async function updateEmailAddress(userId: string, newEmail: string): Promise<void> {
  await userRepository
  .createQueryBuilder()
  .update(User)
  .set({ email : newEmail })
  .where({ userId : userId })
  .execute();
}

export { addUser, getUserByEmail, getUserById, getUsersByViews, incrementProfileViews, resetAllUnverifiedProfileViews, updateEmailAddress };
