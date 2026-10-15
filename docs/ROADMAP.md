# Roadmap — Plano de Trade

## Fase 1 — MVP de planejamento ✅

- [x] React + TypeScript.
- [x] Persistência local.
- [x] Regras do sistema de trade.
- [x] Planos por ativo e pregão.
- [x] Cenários A/B/C.
- [x] Plano comportamental.
- [x] Revisão pós-pregão.
- [x] Imagens compactadas.
- [x] Backup/restauração em JSON.
- [x] Configurações e temas.

## Fase 2 — Integridade do processo decisório ✅

### Congelamento/versionamento

- [x] Estados Rascunho e Congelado.
- [x] Snapshot imutável ao congelar o plano.
- [x] Histórico numerado de versões.
- [x] Criação de nova versão sem apagar a anterior.
- [x] Bloqueio dos campos de planejamento enquanto congelados.
- [x] Preservação da revisão como área separada e editável.

### Biblioteca de setups

- [x] CRUD de setups.
- [x] Contexto, entrada, confirmação e invalidação.
- [x] Stop, alvo, restrições e comportamento.
- [x] Imagens por setup.
- [x] Aplicação de setup ao plano diário.

### Contraprova da tese

- [x] Campo “Evidências contra minha tese / por que posso estar errado?”.
- [x] Inclusão no snapshot congelado.
- [x] Inclusão no comparador e exportação textual.

### Planejado × Mercado real × Minha execução

- [x] Comparador visual em três colunas.
- [x] Planejado baseado na última versão congelada.
- [x] Sinalização explícita quando não há versão congelada.
- [x] Campo separado para comportamento do mercado.
- [x] Campo separado para execução real do trader.
- [x] Desvios, aderência, resultado e aprendizado.

### Dados

- [x] Schema v2.
- [x] Migração automática de backups/dados v1.
- [x] Backups continuam incluindo imagens e agora incluem setups e snapshots.

## Fase 2.5 — Internacionalização ✅

- [x] Interface em Português (Brasil), English e Español.
- [x] Seletor de idioma persistente nas configurações.
- [x] Datas e horários formatados conforme o idioma selecionado.
- [x] Dados do trader mantidos semanticamente estáveis, sem tradução destrutiva dos valores persistidos.
- [x] Schema v3 com migração automática de v1 e v2.
- [x] README completo em PT-BR, inglês e espanhol, com navegação cruzada entre idiomas.

## Fase 2.6 — Estudos analíticos ✅

- [x] Seção Estudos separada de Planos de Trade.
- [x] Modelo de dados próprio para estudos.
- [x] Título, datas, ativo opcional e timeframe/recorte.
- [x] Pergunta/objetivo analítico.
- [x] Contexto, níveis, eventos e contraprova da hipótese.
- [x] Cenários A/B/C reutilizando a lógica analítica dos planos.
- [x] Campo “como eu agiria” para treino de decisão.
- [x] Conclusão, aprendizados e próximos estudos.
- [x] Imagens, status Em andamento/Concluído e exportação textual.
- [x] Suporte trilíngue desde o lançamento da funcionalidade.
- [x] Schema v4 e migração automática de v1, v2 e v3.

## Fase 3 — Qualidade da preparação ✅

- [x] Score de preparação antes do congelamento.
- [x] Alertas para campos críticos ausentes: invalidação, risco, contraprova e condições de não operação.
- [x] Checklist com estado concluído/não concluído, e não apenas texto.
- [x] Classificação de convicção da tese sem transformar convicção em sinal operacional.
- [x] Campo “o que teria de acontecer para eu mudar de opinião?”.
- [x] Templates de plano por mercado/ativo.
- [x] Duplicar plano anterior sem copiar revisão.

## Fase 4 — Aprendizado histórico ✅

- [x] Calendário de pregões planejados e revisados.
- [x] Filtros por ativo, setup, cenário, aderência e período.
- [x] Painel de aderência por setup.
- [x] Violações de regras mais frequentes.
- [x] Operações planejadas × improvisadas.
- [x] Qualidade da leitura × qualidade da execução.
- [x] Busca textual em planos, regras e setups.
- [x] Galeria histórica de imagens.

## Fase 5 — Integração com diário de trades ✅

- [x] Identificador comum entre plano, pregão e trade registrado.
- [x] Vincular trades executados ao plano e cenário correspondente.
- [x] Importar automaticamente resultado e dados objetivos da execução quando possível.
- [x] Comparar “planejei operar” × “operei” × “registrei no diário”.
- [x] Detectar trades sem cenário previamente definido.
- [x] Relatórios conjuntos de processo + resultado.

## Fase 6 — Desktop e robustez

- [x] Tauri 2.
- [x] Instalador Windows NSIS.
- [x] Instância única.
- [x] Infraestrutura de updater assinado via GitHub Releases públicas.
- [x] Painel de atualização dentro da aplicação.
- [ ] Primeira Release Windows assinada e teste end-to-end de atualização vA → vB.
- [x] CI Windows para validar e gerar instalador.
- [ ] SQLite.
- [ ] Migração do armazenamento web para banco local.
- [ ] Backups automáticos rotativos.
- [ ] Pasta configurável de backup.
- [ ] Restauração e validação de integridade.
- [ ] Maior capacidade para imagens.

## Fase 7 — Treinamento deliberado

- [ ] Modo Replay de decisão: ocultar o que aconteceu após o ponto planejado e pedir nova decisão.
- [ ] Revisitar planos com baixa aderência.
- [ ] Exercícios baseados nos próprios erros recorrentes do trader.
- [ ] Comparação “o que pensei naquele momento” × “como interpreto agora”.
- [ ] Biblioteca pessoal de exemplos corretos e incorretos de cada setup.
