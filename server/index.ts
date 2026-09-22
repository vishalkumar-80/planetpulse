import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { activityTypes, calculateCO2, type ActivityType } from '../shared/emissions.js';

const db = new PrismaClient();
const app = express();
const port = Number(process.env.PORT ?? 3001);
const activityInput = z.object({
  type: z.enum(activityTypes),
  quantity: z.number().finite().positive().max(10_000_000), date: z.string().date(),
  note: z.string().trim().max(500).optional().default(''), unusual: z.boolean().optional().default(false),
});
app.use(cors());
app.use(express.json({ limit: '32kb' }));
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/activities', async (_req, res, next) => { try { res.json(await db.activity.findMany({ orderBy: [{ date: 'desc' }, { createdAt: 'desc' }] })); } catch (error) { next(error); } });
app.get('/api/dashboard', async (_req, res, next) => { try {
  const [activities, settings] = await Promise.all([
    db.activity.findMany({ select: { type: true, co2Kg: true, date: true } }),
    db.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } }),
  ]);
  const monday = new Date(); monday.setHours(0, 0, 0, 0); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const sunday = new Date(monday); sunday.setDate(sunday.getDate() + 7);
  const weekly = activities.filter((activity) => activity.date >= monday && activity.date < sunday);
  const categoryTotals = Object.fromEntries(activityTypes.map((type) => [type, activities.filter((activity) => activity.type === type).reduce((sum, activity) => sum + activity.co2Kg, 0)]));
  const dailyTotals = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday); day.setDate(day.getDate() + index);
    const nextDay = new Date(day); nextDay.setDate(nextDay.getDate() + 1);
    return { date: day.toISOString().slice(0, 10), co2Kg: weekly.filter((activity) => activity.date >= day && activity.date < nextDay).reduce((sum, activity) => sum + activity.co2Kg, 0) };
  });
  const weeklyCo2Kg = weekly.reduce((sum, activity) => sum + activity.co2Kg, 0);
  res.json({ totalCo2Kg: activities.reduce((sum, activity) => sum + activity.co2Kg, 0), weeklyCo2Kg, weeklyTarget: settings.weeklyTarget, remainingKg: settings.weeklyTarget - weeklyCo2Kg, progressPercent: (weeklyCo2Kg / settings.weeklyTarget) * 100, categoryTotals, dailyTotals });
} catch (error) { next(error); } });
app.post('/api/activities', async (req, res, next) => { try {
  const { type, quantity, date, note, unusual } = activityInput.parse(req.body) as { type: ActivityType; quantity: number; date: string; note: string; unusual: boolean };
  const calculation = calculateCO2(type, quantity);
  const activity = await db.activity.create({ data: { type, quantity, note, unusual, unit: calculation.unit, emissionFactor: calculation.emissionFactor, co2Kg: calculation.co2Kg, date: new Date(`${date}T12:00:00`) } });
  res.status(201).json(activity);
} catch (error) { next(error); } });
app.delete('/api/activities/:id', async (req, res, next) => { try { await db.activity.delete({ where: { id: req.params.id } }); res.status(204).end(); } catch (error) { next(error); } });
app.delete('/api/activities', async (_req, res, next) => { try { await db.activity.deleteMany(); res.status(204).end(); } catch (error) { next(error); } });
app.get('/api/settings', async (_req, res, next) => { try { res.json(await db.settings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } })); } catch (error) { next(error); } });
app.put('/api/settings', async (req, res, next) => { try {
  const { weeklyTarget } = z.object({ weeklyTarget: z.number().finite().positive().max(10_000_000) }).parse(req.body);
  res.json(await db.settings.upsert({ where: { id: 1 }, update: { weeklyTarget }, create: { id: 1, weeklyTarget } }));
} catch (error) { next(error); } });
const distDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
app.use(express.static(distDirectory));
app.get('*', (_req, res) => res.sendFile(path.join(distDirectory, 'index.html')));
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof z.ZodError) return res.status(400).json({ error: 'Please check the submitted details.' });
  console.error(error); return res.status(500).json({ error: 'Something went wrong. Please try again.' });
});
app.listen(port, () => console.log(`PlanetPulse is listening on port ${port}`));
