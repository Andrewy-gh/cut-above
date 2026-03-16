export type EmailOption =
  | "confirmation"
  | "modification"
  | "cancellation"
  | "reset password"
  | "reset password success"
  | "message auto reply"
  | "message submission";

export interface ContactDetails {
  firstName: string;
  lastName: string;
  email: string;
  message?: string;
}

export interface EmailPayload {
  receiver: string;
  employee?: string;
  date?: string;
  time?: string;
  option?: EmailOption;
  emailLink?: string;
  contactDetails?: ContactDetails;
}

export interface EmailTemplate {
  subject: string;
  text: string;
}

const getClientUrl = () =>
  process.env.SITE_URL ?? process.env.VITE_SITE_URL ?? "";

const getEmailUser = () =>
  process.env.EMAIL_USER ??
  process.env.RESEND_FROM ??
  process.env.RESEND_FROM_EMAIL ??
  process.env.EMAIL_FROM ??
  process.env.DEV_EMAIL_USER ??
  "";

export const buildEmailTemplate = (payload: EmailPayload): EmailTemplate => {
  const employee = payload.employee ?? "";
  const date = payload.date ?? "";
  const time = payload.time ?? "";
  const emailLink = payload.emailLink ?? "";
  const option = payload.option ?? "confirmation";
  const clientUrl = getClientUrl();
  const clientReference = clientUrl ? `on ${clientUrl}` : "in your account";

  switch (option) {
    case "confirmation":
      return {
        subject: "Your booking at Cut Above Barbershop:",
        text: `Thank you for booking with us. You are confirmed for an appointment on ${date} at ${time} with ${employee}. If you need to modify or cancel your appointment, please log into your account ${clientReference} or use this link: ${emailLink}`,
      };
    case "modification":
      return {
        subject: "Booking with Cut Above Barbershop has changed.",
        text: `Your original booking has been changed. You are now confirmed for an appointment on ${date} at ${time} with ${employee}. If you need to modify or cancel your appointment, please log into your account ${clientReference} or use this link: ${emailLink}`,
      };
    case "cancellation":
      return {
        subject: "Booking with Cut Above Barbershop has cancelled.",
        text: `Your booking on ${date} at ${time} with ${employee} has been cancelled. We are sorry to hear you can't make it. For any future needs, we are always here for you.`,
      };
    case "reset password":
      return {
        subject: "Instructions to reset your password.",
        text: `Follow this link to change your password: ${emailLink}. Once clicked this link will be immediately disabled. You also only have one hour before this link becomes inactive.`,
      };
    case "reset password success":
      return {
        subject: "Password successfully changed.",
        text: `Your password has successfully been changed. If this is incorrect please email ${getEmailUser()} immediately so that we can take action.`,
      };
    case "message auto reply":
      return {
        subject: "Your message has been received.",
        text: "Your message has been received. You will get a reply to your message in a timely manner. Please do not reply to this email.",
      };
    case "message submission":
      return {
        subject: "A new message has been submitted.",
        text: `You have received a new message from ${payload.contactDetails?.email ?? ""}:\n\nfirst name: ${
          payload.contactDetails?.firstName ?? ""
        }\nlast name: ${payload.contactDetails?.lastName ?? ""}\nmessage: ${
          payload.contactDetails?.message ?? ""
        }`,
      };
    default:
      throw new Error("Invalid template option type");
  }
};
