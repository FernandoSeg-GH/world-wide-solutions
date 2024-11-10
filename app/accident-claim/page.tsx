import AccidentClaimForm from "@/components/business/forms/custom/accident-claim/AccidentClaimForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AuthForm from "@/components/auth/AuthForm";

const AccidentClaimPage = async () => {
    const session = await getServerSession(authOptions);

    if (!session) {
        return <AuthForm />;
    }

    return <AccidentClaimForm />;
};

export default AccidentClaimPage;
