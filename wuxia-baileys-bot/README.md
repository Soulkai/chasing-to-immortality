# Ascensão Imortal — Bot Wuxia/Xianxia para WhatsApp

Base inicial de um chatbot game global de Wuxia/Xianxia usando:

- **Node.js + TypeScript**
- **Baileys** para conexão com WhatsApp Web
- **PostgreSQL** como banco local gratuito
- **Prisma ORM** para migrations e acesso ao banco

O mundo do jogo é global: o personagem é vinculado ao número do WhatsApp, então funciona igual no privado e em qualquer grupo ativado.

---

## Recursos já implementados nesta base

### Sistema do bot

- Conexão via QR Code.
- Conexão via número/código de pareamento.
- Identificação global do jogador por número do WhatsApp.
- Normalização de JID de grupo, privado e device JID.
- `!ativarbot` para liberar o bot apenas em grupos autorizados.
- Apenas os admins configurados podem usar `!ativarbot`.
- Logs de comandos no banco.
- Comando `!menu` com categorias bonitas.
- Botões básicos com fallback textual.

### Registro do personagem

- `!registrar Nome / Sexo`
- Sorteio inicial de:
  - Raça
  - Clã de origem
  - Talento
  - Destino
  - Sorte
  - Raiz espiritual
  - Corpo divino
  - Região inicial
  - Atributos
- Sistema de 3 rerolls.
- Na quarta rolagem, o destino é aceito automaticamente.
- Resposta narrativa baseada em raça, clã, região e destino.
- Questionário de índole com 5 perguntas.
- Resposta por número digitado ou reação na mensagem/imagem do bot.
- Cálculo de karma inicial.

### Perfil

- `!perfil`
- Exibe:
  - Raça
  - Clã
  - Talento
  - Destino
  - Sorte
  - Karma
  - Raiz espiritual
  - Corpo divino
  - Região
  - Seita
  - Reinos de corpo, espírito e alma
  - HP com barra
  - Qi com barra
  - Alma com barra
  - Vidas
  - Atributos
- `!setaparencia <link>` salva aparência do personagem.
- Se existir aparência, `!perfil` tenta enviar a imagem com o perfil na legenda.

### Sistema de vidas e legado

- Todo personagem possui 9 vidas.
- Estrutura para morte final e geração de Pontos de Destino.
- `!vidas`
- `!reencarnar` mostra a loja inicial do Samsara.
- `!testemorte` existe apenas para admin testar o sistema de vidas.

---

## Como rodar

### 1. Instale dependências

```bash
npm install
```

### 2. Configure o `.env`

Copie:

```bash
cp .env.example .env
```

Edite o `.env`:

```env
DATABASE_URL="postgresql://wuxia:wuxia@localhost:5432/wuxia_game?schema=public"
LOGIN_PHONE_NUMBER=""
ADMIN_NUMBERS="5567981445060,5567814459060"
BOT_PREFIX="!"
REQUIRE_GROUP_ACTIVATION="true"
AUTH_DIR="auth"
LOG_LEVEL="info"
```

### 3. Suba o PostgreSQL local

```bash
docker compose up -d
```

### 4. Rode as migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Inicie o bot

```bash
npm run dev
```

---

## Login por QR Code

Deixe `LOGIN_PHONE_NUMBER` vazio:

```env
LOGIN_PHONE_NUMBER=""
```

Ao iniciar, o terminal exibirá o QR Code.

---

## Login por número/código de pareamento

Coloque o número no `.env` sem `+`, espaço, traço ou parênteses:

```env
LOGIN_PHONE_NUMBER="5567999999999"
```

Ao iniciar, o terminal mostrará um código de pareamento.

No celular:

```txt
WhatsApp > Aparelhos conectados > Conectar com número de telefone
```

Digite o código mostrado no terminal.

---

## Ativar bot em grupo

Entre no grupo desejado e envie:

```txt
!ativarbot
```

Somente os números configurados em `ADMIN_NUMBERS` podem ativar.

Enquanto o grupo não estiver ativado, o bot ignora os comandos desse grupo.

No privado, o bot continua respondendo normalmente.

---

## Comandos principais

```txt
!menu
!ativarbot
!registrar Nome / Sexo
!perfil
!setaparencia <link>
!vidas
!reencarnar
```

Comando de teste admin:

```txt
!testemorte
```

---

## Respostas por reação

Sempre que o bot mandar uma pergunta numerada, ele salva o ID da mensagem no banco.

O jogador pode responder:

```txt
1
2
3
4
5
```

Ou reagir à imagem/mensagem do bot com:

```txt
1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣
```

O bot só aceita a reação do dono daquele fluxo. Se outro jogador reagir, a resposta é ignorada.

---

## Identidade global do jogador

O WhatsApp usa formatos diferentes em grupo e privado:

- Privado: `5567...@s.whatsapp.net`
- Grupo: mensagem vem do grupo, mas o jogador aparece em `participant`
- Alguns casos incluem device JID com `:`

A função `normalizeWhatsAppId` limpa tudo e salva apenas o número:

```txt
5567981445060
```

Esse número vira a identidade global do jogador no banco.

---

## Próximas fases sugeridas

1. Inventário e itens.
2. Economia com pedras espirituais.
3. Loja do bot.
4. Mercado global.
5. Leilão.
6. Cultivo real com cooldown e rompimento.
7. Exploração global.
8. Encontro entre jogadores de grupos diferentes.
9. Trocas transacionais.
10. Seitas criadas por jogadores.
11. Técnicas da seita.
12. Profissões: alquimia, forja, formações e talismãs.
13. Combate PvE/PvP.
14. Boss global e eventos.
15. Sistema completo de reencarnação e compra de legados.

---

## Observações importantes

Baileys não é a API oficial do WhatsApp Business. Ele interage com o WhatsApp Web. Por isso, botões, listas e mensagens interativas podem variar com mudanças do WhatsApp. Esta base sempre mantém fallback por texto e número para não quebrar o jogo.
