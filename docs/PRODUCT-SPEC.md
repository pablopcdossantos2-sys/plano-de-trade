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

### 3.9 Qualidade da preparação

Antes do congelamento, o sistema calcula um score de completude de 0 a 100 baseado em critérios objetivos de preenchimento. O score não é previsão de mercado nem sinal operacional.

Critérios atuais incluem:

- contexto;
- níveis importantes;
- risco máximo;
- condições de não operação;
- contraprova da tese;
- critério para mudar de opinião;
- plano comportamental;
- checklist concluído;
- cenário operacional minimamente completo;
- invalidação dos cenários utilizados.

Lacunas críticas devem gerar alerta antes do congelamento, mas o usuário pode optar por congelar mesmo assim.

### 3.10 Convicção e revisão da tese

O plano registra uma convicção subjetiva (Baixa, Média ou Alta) apenas para comparação posterior. Também registra antecipadamente quais evidências fariam o trader mudar de opinião.

### 3.11 Templates e duplicação

- um plano pode ser salvo como template reutilizável;
- templates preservam estrutura de preparação, mas reiniciam o checklist como não concluído;
- um plano anterior pode ser duplicado sem carregar revisão, versões congeladas ou estado concluído;
- cópias recebem novos identificadores de plano, cenários e checklist.

### 3.12 Aprendizado histórico

A seção Histórico transforma revisões individuais em visão longitudinal, sem duplicar os registros de origem.

Recursos:

- calendário mensal de planos por data, distinguindo rascunhos, versões congeladas e revisões concluídas;
- filtros por ativo, setup, cenário observado, aderência e período;
- aderência integral por setup;
- contagem de regras violadas a partir de seleção estruturada na revisão;
- classificação da execução como Planejada, Parcialmente planejada ou Improvisada;
- notas de 1 a 5 para qualidade da leitura e qualidade da execução, avaliadas independentemente do P&L;
- busca textual em planos/revisões, regras e setups;
- galeria agregada de imagens de planos, revisões, estudos, setups e regras.

A revisão pós-pregão passa a armazenar `executionOrigin`, `violatedRuleIds`, `readingQuality` e `executionQuality`. Dados anteriores são migrados com valores vazios/zero, sem avaliações retroativas inventadas.

### 3.13 Integração com diário de trades

A aplicação suporta importação local genérica de execuções em JSON ou CSV, sem depender de um fornecedor específico.

Cada plano possui um `sessionId` estável. Cada trade importado pode armazenar `planId`, `sessionId` e cenário A/B/C.

Recursos:

- aliases de colunas em português e inglês;
- data e ativo como campos mínimos;
- vínculo automático quando existe exatamente um plano para a mesma data + ativo;
- correção manual do vínculo;
- associação manual a cenário A/B/C;
- preenchimento não destrutivo do resumo da execução e resultado quando o plano vinculado ainda possui esses campos vazios;
- deduplicação por ID externo quando disponível ou por combinação de dados objetivos;
- detecção de trade sem cenário previamente planejado;
- relatório conjunto “Planejei × operei × registrei” combinando processo e resultado.

A especificação detalhada do formato fica em `docs/JOURNAL-INTEGRATION.md`.

### 3.14 Treinamento deliberado

A seção Treinamento usa o histórico real como material de prática deliberada.

#### Replay de decisão

- somente planos com versão congelada entram no Replay;
- contexto, níveis, contraprovas e cenários congelados são exibidos;
- resultado real, execução original e aprendizado posterior ficam ocultos;
- o trader precisa escrever sua decisão e interpretação atuais antes de revelar o desfecho;
- após revelar, registra a comparação entre “o que pensei naquela época” e “como interpreto agora”;
- o exercício é salvo somente depois da revelação do desfecho.

#### Planos de baixa aderência

Planos revisados com aderência Parcialmente ou Não aparecem em uma fila própria para revisita.

#### Exercícios por erro recorrente

O sistema agrega violações estruturadas de regras e permite transformar as mais frequentes em exercícios com:

- sinais de alerta;
- resposta concreta;
- regra de ação para uma próxima ocorrência.

#### Biblioteca pessoal de setups

Planos revisados vinculados a setups podem ser classificados como exemplos **Corretos** ou **Incorretos**, com observações e imagens do próprio plano/revisão.

#### Persistência

O schema armazena:

- `trainingRecords: TrainingRecord[]`;
- `setupExamples: SetupExample[]`.

Backups anteriores recebem arrays vazios, sem fabricar exercícios retroativos.

## 4. Persistência e portabilidade

### Web MVP

- `localStorage`;
- imagens em Data URL compactadas;
- backup JSON completo.

### Schema v8

Mantém os recursos anteriores e adiciona:

- `studies: TradeStudy[]` no estado global;
- `planTemplates: PlanTemplate[]` no estado global;
- checklist estruturado com `id`, `text` e `checked`;
- convicção da tese e critério para mudança de opinião;
- score e pendências de preparação preservados nos novos snapshots;
- revisão estruturada com origem da execução, regras violadas, qualidade da leitura e qualidade da execução;
- `sessionId` estável por plano;
- `journalTrades: JournalTrade[]` para execuções importadas e seus vínculos;
- `trainingRecords: TrainingRecord[]` para Replay, revisitas e exercícios de erro;
- `setupExamples: SetupExample[]` para biblioteca pessoal de exemplos;
- armazenamento separado entre estudos e planos operacionais;
- `language` continua suportando `pt-BR`, `en` e `es`;
- migração automática de dados v1, v2 e v3;
- estudos incluídos no backup JSON completo.

### Migração v1/v2/v3/v4/v5/v6/v7 → v8

- regras são preservadas;
- planos são preservados;
- revisões e imagens são preservadas;
- backups v1 continuam recebendo as migrações de setups, contraprova e versionamento;
- backups v1 e v2 recebem `language: "pt-BR"` como preferência inicial;
- backups v1, v2 e v3 recebem `studies: []` na migração;
- backups v1, v2, v3 e v4 recebem `planTemplates: []`;
- checklists antigos em texto são migrados para itens estruturados inicialmente não concluídos;
- backups v4 recebem os novos campos de qualidade da preparação sem inventar scores históricos para snapshots antigos;
- backups v5 recebem os novos campos históricos da revisão vazios/zero, sem inferir violações, origem ou notas;
- backups v6 recebem `sessionId` gerado para cada plano e `journalTrades: []`, sem inventar execuções históricas;
- backups v7 recebem `trainingRecords: []` e `setupExamples: []`, sem criar treinos retroativos;
- planos antigos continuam como rascunho, sem snapshots retroativos inventados.

## 5. Próximas métricas úteis

- percentual de planos congelados antes do pregão;
- aderência por setup;
- aderência por cenário;
- frequência de desvio por regra;
- diferença entre “tese correta” e “execução correta”;
- frequência com que as evidências contra a tese anteciparam uma invalidação;
- resultados por operações planejadas versus improvisadas.


## 6. Aplicativo desktop

### 6.1 Empacotamento

A versão desktop utiliza **Tauri 2** e deve ser distribuída no Windows por instalador **NSIS** em modo de instalação por usuário.

Requisitos:

- nenhuma dependência de Node.js no computador do usuário final;
- uma única instância do aplicativo;
- preservação dos dados durante atualização/reinstalação;
- versionamento sincronizado entre frontend, Cargo e configuração Tauri.

### 6.2 Atualizações

O aplicativo desktop possui um atualizador integrado.

- origem: GitHub Releases públicas;
- manifesto: `latest.json`;
- artefatos obrigatoriamente assinados;
- verificação criptográfica antes da instalação;
- instalação sobre a versão existente, sem exigir desinstalação manual;
- modo Windows `passive`;
- nenhuma permissão para downgrade.

A interface deve exibir versão instalada, disponibilidade de nova versão, notas da Release e ação para instalar.

### 6.3 Persistência desktop

Na primeira fase Tauri, a aplicação continua compatível com a persistência web existente.

A evolução seguinte deve introduzir SQLite com:

- banco fora da pasta de instalação;
- migração segura dos dados existentes;
- backup pré-migração e pré-atualização;
- verificação de integridade;
- backups rotativos;
- restauração assistida.

A introdução de SQLite deve preservar a capacidade de exportar/importar o backup JSON.


### 6.4 SQLite e backups

No desktop, SQLite substitui o `localStorage` como persistência principal.

A implementação inicial mantém o estado da aplicação como JSON versionado dentro do banco, permitindo reutilizar as mesmas migrações de schema do frontend.

Requisitos implementados:

- migração automática do estado web quando o banco desktop ainda está vazio;
- salvamento com debounce via IPC;
- backup automático diário;
- retenção dos 10 backups automáticos mais recentes;
- pasta de backup configurável;
- backup manual;
- backup pré-atualização;
- ponto de restauração pré-restore;
- `PRAGMA quick_check`;
- validação do JSON e `schemaVersion`;
- seletor nativo para pasta e arquivo de backup;
- manutenção do backup JSON como formato portátil.

A mudança para SQLite aumenta a capacidade prática para anexos e elimina o limite reduzido de armazenamento típico do navegador.
