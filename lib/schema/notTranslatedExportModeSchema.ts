import z from 'zod';
import { NotTranslatedExportMode } from '../generated/prisma/enums';

export const notTranslatedExportModeSchema = z.enum(NotTranslatedExportMode);
