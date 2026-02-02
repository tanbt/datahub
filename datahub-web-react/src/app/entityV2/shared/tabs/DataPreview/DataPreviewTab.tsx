import { useEntityData } from "@app/entity/shared/EntityContext";
import {
    extractDatasetNameFromUrn
} from "@app/entityV2/shared/utils";
import { useEffect, useState } from "react";
import { DataTable } from "./DataTable";
import styled from "styled-components";
import { Alert } from "antd";

const Container = styled.div`
    padding: 20px;
`;

const ErrorAlert = styled(Alert)`
    margin-bottom: 16px;
`;

export const DataPreviewTab = () => {
    const { urn, entityData } = useEntityData();

    const platformName = entityData?.platform?.name; // e.g. "trino"
    const datasetPath = extractDatasetNameFromUrn(urn); // e.g. "postgres.public.drivers"
    // console.log("Platform Name:", platformName);
    // console.log("Dataset Path (from URN):", datasetPath);

    const [results, setResults] = useState<{ columns: any[]; data: any[] } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const executeQuery = async (sql) => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:8089/v1/statement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain',
                    'X-Trino-User': 'admin',
                },
                body: sql
            });

            let data = await response.json();

            // Poll until complete
            while (data.nextUri) {
                if (data.data && data.data.length > 0) {
                    setResults(data);
                    setLoading(false);
                    return;
                }
                const pollResponse = await fetch(data.nextUri);
                data = await pollResponse.json();
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (platformName !== 'trino' || !datasetPath) {
            return;
        }
        (async () => {
            await executeQuery(`SELECT * FROM ${datasetPath} LIMIT 200`);
        })();
    }, [datasetPath]);

    console.log({ loading, error, results });

    return (
        <Container>
            {platformName !== 'trino' && (
                <Alert
                    message="Data preview is only available for Trino datasets."
                    type="info"
                    showIcon
                />
            )}
            {error && (
                <ErrorAlert
                    message="Error loading data"
                    description={error}
                    type="error"
                    showIcon
                />
            )}
            {results && results.columns && results.data && (
                <DataTable
                    columns={results.columns}
                    data={results.data}
                    loading={loading}
                />
            )}
        </Container>
    );
};