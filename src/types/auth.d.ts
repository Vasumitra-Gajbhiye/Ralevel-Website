import type { Role } from "@/lib/roles";

export type AuthSession = {
  userId: string;
  user: {
    email: string;
    name: string | null;
    image: string | null;
  };
  userData: {
    id: string;
    roles: Role[];
    isOwner: boolean;
  };
};
