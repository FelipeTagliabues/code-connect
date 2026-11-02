export const SEED_PASSWORD = 'senha12345';

export const seedAuthors = [
  { name: 'Julio Andrade', email: 'julio@codeconnect.dev' },
  { name: 'Marcia Ribeiro', email: 'marcia@codeconnect.dev' },
  { name: 'Gabriel Luz', email: 'gabriel.luz@codeconnect.dev' },
  { name: 'Marcela Lins', email: 'marcela.lins@codeconnect.dev' },
  { name: 'Renata Prado', email: 'renata@codeconnect.dev' },
  { name: 'Otavio Campos', email: 'otavio@codeconnect.dev' },
];

/** Reproduz o placeholder quando a imagem existe no banco, mas falha ao carregar. */
export const BROKEN_THUMBNAIL_URL = '/posts/imagem-que-nao-existe.png';

export const seedPosts = [
  {
    title: 'Cards responsivos só com CSS Grid',
    description:
      'Uma galeria que reorganiza as colunas sozinha, sem nenhuma media query, usando auto-fit e minmax.',
    tags: ['CSS', 'Front-end', 'Responsividade'],
    code: `.galeria {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}`,
  },
  {
    title: 'Hook para debounce em buscas com React',
    description:
      'Evite uma requisição a cada tecla: um hook pequeno que atrasa a atualização do valor enquanto a pessoa digita.',
    tags: ['React', 'Front-end', 'Hooks'],
    code: `function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}`,
  },
  {
    title: 'Botões acessíveis com foco visível',
    description:
      'Como manter o contorno de foco para quem navega pelo teclado, sem mostrá-lo a cada clique do mouse.',
    tags: ['Acessibilidade', 'CSS', 'Front-end'],
    code: `button:focus-visible {
  outline: 2px solid #81fe88;
  outline-offset: 2px;
}`,
  },
  {
    title: 'Busca full text com Postgres',
    description:
      'Antes de adicionar um serviço de busca, experimente o que o banco já oferece: tsvector, ranking e índice GIN.',
    tags: ['Postgres', 'SQL', 'Back-end'],
    code: `SELECT title, ts_rank(search_vector, query) AS rank
FROM posts, websearch_to_tsquery('portuguese', 'react hooks') AS query
WHERE search_vector @@ query
ORDER BY rank DESC;`,
  },
  {
    title: 'Composição de funções em JavaScript',
    description:
      'Pequenas funções puras combinadas com reduce deixam transformações de dados muito mais fáceis de ler.',
    tags: ['JavaScript', 'Funcional'],
    code: `const compose = (...fns) => (value) =>
  fns.reduceRight((result, fn) => fn(result), value)

const slug = compose(hifenizar, minusculas, aparar)`,
  },
  {
    title: 'Tipos utilitários que uso todo dia no TypeScript',
    description:
      'Pick, Omit e Partial evitam repetir declarações e mantêm os tipos derivados de uma única fonte.',
    tags: ['TypeScript', 'Front-end'],
    code: `type Usuario = { id: string; nome: string; senha: string }

type UsuarioPublico = Omit<Usuario, 'senha'>
type AtualizacaoDeUsuario = Partial<Pick<Usuario, 'nome'>>`,
  },
  {
    title: 'Validação de DTOs no NestJS',
    description:
      'Com class-validator, a requisição é rejeitada antes de chegar ao serviço, e a mensagem de erro sai consistente.',
    tags: ['NestJS', 'Back-end', 'TypeScript'],
    code: `export class CriarPostDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  titulo: string
}`,
  },
  {
    title: 'Animações suaves só com transform e opacity',
    description:
      'Essas duas propriedades não disparam layout. Prefira-as para manter a animação fluida, inclusive em celulares simples.',
    tags: ['CSS', 'Performance', 'Front-end'],
    code: `.card {
  transition: transform 200ms ease, opacity 200ms ease;
}

.card:hover {
  transform: translateY(-4px);
}`,
  },
  {
    title: 'Formulários sem biblioteca em React',
    description:
      'Para formulários simples, estado controlado e FormData resolvem bem sem adicionar uma dependência ao projeto.',
    tags: ['React', 'Formulários'],
    code: `function handleSubmit(event) {
  event.preventDefault()
  const dados = Object.fromEntries(new FormData(event.currentTarget))
  enviar(dados)
}`,
  },
  {
    title: 'Paginação por página ou por cursor?',
    description:
      'Offset é simples e permite pular páginas. Cursor é estável em listas que mudam muito. Veja quando escolher cada um.',
    tags: ['API', 'Back-end', 'SQL'],
    code: `SELECT id, title
FROM posts
WHERE created_at < $1
ORDER BY created_at DESC
LIMIT 20;`,
  },
  {
    title: 'Contraste de cores que passa na WCAG',
    description:
      'Um script curto que calcula a razão de contraste entre duas cores, para conferir o tema durante o desenvolvimento.',
    tags: ['Acessibilidade', 'Design', 'JavaScript'],
    code: `const razaoDeContraste = (a, b) => {
  const [clara, escura] = [luminancia(a), luminancia(b)].sort((x, y) => y - x)
  return (clara + 0.05) / (escura + 0.05)
}`,
  },
  {
    title: 'Testando componentes pelo que a pessoa vê',
    description:
      'Consultas por papel e por nome acessível tornam o teste mais resistente a refatorações, e ainda revelam falhas de acessibilidade.',
    tags: ['Testes', 'React', 'Acessibilidade'],
    code: `render(<Botao>Enviar</Botao>)

await userEvent.click(screen.getByRole('button', { name: 'Enviar' }))`,
  },
  {
    title: 'Docker Compose para o ambiente de desenvolvimento',
    description:
      'Um banco de dados no ar com um único comando, com volume nomeado para não perder os dados entre reinicializações.',
    tags: ['Docker', 'DevOps', 'Postgres'],
    code: `services:
  postgres:
    image: postgres:18
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql`,
  },
  {
    title: 'Evitando N+1 em consultas com relações',
    description:
      'Buscar as relações em um único passo, com join ou inArray, reduz dezenas de consultas a uma ou duas.',
    tags: ['SQL', 'Performance', 'Back-end'],
    code: `const respostas = await db
  .select()
  .from(comentarios)
  .where(inArray(comentarios.paiId, ids))`,
  },
  {
    title: 'Tema escuro com variáveis CSS',
    description:
      'Separar a paleta dos papéis semânticos facilita trocar o tema sem precisar mexer nos componentes.',
    tags: ['CSS', 'Design', 'Front-end'],
    code: `:root {
  --cor-fundo: var(--grafite);
  --cor-destaque: var(--verde);
}`,
  },
  {
    title: 'Migrations sem dor de cabeça com Drizzle',
    description:
      'O schema em TypeScript é a fonte da verdade, e o SQL gerado fica versionado junto com o código.',
    tags: ['Drizzle', 'Postgres', 'TypeScript'],
    code: `export const posts = pgTable('posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 120 }).notNull(),
})`,
  },
  {
    title: 'AbortController em requisições do React',
    description:
      'Cancele a requisição anterior quando o filtro mudar, assim uma resposta antiga nunca sobrescreve a mais recente.',
    tags: ['React', 'JavaScript', 'Hooks'],
    code: `useEffect(() => {
  const controller = new AbortController()
  buscar(termo, controller.signal).then(setResultado)
  return () => controller.abort()
}, [termo])`,
  },
  {
    title: 'Por que usar semântica HTML antes de ARIA',
    description:
      'Um botão de verdade já traz foco, teclado e papel acessível. ARIA só deve complementar o que o HTML não resolve.',
    tags: ['Acessibilidade', 'HTML'],
    code: null,
  },
  {
    title: 'Componentes em Atomic Design na prática',
    description:
      'Como decidir entre átomo, molécula e organismo sem transformar a estrutura de pastas em um debate sem fim.',
    tags: ['Design', 'React', 'Arquitetura'],
    code: null,
  },
  {
    title: 'Revisão de código que ajuda de verdade',
    description:
      'Comentários objetivos, perguntas no lugar de ordens, e automação para tudo o que um linter consegue apontar sozinho.',
    tags: ['Carreira', 'Boas práticas'],
    code: null,
  },
  {
    title: 'Primeiros passos com autenticação JWT',
    description:
      'O que vai dentro do token, por que ele precisa expirar e o que muda quando o usuário é removido do banco.',
    tags: ['Back-end', 'Segurança', 'NestJS'],
    code: `const token = await jwtService.signAsync({
  sub: usuario.id,
  email: usuario.email,
})`,
  },
  {
    title: 'Upload de imagens com validação',
    description:
      'A extensão e o mimetype vêm do cliente. Para saber o tipo real do arquivo, confira os primeiros bytes.',
    tags: ['Back-end', 'Segurança', 'API'],
    code: `const ehPng = (buffer) =>
  buffer.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]))`,
  },
  {
    title: 'Curadoria de bibliotecas para um projeto novo',
    description:
      'Cada dependência é mais uma coisa para manter. Veja os critérios que uso antes de adicionar um pacote ao projeto.',
    tags: ['Carreira', 'Boas práticas', 'Arquitetura'],
    code: null,
  },
  {
    title: 'Grid de 12 colunas com Tailwind',
    description:
      'Layouts complexos com poucas classes utilitárias, e os tokens do tema garantindo consistência entre as telas.',
    tags: ['Tailwind', 'CSS', 'Front-end'],
    code: `<div class="grid grid-cols-12 gap-6">
  <aside class="col-span-3">Menu</aside>
  <main class="col-span-9">Conteúdo</main>
</div>`,
  },
];

export const seedComments = [
  'Achei muito bom seu código, parabéns!',
  'Quanto tempo você levou para finalizar esse projeto?',
  'Espero chegar um dia nesse nível! Muito bom!',
  'Salvei aqui para testar no meu projeto.',
  'Não conhecia essa abordagem, valeu por compartilhar!',
];

export const seedReplies = [
  'Até que foi rápido, uns 3 dias!',
  'Obrigado! Se precisar de ajuda é só falar.',
  'Boa! Depois me conta o resultado.',
];
