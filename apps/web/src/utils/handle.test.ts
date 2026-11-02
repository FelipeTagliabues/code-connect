import { toHandle } from './handle.ts'

describe('toHandle', () => {
  it('deriva o @ do nome sem acentos, espaços ou maiúsculas', () => {
    expect(toHandle('Márcia  Ribeiro')).toBe('@marcia.ribeiro')
    expect(toHandle(' João ')).toBe('@joao')
  })
})
