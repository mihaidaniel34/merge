import { Elysia, t } from 'elysia';
import { cors } from '@elysiajs/cors';
import { jwt } from '@elysiajs/jwt';
import { cookie } from '@elysiajs/cookie';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

async function hashPassword(password: string): Promise<string> {
  return await Bun.password.hash(password, {
    algorithm: "bcrypt",
    cost: 12
  });
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await Bun.password.verify(password, hash);
}

const app = new Elysia()
  .use(cors({
    origin: CORS_ORIGIN,
    credentials: true,
  }))
  .use(jwt({ 
    name: 'jwt', 
    secret: JWT_SECRET,
    exp: '7d'
  }))
  .use(cookie());

const auth = async ({ cookie: { auth }, jwt, set }) => {
  if (!auth?.value) {
    set.status = 401;
    return { error: 'Unauthorized' };
  }

  try {
    const payload = await jwt.verify(auth.value);
    if (!payload) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }
    return payload;
  } catch (error) {
    set.status = 401;
    return { error: 'Invalid token' };
  }
};

app.post('/auth/signup', async ({ body, jwt, cookie: { auth }, set }) => {
  try {
    const { username, email, password } = body;
    
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });

    if (existingUser) {
      set.status = 400;
      return { error: 'Username or email already exists' };
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });

    const token = await jwt.sign({ 
      id: user.id, 
      username: user.username,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    });

    auth.set({
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 86400,
      path: '/',
    });

    return { 
      data: { 
        token,
        user: { 
          id: user.id, 
          username: user.username, 
          email: user.email 
        } 
      } 
    };
  } catch (error) {
    set.status = 500;
    return { error: 'Internal server error' };
  }
}, {
  body: t.Object({
    username: t.String({ minLength: 3, maxLength: 50 }),
    email: t.String({ format: 'email', maxLength: 255 }),
    password: t.String({ minLength: 8, maxLength: 100 }),
  }),
});

app.post('/auth/login', async ({ body, jwt, cookie: { auth }, set }) => {
  try {
    const { username, password } = body;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      set.status = 401;
      return { error: 'Invalid credentials' };
    }

    const validPassword = await verifyPassword(password, user.password);
    if (!validPassword) {
      set.status = 401;
      return { error: 'Invalid credentials' };
    }

    const token = await jwt.sign({ 
      id: user.id, 
      username: user.username,
      exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days
    });

    auth.set({
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 86400,
      path: '/',
    });

    return { 
      data: { 
        token,
        user: { id: user.id, username: user.username, email: user.email } 
      } 
    };
  } catch (error) {
    set.status = 500;
    return { error: 'Internal server error' };
  }
}, {
  body: t.Object({
    username: t.String({ minLength: 3, maxLength: 50 }),
    password: t.String({ minLength: 8, maxLength: 100 }),
  }),
});

app.get('/tasks', async ({ cookie, jwt, set }) => {
  try {
    const payload = await auth({ cookie, jwt, set });
    if (payload.error) return payload;

    const tasks = await prisma.task.findMany({
      where: { userId: payload.id },
      orderBy: { createdAt: 'desc' },
    });

    return { data: { tasks } };
  } catch (error) {
    set.status = 500;
    return { error: 'Internal server error' };
  }
});

app.post('/tasks', async ({ body, cookie, jwt, set }) => {
  try {
    const payload = await auth({ cookie, jwt, set });
    if (payload.error) return payload;

    const task = await prisma.task.create({
      data: { ...body, userId: payload.id },
    });

    return { data: { task } };
  } catch (error) {
    set.status = 500;
    return { error: 'Internal server error' };
  }
}, {
  body: t.Object({
    title: t.String({ minLength: 1, maxLength: 255 }),
    description: t.Optional(t.String({ maxLength: 1000 })),
    priority: t.String(),
    isRecurring: t.Boolean(),
    recurrencePattern: t.Optional(t.String()),
  }),
});

app.put('/tasks/:id', async ({ params, body, cookie, jwt, set }) => {
  try {
    const payload = await auth({ cookie, jwt, set });
    if (payload.error) return payload;

    const task = await prisma.task.findUnique({ where: { id: params.id } });
    if (!task || task.userId !== payload.id) {
      set.status = 404;
      return { error: 'Task not found' };
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: body,
    });

    return { data: { task: updatedTask } };
  } catch (error) {
    set.status = 500;
    return { error: 'Internal server error' };
  }
}, {
  params: t.Object({
    id: t.String(),
  }),
});

app.put('/tasks/:id/status', async ({ params, body, cookie, jwt, set }) => {
  try {
    const payload = await auth({ cookie, jwt, set });
    if (payload.error) return payload;

    const task = await prisma.task.findUnique({ where: { id: params.id } });
    if (!task || task.userId !== payload.id) {
      set.status = 404;
      return { error: 'Task not found' };
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: { status: body.status },
    });

    return { data: { task: updatedTask } };
  } catch (error) {
    set.status = 500;
    return { error: 'Internal server error' };
  }
}, {
  params: t.Object({
    id: t.String(),
  }),
  body: t.Object({
    status: t.String(),
  }),
});

app.put('/tasks/:id/priority', async ({ params, body, cookie, jwt, set }) => {
  try {
    const payload = await auth({ cookie, jwt, set });
    if (payload.error) return payload;

    const task = await prisma.task.findUnique({ where: { id: params.id } });
    if (!task || task.userId !== payload.id) {
      set.status = 404;
      return { error: 'Task not found' };
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: { priority: body.priority },
    });

    return { data: { task: updatedTask } };
  } catch (error) {
    set.status = 500;
    return { error: 'Internal server error' };
  }
}, {
  params: t.Object({
    id: t.String(),
  }),
  body: t.Object({
    priority: t.String(),
  }),
});

app.put('/tasks/:id/archive', async ({ params, cookie, jwt, set }) => {
  try {
    const payload = await auth({ cookie, jwt, set });
    if (payload.error) return payload;

    const task = await prisma.task.findUnique({ where: { id: params.id } });
    if (!task || task.userId !== payload.id) {
      set.status = 404;
      return { error: 'Task not found' };
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: { status: 'ARCHIVED' },
    });

    return { data: { task: updatedTask } };
  } catch (error) {
    set.status = 500;
    return { error: 'Internal server error' };
  }
}, {
  params: t.Object({
    id: t.String(),
  }),
});

app.delete('/tasks/:id', async ({ params, cookie, jwt, set }) => {
  try {
    const payload = await auth({ cookie, jwt, set });
    if (payload.error) return payload;

    const task = await prisma.task.findUnique({ where: { id: params.id } });
    if (!task || task.userId !== payload.id) {
      set.status = 404;
      return { error: 'Task not found' };
    }

    await prisma.task.delete({ where: { id: params.id } });
    return { data: { success: true } };
  } catch (error) {
    set.status = 500;
    return { error: 'Internal server error' };
  }
}, {
  params: t.Object({
    id: t.String(),
  }),
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

app.listen(PORT);