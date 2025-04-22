const ProjectSpendingDetailContainer = (spendingDetails) => {
    return (
        <>
        {spendingDetails?.length > 0 && (
            <SpendingPlanFlex style={{ marginTop: 32 }}>
                <Title level={4}>Spending Plan Details</Title>
                {spendingDetails.map((detail) => (
                    <SpendingItemRow key={detail.id}>
                        <span>{detail.description}</span>
                        <span>{detail.amount.toLocaleString()} VND</span>
                        <span>{new Date(detail.transactionTime).toISOString()}</span>
                    </SpendingItemRow>
                ))}
            </SpendingPlanFlex>
        )}
        </>
    );
    }   

    export default ProjectSpendingDetailContainer;