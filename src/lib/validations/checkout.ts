import { z } from "zod";

export const VALID_DISTRICTS = [
  "Bayanzurkh",
  "Sukhbaatar",
  "Chingeltei",
  "Bayangol",
  "KhanUul",
  "Songinokhairkhan",
] as const;

export const VALID_PAYMENTS = ["qpay", "bank", "cash"] as const;

export const checkoutSchema = z.object({
  fullName: z
    .string()
    .min(2, "Нэр хамгийн багадаа 2 тэмдэгт байна")
    .max(100, "Нэр хэт урт байна")
    .regex(/^[Ѐ-ӿÀ-ɏ a-zA-Z\-'.]+$/, "Нэрт зөвхөн үсэг оруулна уу"),
  phone: z
    .string()
    .regex(/^\d{8}$/, "8 оронтой тоо оруулна уу"),
  district: z.enum(VALID_DISTRICTS, {
    errorMap: () => ({ message: "Дүүрэг сонгоно уу" }),
  }),
  address: z
    .string()
    .min(5, "Хаяг хамгийн багадаа 5 тэмдэгт байна")
    .max(500, "Хаяг хэт урт байна"),
  payment: z.enum(VALID_PAYMENTS, {
    errorMap: () => ({ message: "Төлбөрийн хэрэгсэл сонгоно уу" }),
  }),
});

export type CheckoutData = z.infer<typeof checkoutSchema>;
export type CheckoutErrors = Partial<Record<keyof CheckoutData, string>>;
