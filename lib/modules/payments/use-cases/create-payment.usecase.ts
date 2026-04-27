export class CreatePaymentUseCase {
  constructor(private repo: any) {}

  async execute(data: any) {
    if (!data.amount || data.amount <= 0) {
      throw new Error("Monto inválido");
    }

    return this.repo.create({
      ...data,
      status: "PENDING",
    });
  }
}
