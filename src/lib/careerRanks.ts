export interface CareerRank {
  rankKey: string;
  beltTitle: string;
  careerTitle: string;
  minXp: number;
}

export const CAREER_RANKS_CONFIG: CareerRank[] = [
  { rankKey: 'white', beltTitle: 'White Belt', careerTitle: 'Intern', minXp: 0 },
  { rankKey: 'yellow', beltTitle: 'Yellow Belt', careerTitle: 'Associate', minXp: 100 },
  { rankKey: 'orange', beltTitle: 'Orange Belt', careerTitle: 'Manager', minXp: 300 },
  { rankKey: 'green', beltTitle: 'Green Belt', careerTitle: 'Director', minXp: 600 },
  { rankKey: 'blue', beltTitle: 'Blue Belt', careerTitle: 'VP of Engineering', minXp: 1200 },
  { rankKey: 'brown', beltTitle: 'Brown Belt', careerTitle: 'C-Suite Executive', minXp: 2500 },
  { rankKey: 'black', beltTitle: 'Black Belt Master', careerTitle: 'Chief Executive Officer (CEO)', minXp: 5000 },
];

export function getRankTitle(xp: number, skin: 'belt' | 'career' = 'career'): string {
  let matched = CAREER_RANKS_CONFIG[0];
  for (const rank of CAREER_RANKS_CONFIG) {
    if (xp >= rank.minXp) {
      matched = rank;
    }
  }
  return skin === 'career' ? matched.careerTitle : matched.beltTitle;
}
