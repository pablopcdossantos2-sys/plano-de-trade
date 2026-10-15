# Aplicativo desktop — Tauri, Windows e atualizações

## Objetivo

O Plano de Trade possui uma versão desktop baseada em **Tauri 2**. O objetivo é distribuir o projeto como um aplicativo Windows instalado por NSIS, mantendo a interface React/Vite e permitindo atualizações sem desinstalação manual.

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

O banco fica na pasta de dados da aplicação e armazena o estado versionado completo em JSON dentro do SQLite. Essa estratégia preserva as migrações de schema existentes e remove a limitação prática de capacidade do `localStorage`.

### Migração automática da versão web

Na primeira execução desktop:

1. o aplicativo procura um estado já salvo no SQLite;
2. se o banco estiver vazio, lê o estado local existente da versão web;
3. grava esse estado no SQLite;
4. a partir daí, o desktop passa a salvar no banco.

O conteúdo antigo do navegador não precisa ser apagado para a migração funcionar.

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

Como o desktop não depende mais do limite do `localStorage`, planos, estudos, regras e setups podem armazenar um volume maior de imagens compactadas.

A estrutura de anexos continua compatível com os backups JSON atuais.

## Release assinada ainda pendente

A infraestrutura do updater está pronta, mas a primeira Release oficial assinada e o teste completo **versão A → versão B** continuam dependentes da configuração das chaves privadas de assinatura no GitHub.
