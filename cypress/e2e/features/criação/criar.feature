Feature: Criação de usuário
  Como um novo usuário
  Quero criar uma conta no sistema
  Para poder acessar e gerenciar minhas tarefas pessoais

  Background:
    Given que o usuário "John" está na página de registro

  Scenario: Criação de usuário com dados válidos
    When preenche o nome "John Doe"
    And preenche o e-mail "john@user.example"
    And preenche a senha "123456"
    And envia o formulário de registro
    Then deve ser redirecionado para a página de login
    And deve visualizar a mensagem "Cadastro realizado com sucesso"

  Scenario: Criação de usuário com e-mail inválido
    When preenche o nome "John Doe"
    And preenche o e-mail "john@user"
    And preenche a senha "123456"
    And envia o formulário de registro
    Then deve visualizar a mensagem de erro "E-mail inválido"
    And deve permanecer na página de registro
