# Product Spec — Plano de Trade

## 1. Propósito

O Plano de Trade é uma ferramenta de preparação e revisão deliberada para traders. Seu objetivo principal não é medir apenas P&L, mas melhorar a qualidade do processo decisório antes, durante e depois do pregão.

A ferramenta deve ajudar o usuário a:

- tornar explícitas as regras do próprio sistema;
- reconhecer setups repetíveis;
- formular hipóteses condicionais para o próximo pregão;
- procurar evidências que contradigam a própria tese;
- decidir antecipadamente como agir nos cenários A/B/C;
- preservar a versão do plano existente antes da execução;
- registrar separadamente mercado real e comportamento real;
- comparar planejamento, contexto observado e execução;
- transformar aprendizados em melhorias do sistema.

## 2. Princípios de produto

### Processo acima do resultado isolado

Uma operação lucrativa pode ter sido uma decisão ruim e uma operação perdedora pode ter sido uma boa decisão. Por isso, aderência ao processo deve ser tratada separadamente do resultado financeiro.

### O passado não pode ser reescrito

Depois que o plano é considerado pronto para o pregão, o usuário deve poder congelá-lo. Alterações posteriores exigem uma nova versão, preservando as anteriores.

### Hipóteses precisam ser falsificáveis

Toda tese deve possuir sinais de invalidação. Além dos critérios de invalidação de cada cenário, o plano possui um campo explícito de **evidências contra a tese** para reduzir viés de confirmação.

### Setup não é plano diário

Um setup é um padrão reutilizável. O plano diário é uma aplicação contextual desse padrão em um ativo e pregão específicos.

## 3. Áreas da aplicação

### 3.1 Visão geral

Exibe:

- regras ativas;
- setups ativos;
- planos congelados;
- aderência integral em planos revisados;
- agenda de planos futuros;
- status de cada plano: rascunho, congelado ou revisado.

### 3.2 Sistema de trade

Cada regra contém:

- nome;
- categoria;
- descrição objetiva;
- justificativa;
- ativa/inativa;
- imagens;
- datas de criação e alteração.

### 3.3 Biblioteca de setups

Cada setup contém:

- nome e descrição;
- contexto de melhor funcionamento;
- critérios de entrada;
- confirmações;
- invalidação;
- stop/risco;
- alvo/gestão;
- comportamentos a evitar;
- cuidados comportamentais;
- imagens;
- ativo/inativo.

Um setup ativo pode ser aplicado a um plano. Na versão atual, ele preenche o cenário A e os campos gerais de contexto/comportamento relacionados.

### 3.4 Plano de trade

Campos principais:

- data do plano e data do pregão;
- ativo;
- viés;
- setup de referência opcional;
- contexto;
- níveis importantes;
- eventos/horários de atenção;
- evidências contra a tese;
- risco máximo;
- máximo de operações;
- condições para não operar;
- checklist;
- cenários A/B/C;
- plano comportamental;
- imagens.

### 3.5 Estudos

Estudos são registros analíticos independentes de Planos de Trade. Seu propósito é permitir treino deliberado, investigação de padrões e exercício da capacidade de leitura sem pressupor intenção de operar.

Campos principais:

- título;
- data do estudo;
- data de mercado analisada opcional;
- ativo opcional;
- timeframe/recorte;
- viés ou hipótese inicial;
- setup de referência opcional;
- pergunta/objetivo;
- contexto;
- níveis importantes;
- eventos/fatores relevantes;
- evidências contra a hipótese;
- cenários A/B/C;
- plano de decisão / “como eu agiria”;
- conclusão;
- aprendizados e próximos estudos;
- imagens;
- status `draft` ou `completed`.

Os estudos devem permanecer em coleção própria e não participar da agenda operacional de planos.

### 3.6 Congelamento e versões

Estados:

- `draft`: planejamento editável;
- `frozen`: planejamento bloqueado.

Ao congelar:

1. o sistema cria um `PlanSnapshot`;
2. atribui um número sequencial à versão;
3. registra `frozenAt`;
4. copia para a fotografia todos os campos relevantes do planejamento, inclusive cenários e imagens;
5. bloqueia a edição da preparação.

Para alterar o planejamento, o usuário escolhe **Criar nova versão**. A versão anterior continua no histórico.

### 3.7 Revisão e comparador

A revisão permanece editável mesmo quando a preparação está congelada.

O comparador apresenta:

#### Planejado

- última versão congelada;
- viés;
- cenários;
- evidências contra a tese;
- condições de não operação;
- plano comportamental.

#### Mercado real

- descrição do comportamento do mercado;
- cenário predominante.

#### Minha execução

- descrição das ações realizadas;
- aderência ao plano;
- desvios;
- resultado.

A ausência de uma versão congelada deve ser explicitamente sinalizada.

### 3.8 Internacionalização

A interface deve suportar, no mínimo:

- Português (Brasil);
- English;
- Español.

A preferência é persistida nas configurações e incluída no backup. A internacionalização não deve traduzir nem reescrever destrutivamente textos criados pelo usuário. Valores internos necessários à compatibilidade histórica permanecem estáveis e recebem apenas rótulos localizados na interface.

## 4. Persistência e portabilidade

### Web MVP

- `localStorage`;
- imagens em Data URL compactadas;
- backup JSON completo.

### Schema v4

Mantém os recursos anteriores e adiciona:

- `studies: TradeStudy[]` no estado global;
- armazenamento separado entre estudos e planos operacionais;
- `language` continua suportando `pt-BR`, `en` e `es`;
- migração automática de dados v1, v2 e v3;
- estudos incluídos no backup JSON completo.

### Migração v1/v2/v3 → v4

- regras são preservadas;
- planos são preservados;
- revisões e imagens são preservadas;
- backups v1 continuam recebendo as migrações de setups, contraprova e versionamento;
- backups v1 e v2 recebem `language: "pt-BR"` como preferência inicial;
- backups v1, v2 e v3 recebem `studies: []` na migração;
- planos antigos continuam como rascunho, sem snapshots retroativos inventados.

## 5. Próximas métricas úteis

- percentual de planos congelados antes do pregão;
- aderência por setup;
- aderência por cenário;
- frequência de desvio por regra;
- diferença entre “tese correta” e “execução correta”;
- frequência com que as evidências contra a tese anteciparam uma invalidação;
- resultados por operações planejadas versus improvisadas.
