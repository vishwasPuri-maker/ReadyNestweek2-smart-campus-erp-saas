import { z } from "zod";
import { BRANCHES, SECTIONS } from "@/lib/classes";

// Attachment metadata stored on an item (the bytes live in FileBlob, keyed by id).
export const attachmentSchema = z.object({
  id: z.string().min(1).max(64),
  name: z.string().min(1).max(255),
  type: z.string().min(1).max(150),
  size: z.number().int().min(0).max(10 * 1024 * 1024),
});

// ---- Profile ----
export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    currentPassword: z.string().min(1).max(200).optional(),
    newPassword: z.string().min(8).max(200).optional(),
    branch: z.enum(BRANCHES).optional(),
    section: z.enum(SECTIONS).optional(),
  })
  .refine((d) => !d.newPassword || !!d.currentPassword, {
    message: "currentPassword is required to set a new password",
    path: ["currentPassword"],
  });

// ---- Users (admin-managed) ----
export const createUserSchema = z.object({
  email: z.email().trim().toLowerCase(),
  name: z.string().trim().min(2).max(120),
  role: z.enum(["TEACHER", "STUDENT"]), // admins are created via org registration only
  password: z.string().min(8).max(200),
});

export const updateUserSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  role: z.enum(["TEACHER", "STUDENT"]).optional(),
  isActive: z.boolean().optional(),
});

// ---- Organization settings ----
export const updateOrgSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    logoUrl: z.url().max(500).nullable().optional(),
  })
  .refine((d) => d.name !== undefined || d.logoUrl !== undefined, {
    message: "Nothing to update",
  });

// ---- Notices ----
export const createNoticeSchema = z.object({
  title: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(5000),
  attachment: attachmentSchema.optional(),
});
export const updateNoticeSchema = createNoticeSchema.partial();

// ---- Timetable ----
export const createTimetableSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "HH:MM"),
  endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "HH:MM"),
  subject: z.string().trim().min(1).max(120),
  room: z.string().trim().max(60).optional(),
  teacherId: z.string().min(1).max(64).optional(),
  branch: z.enum(BRANCHES).optional(),
  section: z.enum(SECTIONS).optional(),
});
export const updateTimetableSchema = createTimetableSchema.partial();

// ---- Attendance ----
export const markAttendanceSchema = z.object({
  studentId: z.string().min(1).max(64),
  date: z.coerce.date(),
  present: z.boolean(),
  subject: z.string().trim().min(1).max(120), // required: part of the per-day uniqueness key
});

// ---- Tasks / Assignments ----
export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional(),
  dueDate: z.coerce.date().optional(),
  // When set (teacher/admin only), the task is assigned to this user; else it's personal.
  ownerId: z.string().min(1).max(64).optional(),
  // Teacher assigns to every student in their branch+section.
  assignToClass: z.boolean().optional(),
  attachment: attachmentSchema.optional(),
});
export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  dueDate: z.coerce.date().nullable().optional(),
  completed: z.boolean().optional(),
});

// ---- Notes ----
const noteBase = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().max(20000).optional(),
  attachment: attachmentSchema.optional(),
});
export const createNoteSchema = noteBase.refine(
  (d) => (d.content && d.content.length > 0) || d.attachment,
  { message: "Write a note or attach a file", path: ["content"] }
);
export const updateNoteSchema = noteBase.partial();
