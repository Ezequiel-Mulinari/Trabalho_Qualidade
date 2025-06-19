/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock do middleware de autenticação para simular a autenticação durante o teste
jest.mock('../../middlewares/auth.middleware', () => ({
    authenticate: (req: any, res: any, next: any) => {
        req.userId = testUser.id ?? 1;
        next();
    },
}));

import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import app from '../../app';
import { prisma } from '../../utils/prisma';
import { setupTestDB, disconnectTestDB, testUser } from '../setup.test.db';

beforeAll(async () => {
    await setupTestDB();
});

afterAll(async () => {
    await disconnectTestDB();
});

describe('TaskController', () => {
    describe('POST /api/tasks', () => {
        it('deve criar tarefa com dados válidos', async () => {
            // Arrange (preparar)
            const taskData = {
                title: `Tarefa válida ${new Date()}`,
                description: 'Essa é uma tarefa válida',
                completed: false,
                priority: 'low',
            };

            // Act (agir)
            const response = await request(app).post('/api/tasks').send(taskData);

            // Assert (verificar)
            expect(response.statusCode).toBe(StatusCodes.CREATED);
            expect(response.body).toEqual({
                ...taskData,
                id: expect.any(Number),
                userId: 1,
                dueDate: null,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            });

            const taskInDB = await prisma.task.findFirst({ where: { title: taskData.title } });
            expect(taskInDB).toEqual(
                expect.objectContaining({
                    ...taskData,
                    id: expect.any(Number),
                    userId: 1,
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                }),
            );
        });
    });

    // ### Teste integração Zequi ####


    describe('GET /api/tasks', () => {
        beforeAll(async () => {
            // Limpar todas as tarefas antes de rodar o teste
            await prisma.task.deleteMany();
        });
    
        it('deve retornar status 200 mesmo sem tarefas criadas', async () => {
            // Act (agir) - Realiza a requisição GET para listar as tarefas
            const response = await request(app).get('/api/tasks').send();
    
            // Assert (verificar) - Verifica se o status da resposta é 200
            expect(response.statusCode).toBe(StatusCodes.OK);
            expect(response.body).toEqual([]);  // Espera-se que o corpo da resposta seja uma lista vazia
        });
    });

    describe('GET /api/tasks', () => {
        it('deve retornar um array vazio quando não houver tarefas', async () => {
            // Act (agir) - Realiza a requisição GET para listar as tarefas
            const response = await request(app).get('/api/tasks').send();
    
            // Assert (verificar) - Verifica se a resposta é um array vazio
            expect(response.statusCode).toBe(StatusCodes.OK);
            expect(Array.isArray(response.body)).toBe(true);  // Verifica se a resposta é um array
            expect(response.body).toEqual([]);  // Espera-se que o corpo da resposta seja um array vazio
        });
    });
    
    
    
});
