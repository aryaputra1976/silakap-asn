export const prismaLogConfig = [
  { level: 'query', emit: 'event' },
  { level: 'error', emit: 'event' },
  { level: 'warn', emit: 'event' },
];

// Tipe aman untuk event Prisma (karena Prisma v5 tidak expose tipe resminya)
type PrismaEvent = {
  timestamp: Date;
  target: string;
  query?: string;
  params?: string;
  duration?: number;
  message?: string;
};

export function attachPrismaLogger(prisma: any) {
  prisma.$on('query', (e: PrismaEvent) => {
    console.log('🟦 PRISMA QUERY:', e.query);
    console.log('🔹 PARAMS:', e.params);
  });

  prisma.$on('error', (e: PrismaEvent) => {
    console.error('🟥 PRISMA ERROR:', e.message);
  });

  prisma.$on('warn', (e: PrismaEvent) => {
    console.warn('🟨 PRISMA WARNING:', e.message);
  });
}
