import { z } from "zod";

export const phoneLoginSchema = z.object({
  phone: z.string().regex(/^\d{8}$/, "8 оронтой утасны дугаар оруулна уу"),
  password: z.string().min(6, "Нууц үг хамгийн багадаа 6 тэмдэгт байна"),
});

export const phoneRegisterSchema = z.object({
  name: z.string().max(100, "Нэр хэт урт байна").optional(),
  phone: z.string().regex(/^\d{8}$/, "8 оронтой утасны дугаар оруулна уу"),
  password: z
    .string()
    .min(6, "Нууц үг хамгийн багадаа 6 тэмдэгт байна")
    .max(72, "Нууц үг хэт урт байна"),
});

export type PhoneLoginData = z.infer<typeof phoneLoginSchema>;
export type PhoneRegisterData = z.infer<typeof phoneRegisterSchema>;
