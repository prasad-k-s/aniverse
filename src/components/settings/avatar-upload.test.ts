import { MAX_AVATAR_BYTES, validateAvatar } from './avatar-upload'

jest.mock('@/app/settings/actions', () => ({ updateAvatarUrl: jest.fn() }))
jest.mock('@/lib/supabase/client', () => ({ createClient: jest.fn() }))

function fakeFile(type: string, size: number) {
  return { type, size, name: 'avatar.png' } as File
}

describe('validateAvatar', () => {
  it('accepts small images', () => {
    expect(validateAvatar(fakeFile('image/png', 500_000))).toBeNull()
  })

  it('rejects other file types', () => {
    expect(validateAvatar(fakeFile('application/pdf', 1000))).toMatch(/PNG, JPG/)
  })

  it('rejects files over 2 MB', () => {
    expect(validateAvatar(fakeFile('image/jpeg', MAX_AVATAR_BYTES + 1))).toMatch(/2 MB/)
  })
})
