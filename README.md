# 🐉 Chasing To Immortality

BotGame de Wuxia/Xianxia para WhatsApp via Baileys.

## Tecnologias
- Node.js + Baileys (WhatsApp)
- MongoDB + Mongoose
- Sistema de cultivo, seitas, profissões, PvP e muito mais

## Estrutura
```
src/
├── bot/          → Conexão Baileys e handlers de mensagem
├── commands/     → Todos os comandos do jogo
├── models/       → Schemas MongoDB
├── systems/      → Sistemas do jogo (cultivo, combate, etc)
├── data/         → Dados estáticos (raças, clãs, técnicas base)
├── utils/        → Funções utilitárias
└── config/       → Configurações gerais
```

## Como rodar
```bash
npm install
npm run dev
```
