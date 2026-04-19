import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('SILAKAP API')
    .setDescription(
      'Dokumentasi resmi API SILAKAP — Sistem Informasi Layanan Kepegawaian Aparatur Pemerintah.',
    )
    .setVersion('1.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Masukkan token JWT Anda',
      },
      'JWT',
    )
    .setContact(
      'Dinas Kominfo',
      'https://silakap.go.id',
      'support@silakap.go.id',
    )
    .setLicense('MIT License', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3000', 'Local Development')
    .addServer('https://api.silakap.go.id', 'Production Server')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      docExpansion: 'none',
    },
    customSiteTitle: 'SILAKAP API Docs',
  });
}
