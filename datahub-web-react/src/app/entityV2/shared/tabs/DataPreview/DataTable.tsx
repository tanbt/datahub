import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import styled from 'styled-components';

const StyledTable = styled(Table)`
    .ant-table {
        font-size: 14px;
    }
    
    .ant-table-thead > tr > th {
        background-color: #fafafa;
        font-weight: 600;
    }
    
    .ant-table-cell {
        padding: 12px 16px;
    }
`;

interface ColumnDefinition {
    name: string;
    type: string;
    typeSignature?: {
        rawType: string;
        arguments?: Array<{ kind: string; value: number }>;
    };
}

interface DataTableProps {
    columns: ColumnDefinition[];
    data: any[][];
    loading?: boolean;
}

export const DataTable = ({ columns, data, loading = false }: DataTableProps) => {
    // Transform columns to Ant Design format
    const tableColumns: ColumnsType<any> = columns.map((col, index) => ({
        title: (
            <div>
                <div style={{ fontWeight: 600 }}>{col.name}</div>
                <div style={{ fontSize: '12px', fontWeight: 400, color: '#8c8c8c' }}>
                    {col.type}
                </div>
            </div>
        ),
        dataIndex: index.toString(),
        key: col.name,
        ellipsis: true,
        width: 200,
    }));

    // Transform data rows to objects with indices as keys
    const dataSource = data.map((row, rowIndex) => {
        const rowData: any = { key: rowIndex };
        row.forEach((cell, cellIndex) => {
            rowData[cellIndex.toString()] = cell === null ? <i style={{ color: '#bfbfbf' }}>NULL</i> : cell;
        });
        return rowData;
    });

    return (
        <StyledTable
            columns={tableColumns}
            dataSource={dataSource}
            loading={loading}
            pagination={{
                pageSize: 50,
                showSizeChanger: true,
                showTotal: (total) => `Total ${total} rows`,
                pageSizeOptions: ['10', '25', '50', '100'],
            }}
            scroll={{ x: 'max-content' }}
            bordered
        />
    );
};
