import { render, screen } from '@testing-library/react'
import { Label } from './Label.tsx'

describe('Label', () => {
  it('associa o texto ao campo via htmlFor', () => {
    render(
      <>
        <Label htmlFor="email">Email</Label>
        <input id="email" />
      </>,
    )
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'email')
  })
})
