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

## 4. Persistência e portabilidade

### Web MVP

- `localStorage`;
- imagens em Data URL compactadas;
- backup JSON completo.

### Schema v5

Mantém os recursos anteriores e adiciona:

- `studies: TradeStudy[]` no estado global;
- `planTemplates: PlanTemplate[]` no estado global;
- checklist estruturado com `id`, `text` e `checked`;
- convicção da tese e critério para mudança de opinião;
- score e pendências de preparação preservados nos novos snapshots;
- armazenamento separado entre estudos e planos operacionais;
- `language` continua suportando `pt-BR`, `en` e `es`;
- migração automática de dados v1, v2 e v3;
- estudos incluídos no backup JSON completo.

### Migração v1/v2/v3/v4 → v5

- regras são preservadas;
- planos são preservados;
- revisões e imagens são preservadas;
- backups v1 continuam recebendo as migrações de setups, contraprova e versionamento;
- backups v1 e v2 recebem `language: "pt-BR"` como preferência inicial;
- backups v1, v2 e v3 recebem `studies: []` na migração;
- backups v1, v2, v3 e v4 recebem `planTemplates: []`;
- checklists antigos em texto são migrados para itens estruturados inicialmente não concluídos;
- backups v4 recebem os novos campos de qualidade da preparação sem inventar scores históricos para snapshots antigos;
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
