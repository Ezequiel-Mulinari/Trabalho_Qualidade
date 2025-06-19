import { InvalidTaskNameError } from '../../errors/task/InvalidTaskNameError';
import { TaskNotFoundError } from '../../errors/task/TaskNotFoundError';
import { AuthService } from '../../services/auth.service';
import { TaskService } from '../../services/task.service';
import { prisma } from '../../utils/prisma';

jest.mock('../../utils/prisma', () => ({
    prisma: {
        task: {
            create: jest.fn(),
            findMany: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

describe('TaskService', () => {
    const userId = 1;
    const tarefasMock = [
        { id: 1, title: 'Tarefa 1', userId, completed: true, priority: 'high' },
        { id: 2, title: 'Tarefa 2', userId, completed: false, priority: 'high' },
        { id: 3, title: 'Tarefa 3', userId, completed: true, priority: 'medium' },
        { id: 4, title: 'Tarefa 4', userId, completed: true, priority: 'high' },
    ];

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createTask', () => {
        it('deve criar tarefa quando o título for válido', async () => {
            // Arrange (preparar)
            const dadosValidos = {
                title: 'Tarefa válida',
                description: 'Essa é uma tarefa com o título válido',
            };

            const tarefaCriadaMock = {
                id: 1,
                ...dadosValidos,
                dueDate: null,
                priority: null,
                userId,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            (prisma.task.create as jest.Mock).mockResolvedValue(tarefaCriadaMock);

            // Act (agir)
            const tarefa = await TaskService.createTask(userId, dadosValidos);

            // Assert (verificar)
            expect(prisma.task.create).toHaveBeenCalledWith({
                data: {
                    ...dadosValidos,
                    dueDate: null,
                    priority: undefined,
                    userId,
                },
            });

            expect(tarefa).toEqual(tarefaCriadaMock);
        });

        it('deve lançar erro se o título da tarefa começar com número', async () => {
            // Arrange (preparar)
            const dadosInvalidos = {
                title: '1 Tarefa inválida',
                description: 'Essa é uma tarefa com o título inválido',
            };

            // Act (agir)
            const promise = TaskService.createTask(userId, dadosInvalidos);

            // Assert (verificar)
            await expect(promise).rejects.toBeInstanceOf(InvalidTaskNameError);
        });

        it('deve criar tarefa com todos os campos preenchidos', async () => {
            // Arrange (preparar)
            const dadosEntrada = {
                title: 'Nova tarefa',
                description: 'Descrição',
                dueDate: '2025-05-30',
                priority: 'medium',
            };

            const tarefaEsperada = {
                id: 1,
                ...dadosEntrada,
                dueDate: new Date(dadosEntrada.dueDate),
                userId,
            };

            (prisma.task.create as jest.Mock).mockResolvedValue(tarefaEsperada);

            // Act (agir)
            const resultado = await TaskService.createTask(userId, dadosEntrada);

            // Assert (verificar)
            expect(prisma.task.create).toHaveBeenCalledWith({
                data: {
                    ...dadosEntrada,
                    dueDate: new Date(dadosEntrada.dueDate),
                    userId,
                },
            });

            expect(resultado).toEqual(tarefaEsperada);
        });

        it('deve aceitar data de vencimento nula', async () => {
            // Arrange (preparar)
            const dadosEntrada = { title: 'Tarefa sem data de vencimento', dueDate: null };
            const tarefaEsperada = { id: 2, ...dadosEntrada, userId };

            (prisma.task.create as jest.Mock).mockResolvedValue(tarefaEsperada);

            // Act (agir)
            const resultado = await TaskService.createTask(userId, dadosEntrada);

            // Assert (verificar)
            expect(resultado.dueDate).toBeNull();
        });
    });

    describe('getTasks', () => {
        it('deve retornar tarefas filtradas por prioridade e status de conclusão', async () => {
            // Arrange (preparar)
            const filtros = { completed: 'true', priority: 'high' };
            const tarefasFiltradas = tarefasMock.filter(
                (tarefa) => tarefa.completed && tarefa.priority === 'high',
            );

            (prisma.task.findMany as jest.Mock).mockResolvedValue(tarefasFiltradas);

            // Act (agir)
            const resultado = await TaskService.getTasks(userId, filtros);

            // Assert (verificar)
            expect(prisma.task.findMany).toHaveBeenCalledWith({
                where: { userId, completed: true, priority: 'high' },
                orderBy: { createdAt: 'desc' },
            });

            expect(resultado).toEqual(tarefasFiltradas);
        });

        it('deve retornar todas as tarefas se não houver filtros', async () => {
            // Arrange (preparar)
            (prisma.task.findMany as jest.Mock).mockResolvedValue(tarefasMock);

            // Act (agir)
            const resultado = await TaskService.getTasks(userId, {});

            // Assert (verificar)
            expect(prisma.task.findMany).toHaveBeenCalledWith({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            });

            expect(resultado).toEqual(tarefasMock);
        });
    });

    describe('getTaskById', () => {
        it('deve retornar uma tarefa existente pelo seu identificador', async () => {
            // Arrange (preparar)
            (prisma.task.findUnique as jest.Mock).mockResolvedValue(tarefasMock[0]);

            // Act (agir)
            const resultado = await TaskService.getTaskById(userId, tarefasMock[0].id);

            // Assert (verificar)
            expect(resultado).toEqual(tarefasMock[0]);
        });

        it('deve lançar erro ao buscar tarefa pelo identificador se a tarefa não existir', async () => {
            // Arrange (preparar)
            (prisma.task.findUnique as jest.Mock).mockResolvedValue(null);

            // Act (agir)
            const promise = TaskService.getTaskById(userId, 999);

            // Assert (verificar)
            await expect(promise).rejects.toBeInstanceOf(TaskNotFoundError);
        });
    });

    describe('updateTask', () => {
        it('deve atualizar a tarefa com os dados fornecidos', async () => {
            // Arrange (preparar)
            const dadosAtualizacao = {
                title: 'Tarefa atualizada',
                completed: true,
                dueDate: '2025-06-01',
            };

            const tarefaAtualizada = {
                id: 1,
                ...dadosAtualizacao,
                dueDate: new Date(dadosAtualizacao.dueDate),
                userId,
            };

            (prisma.task.update as jest.Mock).mockResolvedValue(tarefaAtualizada);

            // Act (agir)
            const resultado = await TaskService.updateTask(userId, 1, dadosAtualizacao);

            // Assert (verificar)
            expect(prisma.task.update).toHaveBeenCalledWith({
                where: { id: 1, userId },
                data: { ...dadosAtualizacao, dueDate: new Date(dadosAtualizacao.dueDate) },
            });

            expect(resultado).toEqual(tarefaAtualizada);
        });

        it('deve permitir atualização parcial da tarefa', async () => {
            // Arrange (preparar)
            const dadosAtualizacao = { title: 'Tarefa com o título atualizado' };
            const tarefaAtualizada = { id: 2, ...dadosAtualizacao, userId };

            (prisma.task.update as jest.Mock).mockResolvedValue(tarefaAtualizada);

            // Act (agir)
            const resultado = await TaskService.updateTask(userId, 2, dadosAtualizacao);

            // Assert (verificar)
            expect(resultado).toEqual(tarefaAtualizada);
        });
    });

    describe('deleteTask', () => {
        it('deve excluir a tarefa pelo seu identificador', async () => {
            // Arrange (preparar)
            (prisma.task.delete as jest.Mock).mockResolvedValue(undefined);

            // Act (agir)
            await TaskService.deleteTask(userId, 1);

            // Assert (verificar)
            expect(prisma.task.delete).toHaveBeenCalledWith({
                where: { id: 1, userId },
            });
        });
    });

    //## Meu teste Zequi ##

    it('deve criar tarefa com dados opcionais faltando', async () => {
        // Arrange (preparar)
        const dadosEntrada = {
            title: 'Tarefa com dados opcionais', // Título fornecido
            // description: 'Descrição não fornecida', // Não fornecemos descrição
            dueDate: null,  // Não fornecemos data de vencimento
            priority: 'medium', // Prioridade fornecida
        };
    
        const tarefaEsperada = {
            id: 2,
            title: dadosEntrada.title,
            description: undefined,  // Espera-se que a descrição seja indefinida
            dueDate: null,  // Data de vencimento nula
            priority: dadosEntrada.priority,
            userId,
        };
    
        (prisma.task.create as jest.Mock).mockResolvedValue(tarefaEsperada);
    
        // Act (agir)
        const resultado = await TaskService.createTask(userId, dadosEntrada);
    
        // Assert (verificar)
        expect(prisma.task.create).toHaveBeenCalledWith({
            data: {
                ...dadosEntrada,
                description: undefined,  // Não fornecemos descrição
                dueDate: null,
                userId,
            },
        });
    
        expect(resultado).toEqual(tarefaEsperada);
    });
    
    it('deve criar tarefa sem descrição', async () => {
        // Arrange (preparar)
        const dadosEntrada = {
            title: 'Tarefa sem descrição', // Título fornecido
            // description: undefined, // Não fornecemos descrição
            dueDate: '2025-06-30',  // Data de vencimento fornecida
            priority: 'low', // Prioridade fornecida
        };
    
        const tarefaEsperada = {
            id: 3,
            title: dadosEntrada.title,
            description: undefined,  // Espera-se que a descrição seja indefinida
            dueDate: new Date(dadosEntrada.dueDate), // Data de vencimento fornecida
            priority: dadosEntrada.priority,
            userId,
        };
    
        // Mock de criação da tarefa
        (prisma.task.create as jest.Mock).mockResolvedValue(tarefaEsperada);
    
        // Act (agir)
        const resultado = await TaskService.createTask(userId, dadosEntrada);
    
        // Assert (verificar)
        expect(prisma.task.create).toHaveBeenCalledWith({
            data: {
                ...dadosEntrada,
                description: undefined,  // Não fornecemos descrição
                dueDate: new Date(dadosEntrada.dueDate),  // Verifica se a data foi configurada corretamente
                userId,
            },
        });
    
        expect(resultado).toEqual(tarefaEsperada);
    });
    
    it('deve criar tarefa sem data de vencimento', async () => {
        // Arrange (preparar)
        const dadosEntrada = {
            title: 'Tarefa sem data de vencimento', // Título fornecido
            description: 'Descrição da tarefa sem data', // Descrição fornecida
            // dueDate: undefined, // Não fornecemos data de vencimento
            priority: 'medium', // Prioridade fornecida
        };
    
        const tarefaEsperada = {
            id: 4,
            title: dadosEntrada.title,
            description: dadosEntrada.description,
            dueDate: null,  // Data de vencimento nula, já que não fornecemos
            priority: dadosEntrada.priority,
            userId,
        };
    
        // Mock de criação da tarefa
        (prisma.task.create as jest.Mock).mockResolvedValue(tarefaEsperada);
    
        // Act (agir)
        const resultado = await TaskService.createTask(userId, dadosEntrada);
    
        // Assert (verificar)
        expect(prisma.task.create).toHaveBeenCalledWith({
            data: {
                ...dadosEntrada,
                dueDate: null,  // Certifica que o campo `dueDate` está nulo
                userId,
            },
        });
    
        expect(resultado).toEqual(tarefaEsperada);
    });
    
 
    it('deve criar tarefa com todos os campos obrigatórios preenchidos', async () => {
        // Arrange (preparar)
        const dadosEntrada = {
            title: 'Tarefa com todos os dados',  // Título fornecido
            description: 'Descrição da tarefa completa', // Descrição fornecida
            dueDate: '2025-07-01',  // Data de vencimento fornecida como string
            priority: 'high', // Prioridade fornecida
        };
    
        const tarefaEsperada = {
            id: 5,
            ...dadosEntrada,
            dueDate: new Date(dadosEntrada.dueDate),  // Convertendo a data para o tipo Date
            userId,
        };
    
        // Mock de criação da tarefa
        (prisma.task.create as jest.Mock).mockResolvedValue(tarefaEsperada);
    
        // Act (agir)
        const resultado = await TaskService.createTask(userId, dadosEntrada);
    
        // Assert (verificar)
        expect(prisma.task.create).toHaveBeenCalledWith({
            data: {
                ...dadosEntrada,
                dueDate: new Date(dadosEntrada.dueDate),  // Verifica se a data foi configurada corretamente
                userId,
            },
        });
    
        expect(resultado).toEqual(tarefaEsperada);
    });
    
    it('deve excluir a tarefa corretamente', async () => {
        // Arrange (preparar)
        const tarefaParaExcluir = {
            id: 1,
            title: 'Tarefa a ser excluída',
            description: 'Descrição da tarefa que será excluída',
            priority: 'low',
            dueDate: null,
            userId,
        };
    
        // Mock de exclusão da tarefa
        (prisma.task.delete as jest.Mock).mockResolvedValue(tarefaParaExcluir);
    
        // Act (agir)
        await TaskService.deleteTask(userId, tarefaParaExcluir.id);
    
        // Assert (verificar)
        expect(prisma.task.delete).toHaveBeenCalledWith({
            where: { id: tarefaParaExcluir.id, userId },
        });
    });
    
    it('deve retornar tarefas com a prioridade especificada', async () => {
        // Arrange (preparar)
        const filtros = { priority: 'high' };
        const tarefasFiltradas = [
            { id: 1, title: 'Tarefa 1', userId, completed: true, priority: 'high' },
            { id: 2, title: 'Tarefa 2', userId, completed: false, priority: 'high' },
        ];
    
        // Simulando a resposta do banco de dados com as tarefas filtradas por prioridade
        (prisma.task.findMany as jest.Mock).mockResolvedValue(tarefasFiltradas);
    
        // Act (agir)
        const resultado = await TaskService.getTasks(userId, filtros);
    
        // Assert (verificar)
        expect(prisma.task.findMany).toHaveBeenCalledWith({
            where: { userId, priority: 'high' },  // Verifica se o filtro de prioridade foi aplicado
            orderBy: { createdAt: 'desc' },
        });
    
        expect(resultado).toEqual(tarefasFiltradas);
    });
    it('deve retornar a tarefa correta pelo ID', async () => {
        // Arrange (preparar)
        const tarefaId = 1;
        const tarefaEsperada = {
            id: tarefaId,
            title: 'Tarefa 1',
            userId,
            completed: true,
            priority: 'high',
            description: 'Descrição da Tarefa 1',
            dueDate: null,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    
        // Simulando a resposta do banco de dados
        (prisma.task.findUnique as jest.Mock).mockResolvedValue(tarefaEsperada);
    
        // Act (agir)
        const resultado = await TaskService.getTaskById(userId, tarefaId);
    
        // Assert (verificar)
        expect(prisma.task.findUnique).toHaveBeenCalledWith({
            where: { id: tarefaId, userId },
        });
    
        expect(resultado).toEqual(tarefaEsperada);
    });
    
    
});
