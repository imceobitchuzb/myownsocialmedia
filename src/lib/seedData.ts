import { User, Post, Story, Community, StoryChain, WeeklyChallenge } from '@/types/models';

export const SEED_USERS: User[] = [
  {
    id: 'user-kenji',
    username: 'kenji_sato',
    display_name: 'Кэндзи Сато',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Разработчик высоконагруженных систем. Изучаю распределённые базы данных.',
    status_line: 'Оптимизирую Rust-ядро стриминга 🦀',
    xp: 5240,
    belt_rank: 'black',
    age: 22,
    city: 'Токио, Япония',
    is_admin: true,
  },
  {
    id: 'user-maya',
    username: 'maya_lin',
    display_name: 'Майя Лин',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    bio: 'Исследователь нейросетей и интерфейсов. Создаю мультимодальные алгоритмы.',
    status_line: 'В библиотеке готовлюсь к релизу 📚',
    xp: 2850,
    belt_rank: 'brown',
    age: 21,
    city: 'Беркли, США',
    is_admin: false,
  },
  {
    id: 'user-alex',
    username: 'alex_vance',
    display_name: 'Алекс Вэнс',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    bio: 'Цифровой художник, саунд-продюсер и разработчик инди-проектов.',
    status_line: 'Записываю новый аналоговый трек 🎧',
    xp: 1420,
    belt_rank: 'blue',
    age: 20,
    city: 'Москва, Россия',
    is_admin: false,
  },
  {
    id: 'user-elena',
    username: 'elena_rostova',
    display_name: 'Елена Ростова',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    bio: 'Саунд-дизайнер и веб-архитектор. Люблю чайные церемонии и чистый код.',
    status_line: 'Завариваю японский зелёный чай 🍵',
    xp: 850,
    belt_rank: 'green',
    age: 23,
    city: 'Санкт-Петербург, Россия',
    is_admin: false,
  },
  {
    id: 'user-tariq',
    username: 'tariq_mansoor',
    display_name: 'Тарик Аль-Мансур',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    bio: 'Инженер робототехники и встраиваемых систем.',
    status_line: 'Тестирую плату на ESP32 ⚡',
    xp: 420,
    belt_rank: 'orange',
    age: 19,
    city: 'Дубай, ОАЭ',
    is_admin: false,
  },
  {
    id: 'user-me',
    username: 'ceo_founder',
    display_name: 'Основатель CEOWEB',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    bio: 'Официальный профиль пользователя в платформе CEOWEB.',
    status_line: 'Активен в сети CEOWEB 🚀',
    xp: 950,
    belt_rank: 'green',
    age: 22,
    city: 'Москва, Россия',
    is_admin: true,
  }
];

export const SEED_POSTS: Post[] = [
  {
    id: 'post-1',
    author_id: 'user-kenji',
    author: SEED_USERS[0],
    content: 'Запустили шардинг для высоконагруженного стрима CEOWEB! Задержка передачи снизилась до 15 мс по всем регионам WebSocket.',
    media_urls: ['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80'],
    mood: 'study',
    privacy: 'public',
    likes_count: 42,
    comments_count: 8,
    has_liked: true,
    is_pinned: true,
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
  {
    id: 'post-2',
    author_id: 'user-maya',
    author: SEED_USERS[1],
    content: 'Завершили этап хакатона! Наш агентный модуль проанализировал 40 научных публикаций меньше чем за минуту. Кто готов сегодня к совместному спринту?',
    media_urls: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80'],
    mood: 'creative',
    privacy: 'public',
    likes_count: 58,
    comments_count: 14,
    has_liked: false,
    created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
  },
  {
    id: 'post-3',
    author_id: 'user-alex',
    author: SEED_USERS[2],
    content: 'Отражения ночных неоновых огней после дождя. Снято на 35mm фикс перед поездкой по кольцевой.',
    media_urls: ['https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80'],
    mood: 'chill',
    privacy: 'public',
    likes_count: 89,
    comments_count: 11,
    has_liked: true,
    created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
  }
];

export const SEED_STORIES: Story[] = [
  {
    id: 'story-1',
    author_id: 'user-maya',
    author: SEED_USERS[1],
    media_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=700&q=80',
    text_overlay: 'Кодинг-марафон в разгаре 💻✨',
    views_count: 56,
    created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 20 * 3600 * 1000).toISOString(),
  },
  {
    id: 'story-2',
    author_id: 'user-alex',
    author: SEED_USERS[2],
    media_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=700&q=80',
    text_overlay: 'Печатная плата готова! ⚡',
    views_count: 41,
    created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    expires_at: new Date(Date.now() + 16 * 3600 * 1000).toISOString(),
  }
];

export const SEED_COMMUNITIES: Community[] = [
  {
    id: 'comm-1',
    slug: 'tokyo-coders',
    name: 'Клуб Архитекторов Систем',
    description: 'Сообщество разработчиков, инженеров распределённых систем и исследователей ИИ.',
    avatar_url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=300&q=80',
    cover_url: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1200&q=80',
    creator_id: 'user-kenji',
    rules_text: '1. Взаимное уважение и конструктив.\n2. Без спама.\n3. Публикуйте ссылки с исходным кодом.',
    members_count: 1420,
    is_joined: true,
  },
  {
    id: 'comm-2',
    slug: 'desk-setups',
    name: 'Минималистичные рабочие места',
    description: 'Эргономика, кастомные клавиатуры, кронштейны для мониторов и подсветка.',
    avatar_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=300&q=80',
    cover_url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80',
    creator_id: 'user-alex',
    rules_text: '1. Публикуйте свои реальные рабочие места.\n2. Указывайте характеристики оборудования в комментариях.',
    members_count: 3890,
    is_joined: false,
  }
];

export const SEED_CHAINS: StoryChain[] = [
  {
    id: 'chain-1',
    title: 'Шепчущий сервер Акихабары',
    prompt: 'Под старым аркадным автоматом в Акихабаре зеленый терминал внезапно выдал системную строку root...',
    creator_id: 'user-kenji',
    creator: SEED_USERS[0],
    status: 'active',
    current_round: 2,
    created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    nodes: [
      {
        id: 'node-1',
        chain_id: 'chain-1',
        author_id: 'user-kenji',
        author: SEED_USERS[0],
        round_number: 1,
        content: 'Под старым аркадным автоматом в Акихабаре зеленый терминал внезапно выдал системную строку root.',
        votes_count: 24,
        is_winner: true,
        created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'node-2',
        chain_id: 'chain-1',
        author_id: 'user-maya',
        author: SEED_USERS[1],
        round_number: 2,
        content: 'Елена смахнула пыль веков, подключила свой кибердек и обнаружила, что входящий пакет отправлен из 2048 года.',
        votes_count: 21,
        has_voted: true,
        is_winner: false,
        created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
      }
    ]
  }
];

export const SEED_CHALLENGES: WeeklyChallenge[] = [
  {
    id: 'chal-1',
    title: 'Покажите своё рабочее место',
    prompt: 'Опубликуйте фотографию своего стола, клавиатуры или учебного пространства. Расскажите о любимом инструменте!',
    theme_tag: 'desk-setup',
    starts_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    ends_at: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString(),
    is_active: true,
    submissions_count: 64,
  }
];
