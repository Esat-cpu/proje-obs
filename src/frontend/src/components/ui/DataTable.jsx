import React from 'react';

// "footer" prop'unu ekledik
const DataTable = ({ columns, data, footer }) => {
  return (
    <div className="grades-table-container">
      <table className="grades-table">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data && data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>
                    {col.render ? col.render(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '24px' }}>
                Gösterilecek veri bulunamadı.
              </td>
            </tr>
          )}
        </tbody>
        {/* Eğer footer prop'u gönderilmişse tablonun en altına ekle */}
        {footer && <tfoot>{footer}</tfoot>}
      </table>
    </div>
  );
};

export default DataTable;