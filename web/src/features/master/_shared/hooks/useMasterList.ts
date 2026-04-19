//D:\_silakap_web\src\features\master\_shared\hooks\useMasterList.ts
import { useCallback, useEffect, useState } from "react"
import { getMasterList } from "../api/getMasterList.api"
import { createMaster } from "../api/createMaster.api"
import { updateMaster } from "../api/updateMaster.api"
import { deleteMaster } from "../api/deleteMaster.api"
import type {
  MasterEntity,
  CreateMasterPayload,
  UpdateMasterPayload,
} from "../types"
import type { HttpError } from "@/core/http/httpError"
import { showToast } from "@/core/toast/toast.hook"
import { MASTER_NO_SORT } from "../config/noSortMasters"

export function useMasterList(endpoint: string) {
  const [state, setState] = useState({
    data: [] as MasterEntity[],
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    search: "",
    sort: "kode" as "kode" | "nama",
    loading: false,
    error: null as string | null,

    showForm: false,
    editing: null as MasterEntity | null,
    submitting: false,
  })

  const fetchData = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }))

    try {
      console.log('MASTER ENDPOINT', endpoint)

      const res = await getMasterList(endpoint, {
        page: state.page,
        limit: state.limit, 
        search: state.search || undefined,
        sort: MASTER_NO_SORT.includes(endpoint) ? undefined : state.sort,
      })

      setState((s) => ({
        ...s,
        data: res.data as MasterEntity[],
        total: res.meta.total,
        totalPages: res.meta.totalPages ?? 1,
        loading: false,
      }))
    } catch (err) {
      const e = err as HttpError
      showToast(e.message, "error")
      setState((s) => ({ ...s, loading: false, error: e.message }))
    }
  }, [endpoint, state.page, state.limit, state.search, state.sort])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const openCreate = () =>
    setState((s) => ({ ...s, showForm: true, editing: null }))

  const openEdit = (item: MasterEntity) =>
    setState((s) => ({ ...s, showForm: true, editing: item }))

  const closeForm = () =>
    setState((s) => ({ ...s, showForm: false, editing: null }))

  const submitForm = async (payload: CreateMasterPayload | UpdateMasterPayload) => {
    setState((s) => ({ ...s, submitting: true }))

    try {
      if (state.editing) {
        // UPDATE
        const updatePayload: UpdateMasterPayload = {
          kode: payload.kode,
          nama: payload.nama,
        }

        await updateMaster(endpoint, state.editing.id, updatePayload)
        showToast("Data berhasil diperbarui", "success")
      } else {
        // CREATE
        const createPayload: CreateMasterPayload = {
          kode: payload.kode!,
          nama: payload.nama!,
        }

        await createMaster(endpoint, createPayload)
        showToast("Data berhasil ditambahkan", "success")
      }

      closeForm()
      await fetchData()
    } catch (err) {
      const e = err as HttpError
      showToast(e.message, "error")
    } finally {
      setState((s) => ({ ...s, submitting: false }))
    }
  }

  const remove = async (item: MasterEntity) => {
    try {
      await deleteMaster(endpoint, item.id)
      showToast("Data berhasil dihapus", "success")
      await fetchData()
    } catch (err) {
      const e = err as HttpError
      showToast(e.message, "error")
    }
  }

  return {
    ...state,
    setPage: (page: number) => setState((s) => ({ ...s, page })),
    setLimit: (limit: number) => setState((s) => ({ ...s, limit, page: 1 })),
    setSearch: (search: string) => setState((s) => ({ ...s, search, page: 1 })),
    setSort: (sort: "kode" | "nama") => setState((s) => ({ ...s, sort })),

    openCreate,
    openEdit,
    closeForm,
    submitForm,
    remove,
    refetch: fetchData,
  }
}
