Script aktif yang tersisa di folder ini adalah jalur `.ts`.

Kelompok script `.js` lama telah dibersihkan karena:
- tidak direferensikan oleh aplikasi utama
- saling bergantung hanya pada helper legacy
- memakai nama Prisma client lama yang tidak lagi cocok dengan `prisma/schema.prisma`

Contoh script yang masih relevan:
- `import-ref-*.ts`
- `import-tempat-lahir.ts`
- `import-unor2.ts`
- `import-pegawai.ts`
- `generate-unor-kode.ts`
- `rebuild-asn-ranking.ts`
- `seed-kecamatan.ts`
