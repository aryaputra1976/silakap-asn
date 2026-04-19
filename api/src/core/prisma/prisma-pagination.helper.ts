import { PaginationDto } from '../dto/pagination.dto';

export class PrismaPagination {
  static build(query: PaginationDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    return {
      skip: (page - 1) * limit,
      take: limit,
    };
  }

  static meta(total: number, query: PaginationDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;

    return {
      page,
      limit,
      total,
      lastPage: Math.ceil(total / limit),
    };
  }
}
