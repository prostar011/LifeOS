import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@lifeos.app" },
    update: {},
    create: {
      email: "demo@lifeos.app",
      name: "Alex Demo",
      password: "demo",
      plan: "free",
    },
  });

  const now = new Date();
  const DAY = 86400000;

  // Clear old demo data
  await prisma.aiConversation.deleteMany({ where: { userId: user.id } });
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.task.deleteMany({ where: { userId: user.id } });
  await prisma.subscription.deleteMany({ where: { userId: user.id } });

  // Transactions
  const txns = [
    { merchant: "Whole Foods", amount: -87.32, category: "Groceries", daysAgo: 1 },
    { merchant: "Netflix", amount: -15.99, category: "Entertainment", daysAgo: 2 },
    { merchant: "Chipotle", amount: -14.5, category: "Dining", daysAgo: 3 },
    { merchant: "Shell Gas", amount: -45.0, category: "Transportation", daysAgo: 4 },
    { merchant: "Spotify", amount: -9.99, category: "Entertainment", daysAgo: 5 },
    { merchant: "Amazon", amount: -32.18, category: "Shopping", daysAgo: 6 },
    { merchant: "Salary Deposit", amount: 3200.0, category: "Income", daysAgo: 7 },
    { merchant: "Trader Joe's", amount: -42.67, category: "Groceries", daysAgo: 8 },
    { merchant: "Uber", amount: -18.4, category: "Transportation", daysAgo: 9 },
    { merchant: "FitLife Gym", amount: -49.0, category: "Fitness", daysAgo: 10 },
    { merchant: "Starbucks", amount: -6.75, category: "Dining", daysAgo: 11 },
    { merchant: "CVS Pharmacy", amount: -22.3, category: "Health", daysAgo: 12 },
  ];

  for (const t of txns) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        merchant: t.merchant,
        amount: t.amount,
        currency: "USD",
        category: t.category,
        date: new Date(now.getTime() - t.daysAgo * DAY),
      },
    });
  }

  // Subscriptions
  const subs = [
    { merchant: "Netflix", amount: 15.99, daysAhead: 12 },
    { merchant: "Spotify", amount: 9.99, daysAhead: 5 },
    { merchant: "FitLife Gym", amount: 49.0, daysAhead: 20 },
  ];

  for (const s of subs) {
    await prisma.subscription.create({
      data: {
        userId: user.id,
        merchant: s.merchant,
        amount: s.amount,
        isActive: true,
        nextBillingDate: new Date(now.getTime() + s.daysAhead * DAY),
      },
    });
  }

  // Tasks
  const tasks = [
    { title: "Call mom", completed: false },
    { title: "Pay rent", completed: false },
    { title: "Schedule dentist appointment", completed: false },
    { title: "Buy groceries", completed: true },
  ];

  for (const t of tasks) {
    await prisma.task.create({
      data: { userId: user.id, title: t.title, completed: t.completed },
    });
  }

  console.log("Seed complete! Demo user: demo@lifeos.app / demo");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
