import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;

export const checkDbConnection = async () => {
  try {
    await prisma.$connect();
    console.log("Database connection established successfully");
  } catch (error) {
    console.error("Error connecting to the database", error);
  } finally {
    await prisma.$disconnect();
  }
};
