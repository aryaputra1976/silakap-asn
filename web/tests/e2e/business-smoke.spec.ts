import { test, expect } from "@playwright/test"

function createAccessToken(): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url")
  const payload = Buffer.from(
    JSON.stringify({
      sub: "1",
      id: "1",
      name: "superadmin",
      role: "SUPER_ADMIN",
      roles: ["SUPER_ADMIN"],
      unitKerjaId: "10",
      permissions: [
        "MASTER.AGAMA.VIEW",
        "MASTER.AGAMA.CREATE",
        "SERVICE.VERIFY",
      ],
      exp: 9_999_999_999,
      iat: 1_700_000_000,
    }),
  ).toString("base64url")

  return `${header}.${payload}.signature`
}

test("login, create master, verify workflow, logout", async ({
  page,
}) => {
  let isAuthenticated = false
  let agamaItems = [
    {
      id: 1,
      kode: "ISLAM",
      nama: "Islam",
      isActive: true,
    },
  ]
  let approveCalled = false

  await page.route("**/auth/refresh", async (route) => {
    if (!isAuthenticated) {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: "Unauthorized" }),
      })
      return
    }

    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        access_token: createAccessToken(),
        expires_in: 900,
      }),
    })
  })

  await page.route("**/auth/login", async (route) => {
    isAuthenticated = true

    await route.fulfill({
      status: 201,
      headers: {
        "content-type": "application/json",
        "set-cookie":
          "refresh_token=test-refresh; Path=/; HttpOnly; SameSite=Lax",
      },
      body: JSON.stringify({
        access_token: createAccessToken(),
        expires_in: 900,
        user: {
          id: "1",
          username: "superadmin",
          roles: ["SUPER_ADMIN"],
          unitKerjaId: "10",
          bidangId: null,
          opd: null,
        },
        permissions: [
          "MASTER.AGAMA.VIEW",
          "MASTER.AGAMA.CREATE",
          "SERVICE.VERIFY",
        ],
      }),
    })
  })

  await page.route("**/users/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "1",
        username: "superadmin",
        isActive: true,
        roles: ["SUPER_ADMIN"],
        pegawai: null,
      }),
    })
  })

  await page.route("**/statistics/asn**", async (route) => {
    const url = new URL(route.request().url())
    const type = url.searchParams.get("type")

    if (type === "opd") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [],
          meta: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
          },
        }),
      })
      return
    }

    if (type === "retirement") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: [],
          meta: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 1,
          },
        }),
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        summary: {
          total: 8521,
          pns: 4331,
          pppk: 1411,
          pppkParuhWaktu: 2779,
        },
        distribution: {
          golongan: [],
          jabatan: [],
          usia: [],
          pendidikan: [],
          gender: [],
        },
        organization: {
          opd: [],
          heatmap: [],
        },
        ranking: [],
        retirement: {
          chart: [],
          table: [],
        },
      }),
    })
  })

  await page.route(
    "**/statistics/workforce/dashboard**",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          summary: {
            totalAsn: 8521,
            totalBebanKerja: 9000,
            totalKebutuhan: 9000,
            totalGap: 479,
            pensiun5Tahun: 125,
            rekomendasiFormasi: 200,
          },
          risk: {
            risikoKekurangan: 479,
            kategori: "sedang",
            tahunRisikoPuncak: 2028,
          },
          projection: [],
        }),
      })
    },
  )

  await page.route(/.*\/master\/agama(\?.*)?$/, async (route) => {
    if (route.request().resourceType() === "document") {
      await route.continue()
      return
    }

    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: agamaItems,
          meta: {
            page: 1,
            limit: 10,
            total: agamaItems.length,
            totalPages: 1,
          },
        }),
      })
      return
    }

    if (route.request().method() === "POST") {
      const payload = route.request().postDataJSON() as {
        kode: string
        nama: string
      }

      agamaItems = [
        ...agamaItems,
        {
          id: agamaItems.length + 1,
          kode: payload.kode,
          nama: payload.nama,
          isActive: true,
        },
      ]

      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      })
      return
    }

    await route.continue()
  })

  await page.route("**/pensiun/approve", async (route) => {
    approveCalled = true
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    })
  })

  await page.route("**/auth/logout", async (route) => {
    isAuthenticated = false
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ success: true }),
    })
  })

  await page.goto("/login")

  await page.getByPlaceholder("Username").fill("superadmin")
  await page.getByPlaceholder("Password").fill("password")
  await page.getByRole("button", { name: "Masuk" }).click()

  await expect(page).toHaveURL(/\/dashboard$/)
  await expect(
    page.getByRole("heading", { name: /Dashboard SILAKAP/i }),
  ).toBeVisible()

  await page.goto("/master/agama")
  await expect(
    page.getByRole("button", { name: /Tambah Agama/i }),
  ).toBeVisible()

  await page.getByRole("button", { name: /Tambah Agama/i }).click()
  await page.getByLabel("Kode").fill("HINDU")
  await page.getByLabel("Nama").fill("Hindu")
  await page.getByRole("button", { name: "Simpan" }).click()

  await expect(
    page.getByRole("cell", { name: "HINDU", exact: true }),
  ).toBeVisible()
  await expect(
    page.getByRole("cell", { name: "Hindu", exact: true }),
  ).toBeVisible()

  await page.goto("/workflow/verify/pensiun/101")
  await page.getByRole("button", { name: "Approve" }).click()

  await expect.poll(() => approveCalled).toBe(true)

  await page.goto("/dashboard")
  await expect(
    page.getByRole("heading", { name: /Dashboard SILAKAP/i }),
  ).toBeVisible()

  await page.getByTestId("user-menu-trigger").click()

  const headerLogoutAction = page.getByTestId("logout-action")
  await expect(headerLogoutAction).toBeVisible()
  await headerLogoutAction.click()

  await expect(page).toHaveURL(/\/login$/)
  await expect(
    page.getByRole("button", { name: "Masuk" }),
  ).toBeVisible()
})
