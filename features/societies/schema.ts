import { z } from "zod";

export const SocietyRegistrationFormSchema = z.object({
  societyId: z.string(),
  whatsappNo: z.string(),
  semester: z.number(),
  interestedRole: z.string(),
  reason: z.string().min(10, {
    message: "The reason should be atleast 10 characters minimum.",
  }),
  expectations: z.string().min(10, {
    message: "The expectations should be atleast 10 characters minimum.",
  }),
  skills: z.string(),
  isAgree: z.boolean().default(false).optional(),
});
export type SocietyRegistrationFormValues = z.infer<
  typeof SocietyRegistrationFormSchema
>;

export const SocietyProfileSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  logo: z.any().optional(),
  statementOfPurpose: z.string().optional(),
  advisorMessage: z.string().optional(),
  mission: z.string().optional(),
  coreValues: z.string().optional(),
});

export type SocietyProfileData = z.infer<typeof SocietyProfileSchema>;

export const SocietySettingsSchema = z.object({
  membersLimit: z.number({ message: "Please enter a valid value" }).default(40),
  acceptingNewMembers: z.boolean().default(true),
});

export type SocietySettingsValues = z.infer<typeof SocietySettingsSchema>;
