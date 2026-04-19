import {FC, useState} from 'react'
import {KTIcon} from '@/_metronic/helpers'
import {useMyProfile} from '../hooks/useMyProfile'
import {useChangePassword} from '../hooks/useChangePassword'
import {updateMyProfile} from '../api/updateMyProfile.api'
import { useToast } from '@/core/toast/toast.hook'

const MyProfilePage: FC = () => {
  const {data, isLoading, isError, refetch} = useMyProfile()
  const {mutate: changePassword, isPending} = useChangePassword()
  const toast = useToast()

  const [username, setUsername] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  if (isLoading) {
    return <div className='d-flex justify-content-center py-20'>Loading...</div>
  }

  if (isError || !data) {
    return (
      <div className='alert alert-danger m-10'>
        Gagal memuat profile
        <button className='btn btn-sm btn-light ms-4' onClick={() => refetch()}>
          Retry
        </button>
      </div>
    )
  }

  const handleUpdateProfile = async () => {
    await updateMyProfile(username || data.username)
    toast.success('Profile berhasil diperbarui')
    refetch()
  }

  const handleChangePassword = () => {
    changePassword({oldPassword, newPassword})
  }

  return (
    <div className='container-xxl'>

      {/* PROFILE HEADER CARD */}
      <div className='card mb-5 mb-xl-10'>
        <div className='card-body pt-9 pb-0'>

          <div className='d-flex flex-wrap flex-sm-nowrap mb-6'>

            <div className='me-7 mb-4'>
              <div className='symbol symbol-100px symbol-lg-160px symbol-fixed position-relative'>
                <div className='symbol-label bg-light-primary text-primary fw-bold fs-2'>
                  {data.username.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            <div className='flex-grow-1'>
              <div className='d-flex justify-content-between align-items-start flex-wrap mb-2'>
                <div className='d-flex flex-column'>
                  <div className='d-flex align-items-center mb-2'>
                    <span className='text-gray-900 text-hover-primary fs-2 fw-bold me-1'>
                      {data.username}
                    </span>
                    <KTIcon iconName='verify' className='fs-1 text-primary' />
                  </div>

                  <div className='d-flex flex-wrap fw-semibold fs-6 mb-4 pe-2'>
                    <span className='d-flex align-items-center text-gray-400 me-5 mb-2'>
                      <KTIcon iconName='profile-circle' className='fs-4 me-1' />
                      {data.pegawai?.nama ?? 'Belum terhubung ke pegawai'}
                    </span>
                  </div>
                </div>

                <div className='d-flex my-4'>
                  {data.roles.map((role) => (
                    <span key={role} className='badge badge-light-primary me-2'>
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* UPDATE PROFILE */}
      <div className='card mb-5 mb-xl-10'>
        <div className='card-header border-0'>
          <div className='card-title m-0'>
            <h3 className='fw-bold m-0'>Update Profile</h3>
          </div>
        </div>

        <div className='card-body border-top p-9'>
          <div className='row mb-6'>
            <label className='col-lg-4 col-form-label fw-semibold fs-6'>
              Username
            </label>
            <div className='col-lg-8'>
              <input
                type='text'
                className='form-control form-control-lg form-control-solid'
                value={username || data.username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className='d-flex justify-content-end'>
            <button className='btn btn-primary' onClick={handleUpdateProfile}>
              <KTIcon iconName='check' className='fs-3 me-2' />
              Simpan Perubahan
            </button>
          </div>
        </div>
      </div>

      {/* CHANGE PASSWORD */}
      <div className='card'>
        <div className='card-header border-0'>
          <div className='card-title m-0'>
            <h3 className='fw-bold m-0'>Security</h3>
          </div>
        </div>

        <div className='card-body border-top p-9'>

          <div className='row mb-6'>
            <label className='col-lg-4 col-form-label fw-semibold fs-6'>
              Password Lama
            </label>
            <div className='col-lg-8'>
              <input
                type='password'
                className='form-control form-control-lg form-control-solid'
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
          </div>

          <div className='row mb-6'>
            <label className='col-lg-4 col-form-label fw-semibold fs-6'>
              Password Baru
            </label>
            <div className='col-lg-8'>
              <input
                type='password'
                className='form-control form-control-lg form-control-solid'
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <div className='d-flex justify-content-end'>
            <button
              className='btn btn-light-danger'
              onClick={handleChangePassword}
              disabled={isPending}
            >
              <KTIcon iconName='key' className='fs-3 me-2' />
              {isPending ? 'Menyimpan...' : 'Ubah Password'}
            </button>
          </div>

        </div>
      </div>

    </div>
  )
}

export default MyProfilePage