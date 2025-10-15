export interface Product {
  item_id: string;
  item_name: string;
  price: number;
  currency: string;
  item_category: string;
  image: string;
  description: string;
  quantity?: number;
}

export const PRODUCTS: Product[] = [
  {
    item_id: "P001",
    item_name: "Poção de Cura Maior",
    price: 50,
    currency: "GP",
    item_category: "Poções",
    image: "/src/assets/potion-healing.jpg",
    description: "Uma poção mágica que restaura 2d4+2 pontos de vida. Seu brilho vermelho pulsante emana energia vital."
  },
  {
    item_id: "W002",
    item_name: "Espada Vorpal +1",
    price: 1200,
    currency: "GP",
    item_category: "Armas",
    image: "/src/assets/sword-vorpal.jpg",
    description: "Lâmina lendária com poder de decapitação. Seu fio arcano brilha com energia púrpura mortal."
  },
  {
    item_id: "A003",
    item_name: "Amuleto da Sabedoria do Rei Anão",
    price: 350,
    currency: "GP",
    item_category: "Amuletos",
    image: "/src/assets/amulet-wisdom.jpg",
    description: "Forjado pelos antigos reis das montanhas. Concede +2 em Sabedoria e resistência a encantamentos."
  },
  {
    item_id: "S004",
    item_name: "Escudo do Desvio",
    price: 275,
    currency: "GP",
    item_category: "Armaduras",
    image: "/src/assets/shield-deflection.jpg",
    description: "Runas ancestrais desviam projéteis mágicos. +2 CA contra ataques à distância."
  },
  {
    item_id: "B005",
    item_name: "Botas da Velocidade",
    price: 400,
    currency: "GP",
    item_category: "Itens Mágicos",
    image: "/src/assets/boots-speed.jpg",
    description: "Permite movimento dobrado por 10 minutos. Trilhas de vento arcano seguem cada passo."
  },
  {
    item_id: "R001",
    item_name: "Anel de Invisibilidade",
    price: 2500,
    currency: "GP",
    item_category: "Anéis",
    image: "/src/assets/ring-invisibility.jpg",
    description: "Artefato raro que concede invisibilidade completa. Use com sabedoria, pois grandes poderes atraem grandes perigos."
  }
];
