import { useNavigate } from 'react-router'
import { useSession } from '../../hooks/useSession.ts'
import { signOut } from '../../services/auth.ts'
import { Logo } from '../atoms/Logo.tsx'
import { TextLink } from '../atoms/TextLink.tsx'
import { MenuItem } from '../molecules/MenuItem.tsx'

/**
 * Um único DOM para os três tamanhos: coluna lateral a partir de `xl`; abaixo disso,
 * logo e Publicar no topo e a navegação fixa no rodapé, como no Figma.
 */
export function SideMenu() {
  const navigate = useNavigate()
  const { isAuthenticated } = useSession()

  function handleSignOut() {
    signOut()
    void navigate('/feed')
  }

  return (
    <header className="flex shrink-0 flex-col items-center gap-6 md:flex-row md:justify-between xl:w-44 xl:flex-col xl:justify-start xl:gap-20 xl:rounded-lg xl:bg-card xl:px-4 xl:py-10">
      <Logo />
      <div className="flex w-full flex-col items-center gap-10 md:w-auto xl:w-full">
        <TextLink variant="button" to="/publicar" className="w-full md:w-auto xl:w-full">
          Publicar
        </TextLink>
        <nav
          aria-label="Principal"
          className="fixed inset-x-0 bottom-0 z-10 flex items-center justify-between rounded-t-lg bg-card px-4 py-3 whitespace-nowrap md:px-15 md:py-5 xl:static xl:flex-col xl:gap-10 xl:rounded-none xl:bg-transparent xl:p-0"
        >
          <MenuItem icon="feed" label="Feed" to="/feed" />
          {isAuthenticated && <MenuItem icon="account-circle" label="Perfil" />}
          <MenuItem icon="info" label="Sobre nós" />
          {isAuthenticated ? (
            <MenuItem icon="logout" label="Sair" onClick={handleSignOut} />
          ) : (
            <MenuItem icon="login" label="Login" to="/login" />
          )}
        </nav>
      </div>
    </header>
  )
}
