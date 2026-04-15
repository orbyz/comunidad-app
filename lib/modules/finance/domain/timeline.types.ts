export type TimelineEventType =
  | "DEBT_CREATED"
  | "PAYMENT_CREATED"
  | "PAYMENT_APPLIED";

export type TimelineEvent = {
  id: string;
  type: TimelineEventType;
  date: Date;
  amount: number;
  description: string;
};
