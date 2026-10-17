# Aplicativo desktop — Tauri, Windows e atualizações

## Objetivo

O Trade Blueprint possui uma versão desktop baseada em **Tauri 2**. O objetivo é distribuir o projeto como um aplicativo Windows instalado por NSIS, mantendo a interface React/Vite e permitindo atualizações sem desinstalação manual.

## Arquitetura

- Frontend: React + TypeScript + Vite.
- Desktop shell: Tauri 2.
- Instalador Windows: NSIS em modo `currentUser`.
- Instância única: `tauri-plugin-single-instance`.
- Atualizações: `tauri-plugin-updater`.
- Origem dos updates: GitHub Releases públicas.
- Manifesto de atualização: `latest.json`.
- Assinatura: chave Tauri/minisign obrigatória.

A versão web continua funcional. O frontend detecta quando está rodando dentro do Tauri e só então exibe as ações desktop de atualização.

## Desenvolvimento local

### Pré-requisitos

Além do Node.js/npm usados pela versão web, instale o ambiente exigido pelo Tauri no Windows:

- Rust;
- Microsoft C++ Build Tools;
- WebView2.

Depois:

```powershell
npm install
npm run desktop:dev
```

Para validar apenas o backend Rust:

```powershell
npm run desktop:check
```

Para gerar o instalador NSIS local:

```powershell
npm run desktop:build
```

O instalador é gerado em:

```text
src-tauri/target/release/bundle/nsis/
```

## Atualizador automático

Uma Release assinada publica:

- o instalador Windows;
- a assinatura do artefato;
- `latest.json`, usado para descobrir a versão mais recente.

O aplicativo consulta:

```text
https://github.com/pablopcdossantos2-sys/plano-de-trade/releases/latest/download/latest.json
```

Em **Configurações > Aplicativo desktop e atualizações**, o usuário pode:

1. consultar a versão instalada;
2. procurar uma atualização;
3. visualizar notas da Release;
4. baixar e verificar a assinatura;
5. iniciar a instalação da nova versão.

Não é necessário desinstalar manualmente a versão anterior.

## Configuração única das chaves de assinatura

Para um passo a passo completo voltado a usuários pouco familiarizados com terminal/GitHub, consulte [`TUTORIAL-ASSINATURA-UPDATER-WINDOWS.md`](TUTORIAL-ASSINATURA-UPDATER-WINDOWS.md).

### Caminho recomendado no Windows

Para evitar digitar manualmente o comando do Tauri, o repositório inclui:

```text
scripts/setup-updater-signing.ps1
```

Passo a passo:

1. abra a pasta do projeto no Explorador de Arquivos;
2. clique com o botão direito em `scripts/setup-updater-signing.ps1`;
3. escolha **Executar com PowerShell**; se o Windows bloquear scripts locais, abra PowerShell na pasta do projeto e execute:

   ```powershell
   powershell -ExecutionPolicy Bypass -File .\scripts\setup-updater-signing.ps1
   ```

4. o script instala as dependências, se necessário, e gera as chaves em `%USERPROFILE%\.tauri\trade-blueprint.key`;
5. copie o conteúdo da **chave pública** exibida pelo script;
6. no GitHub, abra **Settings > Secrets and variables > Actions**;
7. em **Variables**, crie `TAURI_UPDATER_PUBLIC_KEY`;
8. em **Secrets**, crie `TAURI_SIGNING_PRIVATE_KEY` com o conteúdo completo do arquivo privado;
9. se a chave possuir senha, crie também `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`;
10. execute o workflow **Signed Release Readiness**;
11. só publique a Release quando esse workflow estiver verde.

> A chave privada nunca deve ser adicionada ao Git, ao README, a issues ou a mensagens de chat. O script apenas a grava no computador do usuário.

### Caminho manual



As atualizações do Tauri precisam ser assinadas. Gere um par de chaves uma única vez.

Exemplo:

```powershell
npm run tauri signer generate -- -w "$HOME\.tauri\plano-de-trade.key"
```

Guarde a chave privada com extremo cuidado. Se ela for perdida, versões já instaladas que confiam na chave pública atual não poderão aceitar updates assinados por uma chave diferente sem uma estratégia específica de rotação.

No GitHub, configure:

### Repository variable

```text
TAURI_UPDATER_PUBLIC_KEY
```

Valor: conteúdo da chave pública gerada.

### Repository secrets

```text
TAURI_SIGNING_PRIVATE_KEY
TAURI_SIGNING_PRIVATE_KEY_PASSWORD
```

`TAURI_SIGNING_PRIVATE_KEY` deve receber o conteúdo da chave privada ou uma representação aceita pelo Tauri no ambiente de build. A senha deve corresponder à senha definida na geração; se a chave não tiver senha, configure conforme a política adotada para o workflow.

Nunca faça commit da chave privada no repositório.

## Publicando uma versão

As três versões precisam coincidir:

- `package.json`;
- `src-tauri/Cargo.toml`;
- `src-tauri/tauri.conf.json`.

Exemplo:

```text
0.5.0
```

Crie/push uma tag correspondente:

```powershell
git tag v0.5.0
git push origin v0.5.0
```

O workflow `.github/workflows/release-windows.yml`:

1. valida a sincronização das versões;
2. executa typecheck e build;
3. valida Rust;
4. lê as chaves de assinatura;
5. gera os artefatos assinados;
6. cria a GitHub Release;
7. envia o instalador e `latest.json`.

## CI do executável

O workflow `.github/workflows/desktop-windows.yml` roda em Windows e valida:

- frontend;
- Rust;
- build NSIS;
- geração do instalador.

O instalador gerado por builds comuns é disponibilizado como artifact do GitHub Actions. Releases oficiais devem usar o workflow de Release assinada.

## Persistência desktop

No aplicativo instalado, **SQLite é o armazenamento principal**.

O banco fica na pasta de dados da aplicação e armazena no SQLite o estado versionado e os metadados. A partir do schema v9, o conteúdo binário dos anexos é externalizado para arquivos individuais na subpasta `attachments`, deduplicados pelo ID lógico da imagem. Essa estratégia preserva as migrações existentes, reduz o tamanho do estado principal e remove a limitação prática de capacidade do `localStorage`.

### Migração para o SQLite

Na primeira execução desktop:

1. o aplicativo procura um estado já salvo no SQLite;
2. se o banco estiver vazio, usa o estado disponível no próprio WebView desktop;
3. grava esse estado no SQLite;
4. a partir daí, o desktop passa a salvar no banco.

Dados mantidos em um navegador externo não podem ser lidos diretamente pelo Tauri. Para migrá-los, exporte o backup JSON na versão web e importe-o no Trade Blueprint desktop. O backup mantém as migrações de schema e os anexos.

### Backups automáticos

Ao salvar no desktop, o backend verifica se já existe um backup automático do dia.

- no máximo um backup automático por dia;
- os **10 backups automáticos mais recentes** são mantidos;
- backups antigos dessa rotação são removidos automaticamente;
- o formato permanece JSON, facilitando inspeção e portabilidade.

### Pasta de backup

Em **Configurações > Aplicativo desktop e atualizações > Armazenamento desktop**, o usuário pode escolher uma pasta diferente para os backups.

Se nenhuma pasta for escolhida, é utilizada a pasta `backups` dentro da área de dados da aplicação.

A pasta selecionada é testada para confirmar permissão de gravação.

### Backup antes de operações críticas

O aplicativo cria um backup de segurança:

- antes de instalar uma atualização;
- antes de restaurar outro backup.

### Verificação de integridade

A ação **Verificar integridade** executa:

- `PRAGMA quick_check` no SQLite;
- validação do JSON salvo;
- validação de `schemaVersion`.

A interface informa também o caminho do banco e da pasta de backups.

### Restauração

A ação **Restaurar backup do desktop** abre um seletor nativo de arquivo JSON.

Antes de substituir os dados atuais, o backend cria automaticamente um backup `pre-restore`.

### Imagens

Planos, estudos, regras e setups podem armazenar um volume maior de imagens compactadas porque o conteúdo das imagens não fica duplicado dentro do estado salvo no SQLite. Cada anexo é mantido como arquivo próprio na pasta `attachments` da área de dados da aplicação.

Ao carregar o aplicativo, o backend reidrata as referências automaticamente. Backups manuais, automáticos, `pre-update` e `pre-restore` continuam sendo JSON autocontido: antes de gravá-los, o backend recoloca os dados dos anexos no `attachmentData` do schema v9. Assim, um backup pode ser levado para outra instalação sem copiar separadamente a pasta de anexos.

## Release assinada ainda pendente

A infraestrutura do updater está pronta, mas a primeira Release oficial assinada e o teste completo **versão A → versão B** continuam dependentes da configuração das chaves privadas de assinatura no GitHub.


## Reprodutibilidade do build Rust

O backend desktop passa a versionar `src-tauri/Cargo.lock`.

As validações de CI usam `--locked` em testes e Clippy, evitando que mudanças posteriores no índice do crates.io alterem silenciosamente a árvore de dependências.

Em 16/10/2026, todas as versões 4.x do crate `zip` exigidas pelo updater Tauri atual estavam marcadas como yanked no crates.io. Para preservar o updater 2.14.0 e suas proteções atuais de versão assinada, o projeto usa temporariamente a tag oficial `zip-rs/zip2 v4.6.1` por meio de `[patch.crates-io]` no `Cargo.toml`. O `Cargo.lock` fixa o commit correspondente.

Esse patch deve ser removido quando o updater Tauri deixar de depender da linha `zip 4.x` retirada do índice.

## Estado validado do instalador

Em 16/10/2026, o workflow **Desktop Windows** concluiu com sucesso:

- validação do frontend;
- testes Rust;
- Clippy;
- geração do instalador NSIS;
- upload do artefato `trade-blueprint-windows`.

Isso valida o empacotamento Windows não assinado de CI. A Release oficial assinada continua condicionada às chaves do updater configuradas no GitHub.
