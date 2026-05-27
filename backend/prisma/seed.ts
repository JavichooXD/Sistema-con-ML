import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create standard municipal areas
  const areas = [
    { name: 'Desarrollo Urbano', description: 'Trámites de obras, baches en pistas, licencias de edificación y catastro.' },
    { name: 'Licencias y Fiscalización', description: 'Licencias de funcionamiento comercial, control de ruidos molestos y fiscalización de locales.' },
    { name: 'Medio Ambiente', description: 'Mantenimiento de áreas verdes, poda de árboles, recojo de basura y limpieza pública.' },
    { name: 'Rentas y Administración', description: 'Pago de arbitrios, impuesto predial, fraccionamiento de deudas tributarias.' },
    { name: 'Defensa Civil', description: 'Inspecciones técnicas de seguridad en edificaciones (ITSE), riesgos de colapso y emergencias.' }
  ];

  for (const area of areas) {
    await prisma.area.upsert({
      where: { name: area.name },
      update: {},
      create: area,
    });
  }
  console.log('Areas seeded successfully.');

  // 2. Create a default administrative/clerk user
  const adminUser = await prisma.user.upsert({
    where: { username: 'clerk_user' },
    update: {},
    create: {
      username: 'clerk_user',
      password: 'clerkPassword123', // En producción se debe cifrar (ej. bcrypt)
      role: 'CLERK',
    },
  });
  console.log('Default clerk user seeded:', adminUser.username);

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
