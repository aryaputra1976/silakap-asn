import { useEffect, useRef, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { useFormik } from "formik"
import * as Yup from "yup"
import clsx from "clsx"

import { getRegisterPegawai, register } from "@/features/auth/api"
import type { RegisterPegawaiLookup } from "../types"

const schema = Yup.object({
  nip: Yup.string()
    .trim()
    .matches(/^\d+$/, "NIP hanya boleh berisi angka")
    .min(18, "NIP harus 18 digit")
    .max(18, "NIP harus 18 digit")
    .required("NIP wajib"),
  email: Yup.string().email("Format email tidak valid").required("Email wajib"),
  noHp: Yup.string()
    .matches(/^[0-9+]+$/, "No. HP hanya boleh berisi angka dan tanda +")
    .min(8, "No. HP minimal 8 digit")
    .max(30, "No. HP maksimal 30 digit")
    .required("No. HP wajib"),
  password: Yup.string()
    .min(8, "Password minimal 8 karakter")
    .required("Password wajib"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Konfirmasi password tidak sesuai")
    .required("Konfirmasi password wajib"),
})

function InputIcon({
  type,
}: {
  type: "user" | "card" | "lock"
}) {
  if (type === "card") {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M3 10h18"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  if (type === "lock") {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M7 10V8a5 5 0 0 1 10 0v2"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="4"
          y="10"
          width="16"
          height="10"
          rx="3"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M12 14v2"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    )
  }

  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M5 20a7 7 0 0 1 14 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

type FieldName =
  | "nip"
  | "email"
  | "noHp"
  | "password"
  | "confirmPassword"

function FieldShell({
  children,
  error,
}: {
  children: ReactNode
  error: boolean
}) {
  return (
    <div
      className={clsx(
        "d-flex align-items-center rounded-pill px-4 py-2",
        { "border border-danger": error },
      )}
      style={{
        minHeight: 62,
        background: "linear-gradient(145deg, #edf3f8, #dbe5ef)",
        boxShadow:
          "inset 7px 7px 14px rgba(168,183,200,0.34), inset -7px -7px 14px rgba(255,255,255,0.92)",
        color: "#7b8f9d",
      }}
    >
      {children}
    </div>
  )
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [lookupLoading, setLookupLoading] = useState(false)
  const [pegawaiInfo, setPegawaiInfo] = useState<RegisterPegawaiLookup | null>(
    null,
  )
  const lookupTimerRef = useRef<number | null>(null)

  const formik = useFormik({
    initialValues: {
      nip: "",
      email: "",
      noHp: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: schema,
    onSubmit: async (values, { setStatus, resetForm }) => {
      setLoading(true)
      setSuccessMessage("")

      try {
        const response = await register({
          nip: values.nip.replace(/\s+/g, "").trim(),
          email: values.email.trim(),
          noHp: values.noHp.trim(),
          password: values.password,
          confirmPassword: values.confirmPassword,
        })

        resetForm()
        setStatus(undefined)
        setPegawaiInfo(null)
        setSuccessMessage(response.message)
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Registrasi gagal. Silakan coba lagi."
        setStatus(message)
      } finally {
        setLoading(false)
      }
    },
  })

  useEffect(() => {
    const nip = formik.values.nip.replace(/\s+/g, "").trim()

    if (lookupTimerRef.current) {
      window.clearTimeout(lookupTimerRef.current)
    }

    if (!nip || nip.length !== 18 || formik.errors.nip) {
      setPegawaiInfo(null)
      return
    }

    lookupTimerRef.current = window.setTimeout(async () => {
      setLookupLoading(true)

      try {
        const result = await getRegisterPegawai(nip)
        setPegawaiInfo(result)
        formik.setFieldValue("nip", result.nip, false)
        formik.setStatus(undefined)
      } catch (error) {
        setPegawaiInfo(null)
        const message =
          error instanceof Error ? error.message : "NIP tidak ditemukan"
        formik.setStatus(message)
      } finally {
        setLookupLoading(false)
      }
    }, 450)

    return () => {
      if (lookupTimerRef.current) {
        window.clearTimeout(lookupTimerRef.current)
      }
    }
  }, [formik.values.nip, formik.errors.nip])

  const hasError = (name: FieldName) =>
    Boolean(formik.touched[name] && formik.errors[name])

  const readOnlyFieldStyle = {
    minHeight: 62,
    background:
      "linear-gradient(145deg, rgba(237,243,248,0.92), rgba(219,229,239,0.78))",
    boxShadow:
      "inset 7px 7px 14px rgba(168,183,200,0.2), inset -7px -7px 14px rgba(255,255,255,0.76)",
    color: "#607989",
  } as const

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center px-4 py-5"
      style={{
        background:
          "linear-gradient(145deg, #dfe7f0 0%, #edf3f8 45%, #d9e4ee 100%)",
      }}
    >
      <div
        className="w-100 rounded-5 px-4 px-md-5 py-5"
        style={{
          maxWidth: 920,
          background: "linear-gradient(145deg, #e8eef5 0%, #edf3f8 100%)",
          boxShadow:
            "-16px -16px 32px rgba(255,255,255,0.82), 18px 18px 36px rgba(166,182,199,0.42)",
        }}
      >
        <div className="mb-5">
          <div
            className="d-flex flex-column flex-md-row align-items-center align-items-md-start justify-content-center gap-3 gap-md-4"
            style={{
              color: "#1f2b36",
            }}
          >
            <div
              className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
              style={{
                width: 84,
                height: 84,
                background: "linear-gradient(145deg, #edf3f8 0%, #dbe5ef 100%)",
                boxShadow:
                  "-8px -8px 18px rgba(255,255,255,0.82), 10px 10px 20px rgba(165,181,198,0.42)",
              }}
            >
              <img
                src="/logo-bkpsdm.svg"
                alt="Logo BKPSDM"
                style={{
                  width: 50,
                  height: 50,
                  objectFit: "contain",
                }}
              />
            </div>

            <div
              className="text-center text-md-start"
              style={{ maxWidth: 640 }}
            >
              <h1
                className="fw-bold mb-1"
                style={{ color: "#1f2b36", fontSize: "2rem" }}
              >
                Registrasi SILAKAP
              </h1>
              <div
                className="fw-semibold"
                style={{
                  color: "#6f8797",
                  fontSize: "0.98rem",
                  letterSpacing: "0.04em",
                }}
              >
                BKPSDM
              </div>

              <p
                className="mb-0"
                style={{
                  color: "#738a99",
                  fontSize: "0.98rem",
                  lineHeight: 1.8,
                }}
              >
                Buat akun baru untuk mengakses layanan ASN. Jika Anda memiliki
                NIP aktif, masukkan agar akun dapat dikaitkan dengan data
                pegawai. Pendaftaran ini khusus operator perangkat daerah dan
                akun akan aktif setelah verifikasi admin.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={formik.handleSubmit} noValidate autoComplete="off">
          {formik.status && (
            <div
              className="mb-4 px-4 py-3 rounded-4"
              style={{
                color: "#a03e4a",
                background: "linear-gradient(145deg, #f6dce1, #fdecee)",
                boxShadow:
                  "inset 4px 4px 8px rgba(188,142,149,0.14), inset -4px -4px 8px rgba(255,255,255,0.72)",
              }}
            >
              {formik.status}
            </div>
          )}

          {successMessage && (
            <div
              className="mb-4 px-4 py-3 rounded-4"
              style={{
                color: "#1f6b4d",
                background: "linear-gradient(145deg, #def5ea, #ebfbf3)",
                boxShadow:
                  "inset 4px 4px 8px rgba(124,176,150,0.16), inset -4px -4px 8px rgba(255,255,255,0.72)",
              }}
            >
              {successMessage}
            </div>
          )}

          <div className="row g-4">
            <div className="col-md-6">
              <label
                htmlFor="register-nip"
                className="form-label fw-semibold ps-2"
                style={{ color: "#607989" }}
              >
                NIP
              </label>
              <FieldShell error={hasError("nip")}>
                <span className="me-3">
                  <InputIcon type="card" />
                </span>
                <input
                  id="register-nip"
                  autoComplete="off"
                  {...formik.getFieldProps("nip")}
                  placeholder="NIP aktif"
                  className="form-control border-0 bg-transparent shadow-none p-0"
                  style={{ color: "#496271", fontSize: "1rem" }}
                />
              </FieldShell>
              <div
                className="small ps-3 pt-2"
                style={{ color: "#7691a2", minHeight: 24 }}
              >
                {hasError("nip")
                  ? formik.errors.nip
                  : lookupLoading
                    ? "Mencari data pegawai..."
                    : "Isi 18 digit NIP untuk memuat data pegawai."}
              </div>
            </div>

            <div className="col-md-6">
              <label
                className="form-label fw-semibold ps-2"
                style={{ color: "#607989" }}
              >
                Nama Pegawai
              </label>
              <div
                className="rounded-pill px-4 py-2 d-flex align-items-center"
                style={readOnlyFieldStyle}
              >
                <span style={{ fontSize: "0.98rem" }}>
                  {pegawaiInfo?.nama ?? "-"}
                </span>
              </div>
            </div>

            <div className="col-md-6">
              <label
                htmlFor="register-email"
                className="form-label fw-semibold ps-2"
                style={{ color: "#607989" }}
              >
                Email
              </label>
              <FieldShell error={hasError("email")}>
                <span className="me-3">
                  <InputIcon type="user" />
                </span>
                <input
                  id="register-email"
                  type="email"
                  autoComplete="new-password"
                  data-lpignore="true"
                  data-form-type="other"
                  {...formik.getFieldProps("email")}
                  placeholder="Email pegawai"
                  className="form-control border-0 bg-transparent shadow-none p-0"
                  style={{ color: "#496271", fontSize: "1rem" }}
                />
              </FieldShell>
              {hasError("email") && (
                <div className="text-danger small ps-3 pt-2">
                  {formik.errors.email}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label
                className="form-label fw-semibold ps-2"
                style={{ color: "#607989" }}
              >
                Unor Pegawai
              </label>
              <div
                className="rounded-pill px-4 py-2 d-flex align-items-center"
                style={readOnlyFieldStyle}
              >
                <span style={{ fontSize: "0.98rem" }}>
                  {pegawaiInfo?.unorNama ?? "-"}
                </span>
              </div>
            </div>

            <div className="col-md-6">
              <label
                htmlFor="register-nohp"
                className="form-label fw-semibold ps-2"
                style={{ color: "#607989" }}
              >
                No. HP Pegawai
              </label>
              <FieldShell error={hasError("noHp")}>
                <span className="me-3">
                  <InputIcon type="card" />
                </span>
                <input
                  id="register-nohp"
                  autoComplete="off"
                  data-lpignore="true"
                  {...formik.getFieldProps("noHp")}
                  placeholder="No. HP pegawai"
                  className="form-control border-0 bg-transparent shadow-none p-0"
                  style={{ color: "#496271", fontSize: "1rem" }}
                />
              </FieldShell>
              {hasError("noHp") && (
                <div className="text-danger small ps-3 pt-2">
                  {formik.errors.noHp}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label
                className="form-label fw-semibold ps-2"
                style={{ color: "#607989" }}
              >
                Role Default
              </label>
              <div
                className="rounded-pill px-4 py-2 d-flex align-items-center"
                style={readOnlyFieldStyle}
              >
                <span style={{ fontSize: "0.98rem" }}>OPERATOR</span>
              </div>
              <div
                className="small ps-3 pt-2"
                style={{ color: "#7691a2", minHeight: 24 }}
              >
                Role ini diberikan sebagai default untuk pendaftar dari
                perangkat daerah.
              </div>
            </div>

            <div className="col-md-6">
              <label
                htmlFor="register-password"
                className="form-label fw-semibold ps-2"
                style={{ color: "#607989" }}
              >
                Password
              </label>
              <FieldShell error={hasError("password")}>
                <span className="me-3">
                  <InputIcon type="lock" />
                </span>
                <input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  {...formik.getFieldProps("password")}
                  placeholder="Password"
                  className="form-control border-0 bg-transparent shadow-none p-0"
                  style={{ color: "#496271", fontSize: "1rem" }}
                />
              </FieldShell>
              {hasError("password") && (
                <div className="text-danger small ps-3 pt-2">
                  {formik.errors.password}
                </div>
              )}
            </div>

            <div className="col-md-6">
              <label
                htmlFor="register-confirm-password"
                className="form-label fw-semibold ps-2"
                style={{ color: "#607989" }}
              >
                Konfirmasi Password
              </label>
              <FieldShell error={hasError("confirmPassword")}>
                <span className="me-3">
                  <InputIcon type="lock" />
                </span>
                <input
                  id="register-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  {...formik.getFieldProps("confirmPassword")}
                  placeholder="Konfirmasi password"
                  className="form-control border-0 bg-transparent shadow-none p-0"
                  style={{ color: "#496271", fontSize: "1rem" }}
                />
              </FieldShell>
              {hasError("confirmPassword") && (
                <div className="text-danger small ps-3 pt-2">
                  {formik.errors.confirmPassword}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn w-100 rounded-pill fw-bold text-white border-0 mt-2"
            disabled={loading}
            style={{
              minHeight: 60,
              fontSize: "1.05rem",
              background:
                "linear-gradient(135deg, #63d0ef 0%, #2ca8cc 100%)",
              boxShadow:
                "8px 8px 18px rgba(109,165,186,0.35), -6px -6px 12px rgba(255,255,255,0.65)",
            }}
          >
            {!loading ? "Daftar" : "Memproses..."}
          </button>

          <div className="text-center mt-4">
            <div
              className="mb-3"
              style={{ color: "#7a8f9e", fontSize: "0.95rem" }}
            >
              Akun baru akan berstatus belum aktif sampai diverifikasi oleh
              admin BKPSDM.
            </div>
            <Link
              to="/login"
              style={{
                color: "#5a7c8f",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Sudah punya akun? Kembali ke login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
