import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function createData() {
    // await prisma.movie.create({
    //     data: {
    //         //movie
    //         title: 'The Matrix',
    //     },
    // });
    // await prisma.genre.create({
    //     data: {
    //         //genre
    //         name: 'Action',
    //     },
    // });
    // await prisma.genre.create({
    //     data: {
    //         //genre
    //         name: 'Comedy',
    //     },
    // });
    // await prisma.movieGenre.create({
    //     data: {
    //         //movieGenre
    //         movieId: 1,
    //         genreId: 1,
    //     },
    // });
    // await prisma.movieGenre.create({
    //     data: {
    //         //movieGenre
    //         movieId: 1,
    //         genreId: 2,
    //     },
    // });

    console.log(
        await prisma.movie.findUnique({
            where: {
               id:1,
            },
            include: {
                MovieGenre: true,
                
            },
        })
    );
}

createData()