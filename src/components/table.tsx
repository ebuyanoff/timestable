import React, { useState } from 'react';

const MultiplicationTable = ({ yellowString, redCells = [] }: {yellowString: string, redCells: number[][] }) => {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [hoveredColumn, setHoveredColumn] = useState<number | null>(null);
  const [example, setExample] = useState('');

  const size = 10;
  const yellowCells = yellowString?.split(',').map(Number);
  const isRedCell = (row:number, column:number) => redCells.some(cell => cell[0] === row + 1 && cell[1] === column + 1);

  const getCellClass = (row:number, column: number) => {
    const classes = [];
    if (yellowCells?.includes(row + 1) || yellowCells?.includes(column + 1)) classes.push('yellowstring');
    if (row === column) classes.push('bluestring');
    if (isRedCell(row, column)) classes.push('redcell');
    if (hoveredRow === row || hoveredColumn === column) classes.push('highlight');
    return classes.join(' ');
  };

  return (
    <>
      <table className="multiplicationTable" onMouseLeave={() => setExample('')}>
        <tbody onMouseLeave={() => { setHoveredRow(null); setHoveredColumn(null); }}>
          {[...Array(size)].map((_, rowIndex) => (
            <tr key={rowIndex}>
              {[...Array(size)].map((_, columnIndex) => (
                <td
                  key={columnIndex}
                  className={getCellClass(rowIndex, columnIndex)}
                  onMouseEnter={() => {
                    setHoveredRow(rowIndex);
                    setHoveredColumn(columnIndex);
                    setExample(`${rowIndex + 1} × ${columnIndex + 1} = ${(rowIndex + 1) * (columnIndex + 1)}`);
                  }}
                >
                  {(rowIndex + 1) * (columnIndex + 1)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className='multiplicationExample'>{example}</div>
    </>
  );
};

export default MultiplicationTable;