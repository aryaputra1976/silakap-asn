import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import * as Yup from "yup"
import { useFormik } from "formik"
import clsx from "clsx"

import { login } from "@/features/auth/api"
import { useAuthStore } from "@/stores/auth.store"
import type { AuthSession } from "../types"

const schema = Yup.object({
  username: Yup.string().required("Username wajib"),
  password: Yup.string().required("Password wajib"),
})

type LoginLocationState = {
  from?: {
    pathname?: string
  }
}

function InputIcon({ type }: { type: "user" | "lock" }) {
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

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setAuth = useAuthStore((state) => state.setAuth)

  const [loading, setLoading] = useState(false)

  const formik = useFormik({
    initialValues: { username: "", password: "" },
    validationSchema: schema,
    onSubmit: async (values, { setStatus }) => {
      setLoading(true)

      try {
        const response = await login(values)
        const session: AuthSession = {
          user: response.user,
          accessToken: response.access_token,
          permissions: response.permissions,
        }

        setAuth(session)

        const redirectTo =
          (location.state as LoginLocationState | null)?.from
            ?.pathname ?? "/"

        navigate(redirectTo, { replace: true })
      } catch {
        setStatus("Username atau password salah")
      } finally {
        setLoading(false)
      }
    },
  })

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center px-4 py-5"
      style={{
        background:
          "linear-gradient(145deg, #dfe7f0 0%, #edf3f8 45%, #d9e4ee 100%)",
      }}
    >
      <div className="w-100" style={{ maxWidth: 1040 }}>
        <div className="row g-4 align-items-center">
          <div className="col-lg-6 d-none d-lg-block">
            <div className="px-3 px-xl-5">
              <div
                className="rounded-5 p-4 p-xl-5 overflow-hidden d-flex flex-column"
                style={{
                  background:
                    "linear-gradient(160deg, rgba(255,255,255,0.72), rgba(229,238,246,0.92))",
                  boxShadow:
                    "-18px -18px 38px rgba(255,255,255,0.82), 20px 20px 44px rgba(168,183,200,0.42)",
                  minHeight: 620,
                }}
              >
                <div
                  className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill mb-4"
                  style={{
                    background: "rgba(255,255,255,0.56)",
                    color: "#4b7288",
                    boxShadow:
                      "inset 3px 3px 6px rgba(167,182,197,0.18), inset -3px -3px 6px rgba(255,255,255,0.7)",
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #58c6e4, #2a97ba)",
                      display: "inline-block",
                    }}
                  />
                  Portal Layanan ASN
                </div>

                <div
                  className="rounded-5 p-3 p-xl-4 mb-4"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(255,255,255,0.48), rgba(222,232,241,0.68))",
                    boxShadow:
                      "inset 8px 8px 16px rgba(167,182,197,0.16), inset -8px -8px 16px rgba(255,255,255,0.72)",
                  }}
                >
                  <img
                    src="/landing.png"
                    alt="Banner layanan SILAKAP ASN"
                    className="w-100 rounded-4"
                    style={{
                      display: "block",
                      objectFit: "cover",
                      boxShadow:
                        "0 20px 34px rgba(126, 148, 164, 0.18)",
                    }}
                  />
                </div>

                <h3
                  className="fw-bold lh-sm mb-3"
                  style={{
                    color: "#2f7c95",
                    fontSize: "clamp(1.7rem, 2.8vw, 2.7rem)",
                    letterSpacing: "-0.03em",
                    maxWidth: 420,
                  }}
                >
                  Sistem Informasi Layanan Kepegawaian
                  <br />
                  Terintegrasi dan Akuntabel
                </h3>

                <p
                  className="mb-0 mt-auto"
                  style={{
                    color: "#66889c",
                    fontSize: "1.02rem",
                    maxWidth: 450,
                    lineHeight: 1.8,
                  }}
                >
                  Mendukung proses administrasi ASN yang tertib,
                  cepat, dan profesional dalam satu portal layanan
                  digital.
                </p>
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="d-flex justify-content-center">
              <div
                className="w-100 rounded-5 px-4 px-md-5 py-5"
                style={{
                  maxWidth: 460,
                  background:
                    "linear-gradient(145deg, #e8eef5 0%, #edf3f8 100%)",
                  boxShadow:
                    "-16px -16px 32px rgba(255,255,255,0.82), 18px 18px 36px rgba(166,182,199,0.42)",
                }}
              >
                <div className="text-center mb-5">
                  <div
                    className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: 96,
                      height: 96,
                      background:
                        "linear-gradient(145deg, #edf3f8 0%, #dbe5ef 100%)",
                      boxShadow:
                        "-8px -8px 18px rgba(255,255,255,0.82), 10px 10px 20px rgba(165,181,198,0.42)",
                    }}
                  >
                    <img
                      src="/logo-bkpsdm.svg"
                      alt="Logo BKPSDM"
                      style={{
                        width: 58,
                        height: 58,
                        objectFit: "contain",
                      }}
                    />
                  </div>

                  <h2
                    className="fw-bold mb-2"
                    style={{ color: "#1f2b36", fontSize: "2rem" }}
                  >
                    Login SILAKAP
                  </h2>

                  <p
                    className="mb-0"
                    style={{
                      color: "#738a99",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      fontSize: "0.78rem",
                    }}
                  >
                    Sistem Layanan ASN
                  </p>
                </div>

                <form onSubmit={formik.handleSubmit} noValidate>
                  {formik.status && (
                    <div
                      className="mb-4 px-4 py-3 rounded-4"
                      style={{
                        color: "#a03e4a",
                        background:
                          "linear-gradient(145deg, #f6dce1, #fdecee)",
                        boxShadow:
                          "inset 4px 4px 8px rgba(188,142,149,0.14), inset -4px -4px 8px rgba(255,255,255,0.72)",
                      }}
                    >
                      {formik.status}
                    </div>
                  )}

                  <div className="mb-4">
                    <label
                      htmlFor="login-username"
                      className="form-label fw-semibold ps-2"
                      style={{ color: "#607989" }}
                    >
                      Username
                    </label>
                    <div
                      className={clsx(
                        "d-flex align-items-center rounded-pill px-4 py-2",
                        {
                          "border border-danger":
                            formik.touched.username &&
                            Boolean(formik.errors.username),
                        }
                      )}
                      style={{
                        minHeight: 64,
                        background:
                          "linear-gradient(145deg, #edf3f8, #dbe5ef)",
                        boxShadow:
                          "inset 7px 7px 14px rgba(168,183,200,0.34), inset -7px -7px 14px rgba(255,255,255,0.92)",
                        color: "#7b8f9d",
                      }}
                    >
                      <span className="me-3">
                        <InputIcon type="user" />
                      </span>
                      <input
                        id="login-username"
                        {...formik.getFieldProps("username")}
                        placeholder="Username"
                        className="form-control border-0 bg-transparent shadow-none p-0"
                        style={{
                          color: "#496271",
                          fontSize: "1rem",
                        }}
                      />
                    </div>
                    {formik.touched.username &&
                      formik.errors.username && (
                        <div className="text-danger small ps-3 pt-2">
                          {formik.errors.username}
                        </div>
                      )}
                  </div>

                  <div className="mb-4">
                    <label
                      htmlFor="login-password"
                      className="form-label fw-semibold ps-2"
                      style={{ color: "#607989" }}
                    >
                      Password
                    </label>
                    <div
                      className={clsx(
                        "d-flex align-items-center rounded-pill px-4 py-2",
                        {
                          "border border-danger":
                            formik.touched.password &&
                            Boolean(formik.errors.password),
                        }
                      )}
                      style={{
                        minHeight: 64,
                        background:
                          "linear-gradient(145deg, #edf3f8, #dbe5ef)",
                        boxShadow:
                          "inset 7px 7px 14px rgba(168,183,200,0.34), inset -7px -7px 14px rgba(255,255,255,0.92)",
                        color: "#7b8f9d",
                      }}
                    >
                      <span className="me-3">
                        <InputIcon type="lock" />
                      </span>
                      <input
                        id="login-password"
                        type="password"
                        {...formik.getFieldProps("password")}
                        placeholder="Password"
                        className="form-control border-0 bg-transparent shadow-none p-0"
                        style={{
                          color: "#496271",
                          fontSize: "1rem",
                        }}
                      />
                    </div>
                    {formik.touched.password &&
                      formik.errors.password && (
                        <div className="text-danger small ps-3 pt-2">
                          {formik.errors.password}
                        </div>
                      )}
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
                    {!loading ? "Masuk" : "Memproses..."}
                  </button>

                  <Link
                    to="/register"
                    className="btn w-100 rounded-pill fw-semibold border-0 mt-3 d-flex align-items-center justify-content-center"
                    style={{
                      minHeight: 58,
                      fontSize: "1rem",
                      color: "#4b7288",
                      background:
                        "linear-gradient(145deg, #e8eef5 0%, #edf3f8 100%)",
                      boxShadow:
                        "inset 6px 6px 12px rgba(168,183,200,0.24), inset -6px -6px 12px rgba(255,255,255,0.82)",
                    }}
                  >
                    Register
                  </Link>

                  <div
                    className="text-center mt-4"
                    style={{ color: "#7f93a0", fontSize: "0.95rem" }}
                  >
                    Lupa password? Hubungi administrator.
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
