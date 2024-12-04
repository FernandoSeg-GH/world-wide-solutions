import { useSession } from "next-auth/react";

export const roleId = () => {
  const { data: session } = useSession();
  const role = session?.user.role.id;
  return role;
};
