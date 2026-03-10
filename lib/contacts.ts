export const CONTACTS = {
  supportEmail: "support@speck-solutions.com.br",
  contactEmail: "contact@speck-solutions.com.br",
  notificationEmail: "notifications@speck-solutions.com.br",
  whatsappDigits: "5561996570568",
  whatsappDisplay: "+55 61 99657-0568"
} as const;

export const CONTACT_LINKS = {
  supportMailto: `mailto:${CONTACTS.supportEmail}`,
  contactMailto: `mailto:${CONTACTS.contactEmail}`,
  whatsapp: `https://wa.me/${CONTACTS.whatsappDigits}`
} as const;
