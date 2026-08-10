import { z } from "zod";

const optionalText = z.string().trim().max(500).optional().or(z.literal(""));

export const personInputSchema = z.object({
  name: z.string().trim().min(1, "姓名不能为空").max(80),
  gender: z.enum(["male", "female", "other", "unknown"]).default("unknown"),
  birthDate: optionalText,
  deathDate: optionalText,
  isLiving: z.boolean().default(true),
  avatar: z.string().trim().url("头像必须是有效 URL").optional().or(z.literal("")),
  phone: optionalText,
  location: optionalText,
  occupation: optionalText,
  generation: z.number().int().min(-100).max(100).optional(),
  biography: z.string().trim().max(5000).optional().or(z.literal(""))
});

export const relationInputSchema = z.object({
  fromPersonId: z.string().min(1),
  toPersonId: z.string().min(1),
  type: z.enum(["parent", "spouse", "sibling", "adoptive_parent", "guardian", "other"]),
  label: optionalText,
  startDate: optionalText,
  endDate: optionalText
}).refine((value) => value.fromPersonId !== value.toPersonId, {
  message: "不能将成员与自己连接",
  path: ["toPersonId"]
});

export const familyInfoSchema = z.object({
  surname: z.string().trim().max(20).default(""),
  familyName: z.string().trim().min(1).max(100),
  brandMark: z.string().trim().min(1).max(2).default("枝"),
  subtitle: z.string().trim().max(100).default("电子族谱 · 枝脉相承"),
  description: z.string().trim().max(1000)
});
