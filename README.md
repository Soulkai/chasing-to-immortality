# Ascensão Imortal — Bot Game Wuxia/Xianxia para WhatsApp

Bot RPG persistente para WhatsApp usando **Baileys**, **Node.js/TypeScript**, **Prisma** e **PostgreSQL**. O jogo foi desenhado como uma simulação de cultivo Wuxia/Xianxia com registro narrativo, talento, destino, karma, sorte, 9 vidas, exploração, NPCs, missões, regiões, combate PvE, inventário, loja, profissões, seitas, rankings e legado pelo Samsara.

> Use apenas números próprios e respeite os termos do WhatsApp. O Baileys se conecta ao protocolo do WhatsApp Web e pode mudar conforme o WhatsApp muda.

## Principais sistemas já implementados

- Login por QR Code ou código de pareamento via número.
- Admin global por número.
- `!ativarbot` obrigatório em grupos, somente admin.
- Identidade global por número do WhatsApp, funcionando no privado e em grupos.
- Registro com 3 rerolls e quarta rolagem obrigatória.
- Sorteio inicial de raça, clã, talento, destino, sorte, raiz espiritual, corpo divino e região.
- Narrativa de nascimento baseada no sorteio.
- Questionário de índole com respostas por número ou reação `1️⃣` a `5️⃣` na mensagem do bot.
- Perfil com aparência por link de imagem.
- HP, Qi e Alma calculados por atributos.
- Sistema de 9 vidas e geração de Pontos de Destino na morte final.
- Cultivo espiritual/físico/alma/todos.
- Rompimento de estágio/reino com chance de sucesso/falha.
- Epifanias aleatórias durante cultivo.
- Mundo aberto com regiões, rotas, perigo, densidade de Qi, recursos, bestas e NPCs.
- NPCs que oferecem missões conforme reputação/karma.
- Missões com recompensa de pedras espirituais, karma, reputação e cultivo.
- Combate PvE em turnos: `!atacar`, `!usar_tecnica`, `!fugir`.
- Técnicas aprendíveis.
- Inventário em JSON.
- Loja do bot e uso de itens.
- Profissões iniciais e crafting simples.
- Criação básica de seita.
- Rankings.

## Instalação

```bash
cp .env.example .env
docker compose up -d
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## Configuração `.env`

```env
DATABASE_URL="postgresql://wuxia:wuxia@localhost:5432/wuxia_bot?schema=public"
ADMIN_NUMBERS="5567981445060,5567814459060"
BOT_PREFIX="!"
REQUIRE_GROUP_ACTIVATION=true
AUTH_DIR="auth"
LOG_LEVEL="info"

# Opcional: login por número em vez de QR. Use só números, sem + ou espaços.
LOGIN_PHONE_NUMBER=""
```

Se `LOGIN_PHONE_NUMBER` ficar vazio, o bot mostra QR Code no terminal. Se preencher, o bot gera um código de pareamento para usar em **Aparelhos conectados > Conectar com número de telefone**.

## Comandos principais

### Admin

```txt
!ativarbot
!testemorte
```

### Personagem

```txt
!registrar Nome / Sexo
!perfil
!setaparencia <link>
!inventario
!carteira
!vidas
```

### Cultivo

```txt
!cultivar
!cultivar espiritual
!cultivar fisico
!cultivar alma
!cultivar todos
!romper
!tecnicas
!aprender Nome da Técnica
```

### Mundo

```txt
!mapa
!local
!viajar Nome da Região
!explorar
!andar
!cacar
!npc
!missao
!concluir_missao
```

### Combate

```txt
!atacar
!usar_tecnica Nome da Técnica
!fugir
```

### Economia

```txt
!loja
!comprar Nome do Item
!usar Nome do Item
!saldo
```

### Profissões

```txt
!profissao
!aprender_profissao Alquimista
!alquimia
!forja
!formacao
!talismas
!receitas
```

### Seitas e destino

```txt
!criarseita Nome
!seita
!destino
!karma
!sorte
!samsara
!reencarnar
```

### Rankings

```txt
!rank cultivo
!rank riqueza
!rank karma
!rank pvp
```

## Fluxo recomendado de teste

1. No grupo, o admin usa `!ativarbot`.
2. O player usa `!registrar Long Wei / Masculino`.
3. Reage com `1️⃣` para aceitar ou `2️⃣` para reroll.
4. Responde as perguntas de índole com reações ou números.
5. Usa `!perfil`.
6. Usa `!setaparencia https://.../imagem.png`.
7. Usa `!cultivar`, `!romper`, `!mapa`, `!explorar` e `!atacar`.

## Observações de arquitetura

O projeto usa campos JSON em `Character` para inventário, técnicas, missão ativa e combate ativo. Isso acelera o desenvolvimento da simulação, mas os módulos de mercado/leilão/troca entre players devem virar tabelas transacionais próprias antes de produção, para evitar duplicação de itens e corrida de dados.

Próximas expansões recomendadas:

- Mercado global com tabelas `MarketListing` e transações Prisma.
- Troca player-player com sessão confirmada por ambos.
- PvP real e arena ranqueada.
- Seitas com tabela própria de membros, técnicas e tesouro.
- NPCs persistentes por região.
- Eventos globais agendados.
- Loja do Samsara com compras reais de legado.
