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

## Persistência

Na v0.5, o desktop ainda reutiliza a persistência web existente. Atualizações do aplicativo não devem apagar esse armazenamento.

A próxima etapa arquitetural é migrar a persistência desktop para **SQLite**, com foco em robustez e preservação dos dados:

- dados fora da pasta de instalação;
- backup antes de atualizações/migrações;
- integridade verificável;
- migração do conteúdo já salvo no navegador para o banco desktop;
- restauração e backups rotativos.

A migração para SQLite deve ser implementada separadamente do primeiro empacotamento Tauri para reduzir o risco de perda de dados.
