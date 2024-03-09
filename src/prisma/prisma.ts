import { PrismaClient } from '@prisma/client';
import userExtensions from './extensions/user/user.extensions';

const prisma = new PrismaClient().$extends(userExtensions);

export default prisma;
