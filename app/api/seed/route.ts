import { NextResponse } from 'next/server'
import { PrismaClient, Status } from '@/lib/generated/prisma'
import bcrypt from 'bcryptjs'
import { CITY, STATE } from './data'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    }
  }
});

const SALT_ROUNDS = 12

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'Seeding not allowed in production' },
      { status: 403 }
    )
  }

  try {
    // Seed states in batches
    const stateSeedingResults = [];
    for (let i = 0; i < STATE.length; i += 10) {
      const batch = STATE.slice(i, i + 10);
      const results = await Promise.all(
        batch.map(state => prisma.state.upsert({
          where: { name: state.name },
          update: {},
          create: { name: state.name },
        }))
      );
      stateSeedingResults.push(...results);
    }

    // Seed cities in batches
    const citySeedingResults = [];
    for (let i = 0; i < CITY.length; i += 10) {
      const batch = CITY.slice(i, i + 10);
      const results = await Promise.all(
        batch.map(city => prisma.city.upsert({
          where: {
            name_stateId: {
              name: city.name,
              stateId: parseInt(city.stateId)
            }
          },
          update: {},
          create: {
            name: city.name,
            stateId: parseInt(city.stateId)
          },
        }))
      );
      citySeedingResults.push(...results);
    }

    return NextResponse.json({
      message: 'Database seeded successfully',
      states: {
        countState: stateSeedingResults.length,
        countCity: citySeedingResults.length,
        sampleState: stateSeedingResults.slice(0, 5),
        sampleCity: citySeedingResults.slice(0, 5)
      }
    });

  } catch (error) {
    console.error('Seeding error:', error)
    return NextResponse.json(
      { error: 'Seeding failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

// // app/api/seed/route.ts
// import { NextResponse } from 'next/server'
// import { PrismaClient, Status } from '@/lib/generated/prisma'
// import bcrypt from 'bcryptjs'
// import { CITY, STATE } from './data'

// const prisma = new PrismaClient()
// const SALT_ROUNDS = 12

// export async function GET() {
//   if (process.env.NODE_ENV === 'production') {
//     return NextResponse.json(
//       { error: 'Seeding not allowed in production' },
//       { status: 403 }
//     )
//   }

//   try {
//     // const adminRole = await prisma.role.upsert({
//     //   where: { name: 'admin' },
//     //   update: {},
//     //   create: {
//     //     name: 'admin',
//     //     description: 'Administrator',
//     //     isSystemRole: true,
//     //     status: Status.active
//     //   }
//     // })

//     // const userRole = await prisma.role.upsert({
//     //   where: { name: 'user' },
//     //   update: {},
//     //   create: {
//     //     name: 'user',
//     //     description: 'Regular User',
//     //     isSystemRole: false,
//     //     status: Status.active
//     //   }
//     // })

//     // const adminPassword = await bcrypt.hash('123456', SALT_ROUNDS)
//     // const userPassword = await bcrypt.hash('123456', SALT_ROUNDS)

//     // await prisma.auth.upsert({
//     //   where: { email: 'superadmin@gkna.com' },
//     //   update: {},
//     //   create: {
//     //     email: 'superadmin@gkna.com',
//     //     password: adminPassword,
//     //     roleId: adminRole.roleId,
//     //     status: Status.active
//     //   }
//     // })

//     // await prisma.auth.upsert({
//     //   where: { email: 'agent@gkna.com' },
//     //   update: {},
//     //   create: {
//     //     email: 'agent@gkna.com',
//     //     password: userPassword,
//     //     roleId: userRole.roleId,
//     //     status: Status.active
//     //   }
//     // })

//     // return NextResponse.json({
//     //   message: 'Database seeded successfully',
//     //   roles: [adminRole, userRole]
//     // })

//     const stateSeedingResults = await Promise.all(
//       STATE.map(async (state) => {
//         return await prisma.state.upsert({
//           where: { name: state.name },
//           update: {},
//           create: {
//             name: state.name,
//           },
//         });
//       })
//     );

//     const citySeedingResults = await Promise.all(
//       CITY.map(async (city) => {
//         return await prisma.city.upsert({
//           where: {
//             name_stateId: { 
//               name: city.name,
//               stateId: parseInt(city.stateId)
//             }
//           },
//           update: {},
//           create: {
//             name: city.name,
//             stateId: parseInt(city.stateId)
//           },
//         });
//       })
//     );

//     return NextResponse.json({
//       message: 'Database seeded successfully',
//       // roles: [adminRole, userRole],
//       states: {
//         countState: stateSeedingResults.length,
//         countCity: citySeedingResults.length,
//         sampleState: stateSeedingResults.slice(0, 5),
//         sampleCity: citySeedingResults.slice(0, 5)
//       }
//     });



//   } catch (error) {
//     console.error('Seeding error:', error)
//     return NextResponse.json(
//       { error: 'Seeding failed', details: error instanceof Error ? error.message : String(error) },
//       { status: 500 }
//     )
//   } finally {
//     await prisma.$disconnect()
//   }
// }