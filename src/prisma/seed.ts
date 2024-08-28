import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

const generateUUID = (): string => {
  return uuidv4();
};
async function main() {
  const password = await bcrypt.hash('password', 10);

  await prisma.user.create({
    data: {
      uuid: generateUUID(),
      email: 'admin@gmail.com',
      name: 'Admin',
      password: password,
    },
  });
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });