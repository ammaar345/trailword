import Tile from './Tile';
import { cn } from '@/lib/utils';

export type TileStatus = 'correct' | 'present' | 'absent' | 'empty' | 'filled';

interface RowData {
  letters: string[];
  statuses?: TileStatus[];
}

interface GameBoardProps {
  rows: RowData[];
  rowCount: number;
  activeRow?: number;
  /** Row index to shake (invalid guess feedback) */
  shakeRow?: number | null;
  /** Row index whose tiles bounce after a win */
  winRow?: number | null;
}

export default function GameBoard({ rows, rowCount, activeRow, shakeRow, winRow }: GameBoardProps) {
  return (
    <div
      role="grid"
      aria-label="Guess grid, 5 letters per row"
      className="mx-auto grid max-w-[300px] gap-1 sm:gap-1.5"
    >
      {Array.from({ length: Math.max(rowCount, rows.length) }).map((_, rowIdx) => {
        const row = rows[rowIdx];
        return (
          <div
            key={rowIdx}
            role="row"
            aria-rowindex={rowIdx + 1}
            aria-label={`Row ${rowIdx + 1}${rowIdx === activeRow ? ', your turn' : ''}`}
            className={cn('grid grid-cols-5 gap-1 sm:gap-1.5', rowIdx === shakeRow && 'animate-shake')}
          >
            {Array.from({ length: 5 }).map((_, colIdx) => {
              const tile = row?.letters[colIdx] || '';
              const status = row?.statuses?.[colIdx];
              const delay = status ? colIdx * 100 : 0;
              return (
                <Tile
                  key={colIdx}
                  letter={tile}
                  status={status || (tile ? 'filled' : 'empty')}
                  delay={delay}
                  active={rowIdx === activeRow}
                  win={rowIdx === winRow}
                />
              );
            })}
         </div>
        );
      })}
   </div>
  );
}
