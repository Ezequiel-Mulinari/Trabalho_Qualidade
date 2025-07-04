import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

Given(
    'que o usuário {string} está cadastrado com o e-mail {string} e a senha {string}',
    (name: string, email: string, password: string) => {
        cy.registerUser({ name, email, password });
    },
);

Given('está na página de login', () => {
    cy.visit('/login');
    cy.url().should('include', '/login');
    cy.contains('Entrar').should('be.visible');
});

When('informa o e-mail {string} e a senha {string}', (email: string, password: string) => {
    cy.get('input[name="email"]').clear().type(email);
    cy.get('input[name="password"]').clear().type(password);
});

When('envia o formulário de login', () => {
    cy.get('form[data-testid="login-form"]').submit();
});

Then('deve ser redirecionado para a página de tarefas', () => {
    cy.url().should('include', '/tasks');
});

Then('deve visualizar a lista de tarefas', () => {
    cy.contains('Minhas Tarefas').should('be.visible');
});

Then('deve visualizar a mensagem de erro {string}', (message: string) => {
    cy.get('.error-message').should('contain.text', message).and('be.visible');
});

Then('deve permanecer na página de login', () => {
    cy.url().should('include', '/login');
});







// Step para acessar a página de registro
Given('que o usuário {string} está na página de registro', (name: string) => {
    cy.visit('/register');  // Página de registro
    cy.url().should('include', '/register');  // Verifica se está na página de registro
    cy.contains('Criar Conta').should('be.visible');  // Verifica se o botão de registro está visível
});

// Step para preencher o nome do usuário
When('preenche o nome {string}', (name: string) => {
    cy.get('input[name="name"]').clear().type(name);  // Preenche o nome
});

// Step para preencher o e-mail
When('preenche o e-mail {string}', (email: string) => {
    cy.get('input[name="email"]').clear().type(email);  // Preenche o e-mail
});

// Step para preencher a senha
When('preenche a senha {string}', (password: string) => {
    cy.get('input[name="password"]').clear().type(password);  // Preenche a senha
});

// Step para enviar o formulário de registro
When('envia o formulário de registro', () => {
    cy.get('form[data-testid="register-form"]').submit();  // Envia o formulário
});

// Step para verificar redirecionamento para a página de login
Then('deve ser redirecionado para a página de login', () => {
    cy.url().should('include', '/login');  // Verifica se foi redirecionado para a página de login
});

// Step para verificar mensagem de sucesso
Then('deve visualizar a mensagem {string}', (message: string) => {
    cy.contains(message).should('be.visible');  // Verifica se a mensagem de sucesso está visível
});

// Step para verificar mensagem de erro ao e-mail inválido
Then('deve visualizar a mensagem de erro {string}', (message: string) => {
    cy.get('.error-message').should('contain.text', message).and('be.visible');  // Verifica a mensagem de erro
});

// Step para verificar se permanece na página de registro
Then('deve permanecer na página de registro', () => {
    cy.url().should('include', '/register');  // Verifica se permanece na página de registro
});
