import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';

// Step para acessar a tela de login
Given('que o usuário {string} está na tela de login', () => {
    cy.visit('/login');  // Navega até a página de login
    cy.url().should('include', '/login');  // Verifica se está na página de login
    cy.contains('Entrar').should('be.visible');  // Verifica se o botão de login está visível
});

// Step para clicar em "Cadastrar-se"
When('clica em Cadastrar-se', () => {
    cy.contains('Cadastrar-se').click();  // Clica no link para se cadastrar
    cy.url().should('include', '/register');  // Verifica se foi redirecionado para a página de registro
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

// Step para verificar redirecionamento para a página de login após registro
Then('deve ser redirecionado para a página de login', () => {
    cy.url().should('include', '/login');  // Verifica se foi redirecionado para a página de login
});

// Step para verificar mensagem de sucesso no registro
Then('deve visualizar a mensagem {string}', (message: string) => {
    cy.contains(message).should('be.visible');  // Verifica se a mensagem de sucesso está visível
});

// Step para verificar mensagem de erro ao e-mail inválido
Then('deve visualizar a mensagem de erro {string}', (message: string) => {
    cy.get('.error-message').should('contain.text', message).and('be.visible');  // Verifica a mensagem de erro
});

// Step para verificar se permanece na página de registro após erro
Then('deve permanecer na página de registro', () => {
    cy.url().should('include', '/register');  // Verifica se permanece na página de registro
});
