import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm, safeNextPath } from './login-form'

const replace = jest.fn()
const refresh = jest.fn()
let searchParams = new URLSearchParams()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace, refresh, push: jest.fn() }),
  useSearchParams: () => searchParams,
}))

const signInWithPassword = jest.fn()
jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { signInWithPassword } }),
}))

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    searchParams = new URLSearchParams()
  })

  it('validates the fields before calling Supabase', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
    expect(signInWithPassword).not.toHaveBeenCalled()
  })

  it('shows a friendly error for wrong credentials', async () => {
    signInWithPassword.mockResolvedValue({ error: { message: 'Invalid login credentials' } })
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText('Email'), 'prasad@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong-password')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email or password.')
    expect(replace).not.toHaveBeenCalled()
  })

  it('signs in and returns to the page the user came from', async () => {
    searchParams = new URLSearchParams('next=/anime/154587')
    signInWithPassword.mockResolvedValue({ error: null })
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText('Email'), 'prasad@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret123')
    await user.click(screen.getByRole('button', { name: 'Log in' }))

    await waitFor(() => expect(replace).toHaveBeenCalledWith('/anime/154587'))
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: 'prasad@example.com',
      password: 'secret123',
    })
    expect(refresh).toHaveBeenCalled()
  })
})

describe('safeNextPath', () => {
  it('only allows paths on this site', () => {
    expect(safeNextPath('/settings')).toBe('/settings')
    expect(safeNextPath('//evil.example.com')).toBe('/watchlist')
    expect(safeNextPath('https://evil.example.com')).toBe('/watchlist')
    expect(safeNextPath(null)).toBe('/watchlist')
  })
})
