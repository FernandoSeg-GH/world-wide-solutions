"use client"
import AccidentClaimForm from "@/components/business/forms/custom/accident-claim/AccidentClaimForm";
import useTokenRefresh from "@/hooks/user/useTokenRefresh";

const AccidentClaimPage = () => {
    useTokenRefresh();
    return <AccidentClaimForm />;
};

export default AccidentClaimPage;
