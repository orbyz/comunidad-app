export class RejectPaymentUseCase {
  constructor(private repo: any) {}

  async execute(paymentId: string, meta?: any) {
    return this.repo.updateStatus(paymentId, {
      status: "REJECTED",
      rejected_at: new Date().toISOString(),
      rejected_by: meta?.rejected_by,
    });
  }
}
