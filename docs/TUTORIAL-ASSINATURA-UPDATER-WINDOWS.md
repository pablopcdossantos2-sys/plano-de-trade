# Tutorial — assinatura do updater e primeira Release Windows

Este tutorial é necessário apenas para publicar versões oficiais do **Trade Blueprint** capazes de atualizar uma instalação existente com verificação criptográfica.

> **Importante:** a chave privada do updater é equivalente a uma credencial. Nunca envie seu conteúdo por chat, issue, README, commit ou arquivo público.

## O que já está pronto no projeto

O repositório já possui:

- Tauri 2;
- instalador Windows NSIS;
- verificação de atualização no próprio aplicativo;
- exigência de versão assinada;
- bloqueio de downgrade;
- workflow `Signed Release Readiness`;
- workflow `Publish Windows Release`;
- script `scripts/setup-updater-signing.ps1`.

Você precisa fazer a configuração das chaves **uma única vez**.

---

## Parte 1 — baixar/atualizar a pasta do projeto

### Se você baixou o projeto como ZIP

1. Abra a página do repositório no GitHub.
2. Clique em **Code**.
3. Clique em **Download ZIP**.
4. Extraia o ZIP para uma pasta fácil de localizar.
5. Use essa pasta nova para os passos abaixo.

### Se você usa Git

Abra o PowerShell dentro da pasta do projeto e execute:

```powershell
git pull
```

---

## Parte 2 — abrir o PowerShell na pasta correta

1. Abra a pasta do Trade Blueprint no Explorador de Arquivos.
2. Clique na barra em que aparece o caminho da pasta.
3. Digite:

```text
powershell
```

4. Pressione **Enter**.

Uma janela do PowerShell será aberta já na pasta do projeto.

---

## Parte 3 — gerar as chaves

No PowerShell, execute:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-updater-signing.ps1
```

O script:

1. verifica se o `npm` está disponível;
2. instala dependências se necessário;
3. cria a pasta de chaves no seu perfil do Windows;
4. gera o par de chaves do Tauri;
5. informa onde ficou a chave privada;
6. mostra a chave pública;
7. lembra quais nomes usar no GitHub.

Por padrão, a chave privada fica em:

```text
%USERPROFILE%\.tauri\trade-blueprint.key
```

### Se o Tauri pedir uma senha

Você pode definir uma senha para proteger a chave privada.

Se usar senha, guarde-a em um gerenciador de senhas. Ela será necessária para configurar o secret `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`.

---

## Parte 4 — cadastrar a chave pública no GitHub

1. Abra o repositório no GitHub.
2. Clique em **Settings**.
3. No menu lateral, abra **Secrets and variables**.
4. Clique em **Actions**.
5. Abra a aba **Variables**.
6. Clique em **New repository variable**.
7. No campo **Name**, digite exatamente:

```text
TAURI_UPDATER_PUBLIC_KEY
```

8. No campo de valor, cole a **chave pública** mostrada pelo script.
9. Salve.

A chave pública pode ser conhecida por terceiros. Mesmo assim, mantenha o nome e o conteúdo exatamente como gerados.

---

## Parte 5 — cadastrar a chave privada no GitHub

Ainda em **Settings > Secrets and variables > Actions**:

1. Abra a aba **Secrets**.
2. Clique em **New repository secret**.
3. No campo **Name**, digite:

```text
TAURI_SIGNING_PRIVATE_KEY
```

4. No campo **Secret**, cole o conteúdo **completo** do arquivo privado:

```text
%USERPROFILE%\.tauri\trade-blueprint.key
```

5. Salve.

### Como copiar o arquivo privado pelo PowerShell

Você pode exibi-lo temporariamente com:

```powershell
Get-Content "$HOME\.tauri\trade-blueprint.key" -Raw
```

Copie o conteúdo para o secret do GitHub e depois feche o PowerShell.

> Não cole esse conteúdo em nenhuma conversa, inclusive no ChatGPT.

---

## Parte 6 — cadastrar a senha da chave, se houver

Se você criou a chave com senha:

1. Clique novamente em **New repository secret**.
2. Use o nome:

```text
TAURI_SIGNING_PRIVATE_KEY_PASSWORD
```

3. Cole a senha escolhida.
4. Salve.

Se a chave não tiver senha, esse secret pode ficar ausente.

---

## Parte 7 — testar a configuração sem publicar versão

Antes de criar qualquer Release:

1. No repositório, abra a aba **Actions**.
2. Selecione **Signed Release Readiness**.
3. Clique em **Run workflow**.
4. Selecione a branch `main`.
5. Confirme em **Run workflow**.
6. Aguarde a execução terminar.

O resultado esperado é um marcador verde (**success**).

Se o workflow ficar vermelho, não crie a tag de Release ainda. Abra a execução e leia o passo que falhou.

---

## Parte 8 — publicar a v0.12.0

Faça esta etapa **somente depois** de o workflow `Signed Release Readiness` ficar verde.

Abra o PowerShell na pasta do projeto e execute:

```powershell
git pull
git tag v0.12.0
git push origin v0.12.0
```

O envio da tag dispara automaticamente o workflow:

```text
Publish Windows Release
```

Esse workflow valida novamente:

- versão do `package.json`;
- versão do Tauri;
- versão do Cargo;
- testes automatizados;
- TypeScript/Vite;
- Rust;
- Clippy;
- assinatura do updater;
- instalador NSIS.

Se tudo passar, a Release será publicada com os artefatos necessários para instalação e atualização.

---

## Parte 9 — teste real vA → vB

Para validar o atualizador de ponta a ponta são necessárias **duas versões assinadas**.

Fluxo recomendado:

1. publique e instale uma primeira versão assinada;
2. mantenha alguns dados de teste nela;
3. incremente a versão do projeto;
4. publique a segunda versão assinada;
5. abra a primeira versão instalada;
6. vá a **Configurações > Aplicativo desktop e atualizações**;
7. clique em **Verificar atualizações**;
8. confirme que a nova versão é detectada;
9. instale a atualização;
10. abra novamente o aplicativo;
11. confira se os dados continuam presentes;
12. execute **Verificar integridade**;
13. confirme também que foi criado um backup `pre-update`.

O objetivo é confirmar que o usuário consegue atualizar o Trade Blueprint **sem desinstalar e reinstalar manualmente** e sem perder seus dados.

---

## Se você perder a chave privada

Não gere outra chave e continue publicando silenciosamente como se nada tivesse acontecido.

A troca de chave de assinatura exige uma estratégia explícita de transição. Por isso:

- mantenha a chave privada em local seguro;
- faça uma cópia offline protegida;
- guarde a senha separadamente;
- nunca versione o arquivo `.key`.

## Checklist final

Antes da primeira Release assinada, confirme:

- [ ] `TAURI_UPDATER_PUBLIC_KEY` existe em **Variables**;
- [ ] `TAURI_SIGNING_PRIVATE_KEY` existe em **Secrets**;
- [ ] `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` existe, se aplicável;
- [ ] `Signed Release Readiness` está verde;
- [ ] a chave privada possui cópia segura fora do repositório;
- [ ] a versão do projeto está correta;
- [ ] somente então a tag da Release será criada.
