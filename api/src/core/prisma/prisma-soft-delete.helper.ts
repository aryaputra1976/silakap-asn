export class PrismaSoftDelete {
  static whereNotDeleted() {
    return {
      deletedAt: null,
    };
  }

  static markDeleted() {
    return {
      deletedAt: new Date(),
    };
  }
}
