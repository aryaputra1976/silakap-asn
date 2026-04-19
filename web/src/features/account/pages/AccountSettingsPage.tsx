import {PageTitle, type PageLink} from '@/_metronic/layout/core'
import {useState} from 'react'
import {useCurrentUser} from '../hooks/useCurrentUser'
import {useChangePassword} from '../hooks/useChangePassword'

const breadcrumbs: Array<PageLink> = [
  {title: 'Dashboard', path: '/dashboard', isActive: false},
  {title: 'Account', path: '/account/settings', isActive: false},
]

const AccountSettingsPage = () => {
  const [tab, setTab] = useState<'overview' | 'password'>('overview')
  const {data} = useCurrentUser()
  const {mutate} = useChangePassword()

  return (
    <>
      <PageTitle breadcrumbs={breadcrumbs}>Account Settings</PageTitle>

      <div className='card'>
        <div className='card-body'>
          <ul className='nav nav-tabs nav-line-tabs nav-line-tabs-2x mb-5 fs-6'>
            <li className='nav-item'>
              <button
                className={`nav-link ${tab === 'overview' ? 'active' : ''}`}
                onClick={() => setTab('overview')}
              >
                Overview
              </button>
            </li>
            <li className='nav-item'>
              <button
                className={`nav-link ${tab === 'password' ? 'active' : ''}`}
                onClick={() => setTab('password')}
              >
                Change Password
              </button>
            </li>
          </ul>

          {tab === 'overview' && data && (
            <div className='row'>
              <div className='col-xl-6'>
                <div className='mb-5'>
                  <label className='form-label fw-bold'>Username</label>
                  <input
                    className='form-control form-control-solid'
                    value={data.username}
                    disabled
                  />
                </div>

                <div className='mb-5'>
                  <label className='form-label fw-bold'>Status</label>
                  <input
                    className='form-control form-control-solid'
                    value={data.isActive ? 'Active' : 'Inactive'}
                    disabled
                  />
                </div>

                <div className='mb-5'>
                  <label className='form-label fw-bold'>Roles</label>
                  <div>
                    {data.roles.map((r) => (
                      <span
                        key={r}
                        className='badge badge-light-primary me-2'
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === 'password' && (
            <PasswordForm onSubmit={mutate} />
          )}
        </div>
      </div>
    </>
  )
}

const PasswordForm = ({onSubmit}: any) => {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const handleSubmit = () => {
    if (newPassword !== confirm) {
      alert('Konfirmasi password tidak sama')
      return
    }

    onSubmit({
      oldPassword: currentPassword,
      newPassword,
    })
  }

  return (
    <div className='row'>
      <div className='col-xl-6'>
        <div className='mb-5'>
          <label className='form-label fw-bold'>Current Password</label>
          <input
            type='password'
            className='form-control form-control-solid'
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
        </div>

        <div className='mb-5'>
          <label className='form-label fw-bold'>New Password</label>
          <input
            type='password'
            className='form-control form-control-solid'
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className='mb-5'>
          <label className='form-label fw-bold'>Confirm Password</label>
          <input
            type='password'
            className='form-control form-control-solid'
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>

        <button className='btn btn-primary' onClick={handleSubmit}>
          Update Password
        </button>
      </div>
    </div>
  )
}

export default AccountSettingsPage