# Montuá Presentes

> **Você imagina. Você monta. A gente faz.**  
> Plataforma de presentes personalizados com configurador interativo em tempo real, integração comercial com Supabase e módulo de produção industrial para impressão em folhas A3 DTF UV.

---

## 🌟 Sobre a Montuá

A **Montuá** permite que o cliente crie, monte visualmente e personalize o próprio presente antes de realizar o pedido, visualizando todas as superfícies (frente, verso, alça e fundo) com cálculo automático de qualidade de imagem (DPI), medidas físicas em milímetros e fechamento de pedido ágil.

---

## 🚀 Tecnologias

* **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS, Lucide React
* **Motor Gráfico**: React-Konva, HTML5 Canvas Offscreen (300 DPI)
* **Backend & Persistência**: Supabase (PostgreSQL 17 relacional, Supabase Storage, Row Level Security)
* **Produção Industrial**: Montador de Chapas / Folhas A3 DTF UV com algoritmo 2D Shelf Packing e marcas de corte

---

## 🛠️ Como Iniciar

1. Clone o repositório:
```bash
git clone https://github.com/msjtec12/canecas-personalizadas.git
cd canecas-personalizadas
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente baseadas no `.env.example`:
```bash
cp .env.example .env.local
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).
