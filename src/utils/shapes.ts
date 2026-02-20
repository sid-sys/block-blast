export type BlockColor = string;

export interface Shape {
  id: string;
  matrix: number[][]; // 0 or 1
  color: BlockColor;
}

// Neon colors matching the request
export const COLORS = {
  BLUE: '#00f0ff',
  ORANGE: '#ffbd00',
  GREEN: '#00ff41',
  PURPLE: '#bf00ff',
  YELLOW: '#ffff00',
  RED: '#ff003c',
  CYAN: '#00ffff',
};

// Shape Definitions (Inspired by Tetris + Block Blast variants)
export const SHAPE_TYPES: Omit<Shape, 'id'>[] = [
  // Single block
  { matrix: [[1]], color: COLORS.YELLOW },
  
  // 2-blocks line
  { matrix: [[1, 1]], color: COLORS.BLUE },
  { matrix: [[1], [1]], color: COLORS.BLUE },

  // 3-blocks line
  { matrix: [[1, 1, 1]], color: COLORS.GREEN },
  { matrix: [[1], [1], [1]], color: COLORS.GREEN },

  // 4-blocks line
  { matrix: [[1, 1, 1, 1]], color: COLORS.RED },
  { matrix: [[1], [1], [1], [1]], color: COLORS.RED },

  // Square 2x2
  { matrix: [[1, 1], [1, 1]], color: COLORS.ORANGE },

  // L-shapes (3 blocks)
  { matrix: [[1, 0], [1, 1]], color: COLORS.PURPLE },
  { matrix: [[0, 1], [1, 1]], color: COLORS.PURPLE },
  { matrix: [[1, 1], [1, 0]], color: COLORS.PURPLE },
  { matrix: [[1, 1], [0, 1]], color: COLORS.PURPLE },

  // T-shapes
  { matrix: [[1, 1, 1], [0, 1, 0]], color: COLORS.CYAN },
  { matrix: [[0, 1, 0], [1, 1, 1]], color: COLORS.CYAN },
  { matrix: [[1, 0], [1, 1], [1, 0]], color: COLORS.CYAN }, // rotated T
  { matrix: [[0, 1], [1, 1], [0, 1]], color: COLORS.CYAN }, // rotated T
];

export const getRandomShapes = (count: number): Shape[] => {
  const shapes: Shape[] = [];
  for (let i = 0; i < count; i++) {
    const randomType = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];
    shapes.push({
      ...randomType,
      id: Math.random().toString(36).substr(2, 9),
    });
  }
  return shapes;
};
