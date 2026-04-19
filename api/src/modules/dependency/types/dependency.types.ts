export type DependencyStatus =
  | "COMPLETED"
  | "PENDING"

export interface DependencyCheckInput {

  pegawaiId: bigint
  layananId: bigint

}

export interface DependencyResult {

  dependency: string
  status: DependencyStatus

}