import { PegawaiSiasnRow } from '../dto/pegawai-siasn-row.interface'

export interface PegawaiValidationError {
  rowIndex: number
  nip?: string
  message: string
  field?: string
}

export class PegawaiSiasnValidator {
  validateRow(row: PegawaiSiasnRow, index: number): PegawaiValidationError[] {
    const errors: PegawaiValidationError[] = []

    // Wajib ada
    if (!row['NIP BARU']) {
      errors.push({
        rowIndex: index,
        message: 'NIP BARU wajib diisi',
        field: 'NIP BARU',
      })
    }

    if (!row['NAMA']) {
      errors.push({
        rowIndex: index,
        nip: row['NIP BARU'],
        message: 'NAMA wajib diisi',
        field: 'NAMA',
      })
    }

    if (!row['TANGGAL LAHIR']) {
      errors.push({
        rowIndex: index,
        nip: row['NIP BARU'],
        message: 'TANGGAL LAHIR wajib diisi',
        field: 'TANGGAL LAHIR',
      })
    }

    return errors
  }

  validateAll(rows: PegawaiSiasnRow[]): PegawaiValidationError[] {
    const allErrors: PegawaiValidationError[] = []

    rows.forEach((row, idx) => {
      const rowErrors = this.validateRow(row, idx + 1)
      allErrors.push(...rowErrors)
    })

    return allErrors
  }
}
