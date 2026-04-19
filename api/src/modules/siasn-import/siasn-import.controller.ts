import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { SiasnImportService } from './siasn-import.service'

@Controller('siasn')
export class SiasnImportController {
  constructor(private readonly service: SiasnImportService) {}

  private static storage = diskStorage({
    destination: './uploads/siasn',
    filename: (req, file, cb) => {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
      cb(null, unique + extname(file.originalname))
    },
  })

  // ============================
  // IMPORT PEGAWAI
  // ============================
  @Post('import/pegawai')
  @UseInterceptors(FileInterceptor('file', { storage: SiasnImportController.storage }))
  importPegawai(@UploadedFile() file: Express.Multer.File) {
    return this.service.importPegawai(file)
  }

  // ============================
  // IMPORT RIWAYAT JABATAN
  // ============================
  @Post('import/riwayat-jabatan')
  @UseInterceptors(FileInterceptor('file', { storage: SiasnImportController.storage }))
  importRiwayatJabatan(@UploadedFile() file: Express.Multer.File) {
    return this.service.importRiwayatJabatan(file)
  }

  // ============================
  // IMPORT RIWAYAT PANGKAT
  // ============================
  @Post('import/riwayat-pangkat')
  @UseInterceptors(FileInterceptor('file', { storage: SiasnImportController.storage }))
  importRiwayatPangkat(@UploadedFile() file: Express.Multer.File) {
    return this.service.importRiwayatPangkat(file)
  }

  // ============================
  // IMPORT RIWAYAT PENDIDIKAN
  // ============================
  @Post('import/riwayat-pendidikan')
  @UseInterceptors(FileInterceptor('file', { storage: SiasnImportController.storage }))
  importRiwayatPendidikan(@UploadedFile() file: Express.Multer.File) {
    return this.service.importRiwayatPendidikan(file)
  }

  // ============================
  // LOG IMPORT
  // ============================
  @Get('import/log')
  getLogs() {
    return this.service.getLogs()
  }
}
