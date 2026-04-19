# Post Deploy Checklist

Checklist ringkas setelah release:

- aplikasi hidup dan port terbuka
- `/api/health` mengembalikan status sehat
- cookie refresh token terset dengan benar
- CORS hanya menerima origin frontend resmi
- login berhasil
- refresh token berhasil
- logout berhasil
- satu workflow layanan berhasil submit dan transition
- Redis queue tidak error
- log error tidak spam
- Swagger mati di production bila memang dinonaktifkan
- tidak ada secret development yang tertinggal
