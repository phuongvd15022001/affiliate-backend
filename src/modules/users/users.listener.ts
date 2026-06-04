import { Prisma } from '@prisma/client';
import { AuthHelpers } from 'src/shared/helpers/auth.helpers';

const onCreated: Prisma.Middleware<unknown> = async (params, next) => {
  if (params.model === 'User') {
    if (params.action === 'create') {
      const args = params.args as { data: { password: string } };
      args.data.password = await AuthHelpers.hash(args.data.password);
    } else if (params.action === 'createMany') {
      const args = params.args as { data: { password: string }[] };
      await Promise.all(
        args.data.map(async (user) => {
          user.password = await AuthHelpers.hash(user.password);
        }),
      );
    }
  }

  return next(params);
};

export const UserListener = {
  onCreated,
};
