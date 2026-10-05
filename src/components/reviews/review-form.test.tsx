import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReviewForm } from './review-form'

jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

describe('ReviewForm', () => {
  it('requires a rating and a review of at least 20 characters', async () => {
    const onSave = jest.fn()
    const user = userEvent.setup()
    render(<ReviewForm onSave={onSave} />)

    await user.type(screen.getByLabelText('Your review'), 'Too short')
    await user.click(screen.getByRole('button', { name: 'Post review' }))

    expect(await screen.findByText('Choose a rating')).toBeInTheDocument()
    expect(screen.getByText('Write at least 20 characters')).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('submits the rating and review text', async () => {
    const onSave = jest.fn().mockResolvedValue(null)
    const user = userEvent.setup()
    render(<ReviewForm onSave={onSave} />)

    await user.click(screen.getByRole('radio', { name: '9 out of 10' }))
    await user.type(
      screen.getByLabelText('Your review'),
      'Quiet, beautiful and surprisingly funny.',
    )
    await user.click(screen.getByRole('button', { name: 'Post review' }))

    await waitFor(() =>
      expect(onSave).toHaveBeenCalledWith({
        rating: 9,
        body: 'Quiet, beautiful and surprisingly funny.',
      }),
    )
    expect(screen.getByRole('radio', { name: '9 out of 10' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('pre-fills an existing review for editing', () => {
    render(
      <ReviewForm
        defaultValues={{ rating: 7, body: 'Good but slow in the middle part.' }}
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />,
    )
    expect(screen.getByLabelText('Your review')).toHaveValue('Good but slow in the middle part.')
    expect(screen.getByRole('button', { name: 'Update review' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })
})
