Feature: Criação de tarefas
  Como um usuário autenticado
  Desejo criar novas tarefas
  Para organizar e acompanhar minhas atividades

  Background:
    Given que o usuário "John" está cadastrado com o e-mail "john@user.example" e a senha "123456"
    And está autenticado com o e-mail "john@user.example" e a senha "123456"
    And acessa a página de criação de tarefas

  Scenario: Criação bem-sucedida de uma nova tarefa
    When preenche o título "Entregar trabalho final de QTSW"
    And preenche a descrição "Trabalho final da UC de Qualidade e Teste de Software"
    And seleciona a prioridade "alta"
    And envia o formulário de criação
    Then a tarefa "Entregar trabalho final de QTSW" deve aparecer na lista de tarefas

 
 Scenario: Edição bem-sucedida de uma tarefa existente
    Given a tarefa "Entregar trabalho final de QTSW" foi criada
    When edita o título da tarefa para "Entregar trabalho final de QTSW - Atualizado"
    And envia o formulário de edição
    Then a tarefa "Entregar trabalho final de QTSW - Atualizado" deve aparecer na lista de tarefas
 
 