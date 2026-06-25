import Tile from './Tile';

export type TileStatus = 'correct' | 'present' | 'absent' | 'empty' | 'filled';

interface RowData {
  letters: string[];
  statuses?: TileStatus[];
}

interface GameBoardProps {
  rows: RowData[];
  rowCount: number;
  activeRow?: number;
}

export default function GameBoard({ rows, rowCount, activeRow }: GameBoardProps) {
  return (
    <div className="mx-auto grid max-w-[300px] gap-1 sm:gap-1.5">
      {Array.from({ length: Math.max(rowCount, rows.length) }).map((_, rowIdx) => {
        const row = rows[rowIdx];
        return (
          <div key={rowIdx} className="grid grid-cols-5 gap-1 sm:gap-1.5">
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
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
