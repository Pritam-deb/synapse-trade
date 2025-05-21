// src/types/express.d.ts or src/types/custom.d.ts

import { Request, Response } from 'express';
import { User } from '@prisma/client'; // Assuming User is a Prisma model

declare global {
  namespace Express {
    export interface Request {
      user?: any
      // Make it optional in case it's not always present
    }
    export interface Response {
      user?: any
      // Make it optional in case it's not always present
    }
  }
} 