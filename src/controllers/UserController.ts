import { Request, Response } from 'express';
import argon2 from 'argon2';
import { addUser, getUserByEmail, incrementProfileViews, getUserById, updateEmailAddress } from '../models/UserModel';
import { parseDatabaseError } from '../utils/db-utils';

async function registerUser(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as AuthRequest;

  // IMPORTANT: Hash the password
  const passwordHash = await argon2.hash(password);

  try {
    // IMPORTANT: Store the `passwordHash` and NOT the plaintext password
    const newUser = await addUser(email, passwordHash);
    console.log(newUser);
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

async function logIn(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as AuthRequest;

  const user = await getUserByEmail(email);

  // Check if the user account exists for that email
  if (!user) {
    res.sendStatus(404); // 404 Not Found (403 Forbidden would also make a lot of sense here)
    return;
  }

  // The account exists so now we can check their password
  const { passwordHash } = user;

  // If the password does not match
  if (!(await argon2.verify(passwordHash, password))) {
    res.sendStatus(404); // 404 Not Found (403 Forbidden would also make a lot of sense here)
    return;
  }

  // The user has successfully logged in
  // NOTES: We will update this once we implement session management
  res.sendStatus(200); // 200 OK
}

async function getUserProfileData(req: Request, res: Response): Promise<void> {
  const { userId } = req.params as UserIdParam;
  // Get the user account
  let user = await getUserById(userId);
  if (!user) {
  res.sendStatus(404); // 404 Not Found
  return;
  }
  // Now update their profile views
  user = await incrementProfileViews(user);
  res.json(user); // Send back the user's data
  }


async function updateUserEmail(req: Request, res: Response): Promise<void> {
  const { userId, newEmail } = req.body as NewEmailBody;

  const user = getUserById(userId);

  if (!user) {
    res.sendStatus(404);
    return
  }

  try {
    await updateEmailAddress(userId, newEmail)
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    const databaseErrorMessage = parseDatabaseError(err);
    res.status(500).json(databaseErrorMessage);
  }
}

export { registerUser, logIn, getUserProfileData, updateUserEmail };
