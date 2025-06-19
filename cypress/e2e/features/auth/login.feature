Feature: Login de usuário
  Como um usuário do sistema
  Quero poder acessar minha conta com segurança
  Para acessar e gerenciar minhas tarefas pessoais

  Background:
    Given que o usuário "John" está cadastrado com o e-mail "john@user.example" e a senha "123456"
    And está na página de login

  Scenario: Login com credenciais válidas
    When informa o e-mail "john@user.example" e a senha "123456"
    And envia o formulário de login
    Then deve ser redirecionado para a página de tarefas
    And deve visualizar a lista de tarefas

  Scenario: Login com senha incorreta
    When informa o e-mail "john@user.example" e a senha "12345"
    And envia o formulário de login
    Then deve visualizar a mensagem de erro "Falha no login. Verifique suas credenciais."
    And deve permanecer na página de login


