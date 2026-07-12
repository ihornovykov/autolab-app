import type { PrivateDataOutput } from "./validation";

export const toPrivateDataOutput = (message: string, user: PrivateDataOutput["user"]): PrivateDataOutput => {
  return { message, user };
};
