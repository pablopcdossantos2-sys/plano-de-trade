# Roadmap — Plano de Trade

## Fase 1 — MVP funcional ✅

- Estrutura React + TypeScript.
- Regras do sistema de trade.
- Planejamento por ativo e data.
- Cenários A/B/C.
- Plano comportamental condicional.
- Revisão pós-pregão.
- Anexos de imagem.
- Backup/restauração JSON.
- Configurações básicas.

## Fase 2 — Qualidade do planejamento

- Checklist marcável por plano, preservando o estado de cada item.
- Biblioteca de templates de cenários e setups.
- Tags de contexto: tendência, range, gap, volatilidade, localização, notícia, abertura etc.
- Níveis estruturados com tipo, preço/região e motivo.
- Campo de “evidências contra minha tese” para reduzir viés de confirmação.
- Campo obrigatório de invalidação antes de um cenário poder ser marcado como pronto.
- Score de preparação do plano, sem transformar o score em recomendação operacional.

## Fase 3 — Aprendizado pós-pregão

- Comparador lado a lado **Planejado × Mercado real × Minha execução**.
- Métrica de aderência às próprias regras.
- Métrica de aderência aos cenários planejados.
- Registro de “cenário não previsto” e criação assistida de nova hipótese para a biblioteca.
- Histórico de erros comportamentais recorrentes.
- Busca por ativo, contexto, cenário e regra violada.

## Fase 4 — Calendário e rotina

- Calendário mensal de planos.
- Tela “Preparar amanhã”.
- Tela “Revisões pendentes”.
- Rotina de fechamento do dia com checklist.
- Duplicação de plano anterior como ponto de partida, sem copiar a revisão.
- Modelos diferentes para WIN, WDO, DI, índices americanos e outros ativos.

## Fase 5 — Desktop e persistência robusta

- Tauri 2.
- SQLite local.
- Repositório de dados desacoplado da interface.
- Migração automática do armazenamento web para SQLite.
- Backups automáticos em pasta escolhida pelo usuário.
- Política de retenção de backups.
- Exportação/relatório em PDF e CSV quando fizer sentido.

## Fase 6 — Integração com Trade Journal Tracker

- Vincular um plano pré-mercado ao dia/trades correspondentes no diário.
- Reaproveitar cadastro de ativos e regras relevantes.
- Enviar para o diário as observações de execução sem duplicação manual.
- Cruzar resultado financeiro com aderência ao plano, evitando avaliar uma boa decisão apenas pelo P&L.

## Fase 7 — Recursos educacionais e analíticos

- Replay de um dia: esconder o futuro e pedir ao trader para revisar cenários passo a passo.
- Exercícios de “o que invalida esta hipótese?”.
- Relatório semanal de qualidade de preparação.
- Biblioteca de casos: cenário correto/execução errada, cenário errado/execução correta etc.
- Detecção de padrões como excesso de cenários, ausência de invalidação e mudança frequente de tese durante o pregão.

## Princípios do produto

1. **Planejar não é prever.** O sistema deve incentivar respostas condicionais, não certezas sobre o futuro.
2. **Resultado não valida automaticamente uma decisão.** Uma operação fora do plano pode dar lucro e continuar sendo um erro de processo.
3. **O plano original deve ser preservado.** A revisão pós-pregão nunca deve sobrescrever silenciosamente o que foi escrito antes.
4. **Invalidação faz parte da hipótese.** Todo cenário útil precisa dizer em que condições deixa de valer.
5. **Dados pertencem ao usuário.** Operação local, backup simples e exportabilidade são requisitos centrais.
