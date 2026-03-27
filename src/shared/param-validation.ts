import { z } from 'zod';
import type { FastifyRequest, FastifyReply } from 'fastify';

const uuidSchema = z.string().uuid();

export function validateUuidParam(param: string): string | null {
  const result = uuidSchema.safeParse(param);
  return result.success ? result.data : null;
}

export function requireUuidParam(request: FastifyRequest, reply: FastifyReply, paramName: string = 'id'): string | null {
  const params = request.params as Record<string, string>;
  const value = params[paramName];
  const validated = validateUuidParam(value);
  if (!validated) {
    reply.status(400).send({ error: { code: 'INVALID_PARAM', message: `Invalid ${paramName}: must be a valid UUID` } });
    return null;
  }
  return validated;
}
